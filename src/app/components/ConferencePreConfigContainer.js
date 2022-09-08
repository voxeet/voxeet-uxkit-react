import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import { Actions as InputManagerActions } from "../actions/InputManagerActions";
import PropTypes from "prop-types";
import Cookies from "./../libs/Storage";
import bowser from "bowser";
import PreConfigVuMeter from "./preConfig/PreConfigVuMeter";
import { strings } from "../languages/localizedStrings.js";
import { getVideoDeviceName, getDevice } from "../libs/getVideoDeviceName";
import { isElectron, isMobile } from "../libs/browserDetection";
import { getUxKitContext } from "../context";

const today = new Date();
today.setDate(today.getDate() + 365);
const default_cookies_param = {
  path: "/",
  expires: today,
  secure: true,
  sameSite: "none",
};

@connect(
  (store) => {
    return {
      inputManager: store.voxeet.inputManager,
      controlsStore: store.voxeet.controls,
    };
  },
  null,
  null,
  { context: getUxKitContext() }
)
class ConferencePreConfigContainer extends Component {
  constructor(props) {
    super(props);
    // defaults
    let maxVideoForwarding =
      this.props.controlsStore.maxVideoForwarding !== undefined
        ? this.props.controlsStore.maxVideoForwarding
        : isMobile()
        ? 4
        : 9;
    let audioTransparentMode =
      this.props.controlsStore.audioTransparentMode !== undefined
        ? this.props.controlsStore.audioTransparentMode
        : false;
    let videoEnabled =
      this.props.controlsStore.videoEnabled !== undefined
        ? this.props.controlsStore.videoEnabled
        : this.props.constraints
        ? this.props.constraints.video
        : false;
    let lowBandwidthMode = !videoEnabled && !maxVideoForwarding;
    let virtualBackgroundMode =
      this.props.controlsStore.virtualBackgroundMode !== undefined
        ? this.props.controlsStore.virtualBackgroundMode
        : null;
    let videoDenoise =
      this.props.controlsStore.videoDenoise !== undefined
        ? this.props.controlsStore.videoDenoise
        : false;

    this.state = {
      loading: true,
      lockJoin: false,
      audioDeviceSelected: null,
      videoDeviceSelected: null,
      outputDeviceSelected: null,
      audioDevices: [],
      videoDevices: [],
      outputDevices: [],
      userVideoStream: null,
      userAudioStream: null,
      error: null,
      level: 0,
      videoEnabled: videoEnabled,
      audioEnabled: true,
      audioTransparentMode: audioTransparentMode,
      maxVideoForwarding: maxVideoForwarding,
      lowBandwidthMode: lowBandwidthMode,
      virtualBackgroundMode: virtualBackgroundMode,
      videoDenoise: videoDenoise,
    };
    this.setAudioDevice = this.setAudioDevice.bind(this);
    this.setVideoDevice = this.setVideoDevice.bind(this);
    this.setOutputDevice = this.setOutputDevice.bind(this);
    this.handleVideoEnabledChanged = this.handleVideoEnabledChanged.bind(this);
    this.handleChangeLowBandwidthMode =
      this.handleChangeLowBandwidthMode.bind(this);
    this.handleMaxVideoForwardingChange =
      this.handleMaxVideoForwardingChange.bind(this);
    this.handleJoin = this.handleJoin.bind(this);
    this.releaseAudioStream = this.releaseAudioStream.bind(this);
    this.releaseVideoStream = this.releaseVideoStream.bind(this);
    this.onDeviceChange = this.onDeviceChange.bind(this);
    this.handleAudioTransparentModeChange =
      this.handleAudioTransparentModeChange.bind(this);
    this.handleVirtualBackgroundModeChange =
      this.handleVirtualBackgroundModeChange.bind(this);
    this.handleVideoDenoiseChange = this.handleVideoDenoiseChange.bind(this);
    this.attachMediaStream = this.attachMediaStream.bind(this);
    this.maxVFTimer = null;
    this.onVideoStarted = this.onVideoStarted.bind(this);
  }

  componentDidMount() {
    this.init()
      .then(() => {
        navigator.mediaDevices.addEventListener(
          "devicechange",
          this.onDeviceChange
        );
      });

      VoxeetSDK.video.local.on('videoStarted', this.onVideoStarted);
  }

  componentWillUnmount() {
    navigator.mediaDevices.removeEventListener(
      "devicechange",
      this.onDeviceChange
    );

    VoxeetSDK.video.local.removeListener('videoStarted', this.onVideoStarted);

    this.releaseAudioStream().then(() => this.releaseVideoStream());
  }

  reportError(error) {
    console.error(error);
  }

  onVideoStarted(videoTrack) {
    const stream = this.state.userVideoStream;
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks && videoTracks[0]) {
        stream.removeTrack(videoTracks[0]);
      }
      stream.addTrack(videoTrack);
    }
  }

  onDeviceChange() {
    this.releaseAudioStream()
      .then(() => this.releaseVideoStream())
      .then(() => {
        this.setState(
          {
            error: null,
            loading: true,
          },
          () => {
            this.init();
          }
        );
      });
  }

  handleJoin() {
    const { handleJoin, constraints } = this.props;
    constraints.video = this.state.videoEnabled;
    const payload = {
      audioDeviceSelected: this.state.audioDeviceSelected,
      videoDeviceSelected: this.state.videoDeviceSelected,
      outputDeviceSelected: this.state.outputDeviceSelected,
      videoEnabled: this.state.videoEnabled,
      constraints,
      audioEnabled: this.state.audioEnabled,
      audioTransparentMode: this.state.audioTransparentMode,
      maxVideoForwarding: this.state.maxVideoForwarding,
      virtualBackgroundMode: this.state.virtualBackgroundMode,
      videoDenoise: this.state.videoDenoise,
    };
    handleJoin(payload);
  }

  attachMediaStream(stream) {
    if (VoxeetSDK.videoFilters && isElectron() && stream) {
      // Skip setFilter if not supported in SDK or not in NDS
      let tracks = stream.getVideoTracks();
      if (tracks && tracks[0]) {
        switch (this.state.virtualBackgroundMode) {
          case "bokeh":
          case "staticimage":
            VoxeetSDK.videoFilters.setFilter(this.state.virtualBackgroundMode, {
              stream: tracks[0],
              videoDenoise: this.state.videoDenoise,
            });
            break;
          default:
            VoxeetSDK.videoFilters.setFilter("none", {
              stream: tracks[0],
              videoDenoise: this.state.videoDenoise,
            });
        }
      }
    }

    navigator.attachMediaStream(this.video, stream);
  }

  async releaseVideoStream() {
    if (this.state.userVideoStream) {
      await VoxeetSDK.video.local.stop();

      this.setState({
        userVideoStream: null,
      });
    }
  }

  async releaseAudioStream() {
    if (this.state.userAudioStream) {
      this.state.userAudioStream.getTracks().forEach((track) => {
        track.stop();
      });

      this.setState({
        userAudioStream: null,
      });
    }
  }

  restartCamera() {
    let audioConstraints = false;
    if (this.state.audioDeviceSelected != null) {
      audioConstraints = {
        deviceId: { exact: this.state.audioDeviceSelected.deviceId },
      };
    }

    let videoConstraints = false;
    if (this.state.videoDeviceSelected != null) {
      videoConstraints = {
        deviceId: { exact: this.state.videoDeviceSelected.deviceId },
      };
    }

    return navigator.mediaDevices.getUserMedia({audio: audioConstraints, video: false})
      .then((audioStream) => {
        const processor = this.state.virtualBackgroundMode === 'bokeh' ? { type: this.state.virtualBackgroundMode } : null;
        return VoxeetSDK.video.local.start(videoConstraints, processor)
          .then((videoTrack) => new MediaStream([videoTrack]))
          .then((videoStream) => {
            this.attachMediaStream(videoStream);
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
              return navigator.mediaDevices.enumerateDevices().then((sources) => {
                let resultVideo = [];
                /* GET SOURCES */
                sources.forEach((source) => {
                  if (source.kind === "videoinput" && source.deviceId !== "") {
                    resultVideo.push(source);
                  }
                });
    
                this.setState({ userVideoStream: videoStream, userAudioStream: audioStream, videoDevices: resultVideo, });
              });
            }
          });
      })
      .catch((error) => {
        this.reportError(error.message);
        this.setState({ videoEnabled: false });
      });
  }

  async setAudioDevice(e) {
    const device = e.target.value ? await getDevice(e.target.value) : {};
    await this.releaseAudioStream();
    this.setState({ lockJoin: true });

    const audioStream = await navigator.mediaDevices.getUserMedia({audio: { deviceId: { exact: device.deviceId } }, video: false});

    this.props.dispatch(InputManagerActions.inputAudioChange(device));

    this.setState({
      audioDeviceSelected: device,
      userAudioStream: audioStream,
      lockJoin: false,
    });

    Cookies.setDevice("input", device, default_cookies_param);
  }

  async setOutputDevice(e) {
    const device = e.target.value ? await getDevice(e.target.value) : {};

    this.props.dispatch(InputManagerActions.outputAudioChange(device));
    
    this.setState({
      outputDeviceSelected: device,
    });

    Cookies.setDevice("output", device, default_cookies_param);
  }

  async setVideoDevice(e) {
    const device = e.target.value ? await getDevice(e.target.value) : {};
    console.log('setVideoDevice', device);
    await this.releaseVideoStream();
    this.setState({ lockJoin: true });
    
    const processor = this.state.virtualBackgroundMode == 'bokeh' ? { type: this.state.virtualBackgroundMode } : null;
    const videoStream = await VoxeetSDK.video.local.start({ deviceId: { exact: device.deviceId } }, processor).then((videoTrack) => new MediaStream([videoTrack]));

    getVideoDeviceName(device.deviceId).then((isBackCamera) => {
      this.props.dispatch(
        InputManagerActions.inputVideoChange(device, isBackCamera)
      );
    });

    this.setState({
      videoDeviceSelected: device,
      userVideoStream: videoStream,
      lockJoin: false,
    });

    Cookies.setDevice("camera", device, default_cookies_param);

    this.attachMediaStream(videoStream);
  }

  async init() {
    let resultAudio = [];
    let resultVideo = [];
    let resultAudioOutput = [];
    let videoCookieExist = false;
    let outputCookieExist = false;
    let inputCookieExist = false;
    if (this.state.userVideoStream) await this.releaseVideoStream();
    if (this.state.userAudioStream) await this.releaseAudioStream();
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(function (sources) {
          /* GET SOURCES */
          sources.forEach((source) => {
            if (source.kind === "videoinput" && source.deviceId !== "") {
              const device = Cookies.getDevice("camera");
              if (device && device.deviceId === source.deviceId) videoCookieExist = true;
              resultVideo.push(source);
            }
            if (source.kind === `audioinput` && source.deviceId !== "") {
              const device = Cookies.getDevice("input");
              if (device && device.deviceId === source.deviceId) inputCookieExist = true;
              resultAudio.push(source);
            }
            if (source.kind === "audiooutput" && source.deviceId !== "") {
              const device = Cookies.getDevice("output");
              if (device && device.deviceId === source.deviceId) outputCookieExist = true;
              resultAudioOutput.push(source);
            }
          });
        })
        .then(() => {
          if (resultAudio.length > 0) {
            Promise.resolve()
              .then(() => {
                return navigator.mediaDevices
                  .getUserMedia({
                    audio: true,
                    video: this.state.videoEnabled && resultVideo.length > 0,
                  })
                  .catch((error) => {
                    console.warn(
                      "Could not get audio or video",
                      error && error.message
                    );
                    // Try audio only
                    return navigator.mediaDevices
                      .getUserMedia({
                        audio: true,
                        video: false,
                      })
                      .then((stream) => {
                        // Disable video
                        this.setState({
                          videoEnabled: false,
                          error: strings.errorPermissionDeniedMicrophoneCamera,
                          loading: false,
                        });
                        return stream;
                      });
                  });
              })
              .then((stream) => {
                resultAudio = [];
                resultVideo = [];
                resultAudioOutput = [];
                navigator.mediaDevices.enumerateDevices()
                  .then((sources) => {
                    let videoCookieExist = false;
                    let outputCookieExist = false;
                    let inputCookieExist = false;

                    /* GET SOURCES */
                    sources.forEach((source) => {
                      if (
                        source.kind === "videoinput" &&
                        source.deviceId !== ""
                      ) {
                        const device = Cookies.getDevice("camera");
                        if (device && device.deviceId === source.deviceId)
                          videoCookieExist = true;
                        resultVideo.push(source);
                      }
                      if (
                        source.kind === `audioinput` &&
                        source.deviceId !== ""
                      ) {
                        const device = Cookies.getDevice("input");
                        if (device && device.deviceId === source.deviceId)
                          inputCookieExist = true;
                        resultAudio.push(source);
                      }
                      if (
                        source.kind === "audiooutput" &&
                        source.deviceId !== ""
                      ) {
                        const device = Cookies.getDevice("output");
                        if (device && device.deviceId === source.deviceId)
                          outputCookieExist = true;
                        resultAudioOutput.push(source);
                      }
                    });

                    /* OUTPUT AUDIO MANAGEMENT */
                    if (
                      bowser.chrome &&
                      resultAudioOutput &&
                      resultAudioOutput.length > 0
                    ) {
                      let selected_device = resultAudioOutput.find(
                        (device) => device.deviceId === "default"
                      );
                      if (!selected_device)
                        selected_device = resultAudioOutput[0];
                      if (!outputCookieExist) {
                        Cookies.setDevice(
                          "output",
                          selected_device,
                          default_cookies_param
                        );
                        this.props.dispatch(
                          InputManagerActions.outputAudioChange(selected_device)
                        );
                        this.setState({
                          outputDevices: resultAudioOutput,
                          outputDeviceSelected: selected_device.deviceId,
                        });
                      } else {
                        const device = Cookies.getDevice("output");
                        this.props.dispatch(
                          InputManagerActions.outputAudioChange(device)
                        );
                        this.setState({
                          outputDevices: resultAudioOutput,
                          outputDeviceSelected: device,
                        });
                      }
                    }

                    /* INPUT VIDEO MANAGEMENT */
                    let videoDevice;
                    if (resultVideo.length > 0) {
                      if (!videoCookieExist) {
                        videoDevice = resultVideo.find(
                          (device) => device.deviceId === "default"
                        );
                        if (!videoDevice) videoDevice = resultVideo[0];
                        Cookies.setDevice(
                          "camera",
                          videoDevice,
                          default_cookies_param
                        );
                      } else {
                        videoDevice = Cookies.getDevice("camera");
                      }

                      getVideoDeviceName(videoDevice.deviceId).then(
                        (isBackCamera) => {
                          this.props.dispatch(
                            InputManagerActions.inputVideoChange(videoDevice, isBackCamera)
                          );
                        }
                      );
                      this.setState({
                        videoDevices: resultVideo,
                        videoDeviceSelected: videoDevice,
                      });
                    } else {
                      this.setState({ videoEnabled: false });
                    }

                    /* INPUT AUDIO MANAGEMENT */
                    if (resultAudio.length > 0) {
                      if (!inputCookieExist) {
                        let selected_device = resultAudio.find(
                          (device) => device.deviceId === "default"
                        );
                        if (!selected_device) selected_device = resultAudio[0];
                        Cookies.setDevice(
                          "input",
                          selected_device,
                          default_cookies_param
                        );
                        this.props.dispatch(
                          InputManagerActions.inputAudioChange(selected_device)
                        );
                        this.setState({
                          audioDevices: resultAudio,
                          audioDeviceSelected: selected_device,
                        });
                      } else {
                        const device = Cookies.getDevice("input");
                        this.props.dispatch(
                          InputManagerActions.inputAudioChange(device)
                        );
                        this.setState({
                          audioDevices: resultAudio,
                          audioDeviceSelected: device,
                        });
                      }
                    } else {
                      this.reportError(strings.noAudioDevice);
                      this.setState({
                        error: strings.noAudioDevice,
                        loading: false,
                      });
                    }

                    /* GETUSERMEDIA FROM PREVIOUS MANAGEMENT */
                    if (resultAudio.length > 0 && this.state.error == null) {
                      this.setState({ loading: false });
                      return navigator.mediaDevices.getUserMedia({audio: { deviceId: { exact: this.state.audioDeviceSelected.deviceId } }, video: false})
                        .then((audioStream) => {
                          if (this.state.videoEnabled) {
                            const videoConstraints = { deviceId: { exact: videoDevice.deviceId } };
                            const processor = this.state.virtualBackgroundMode === 'bokeh' ? { type: this.state.virtualBackgroundMode } : null;
                            return VoxeetSDK.video.local.start(videoConstraints, processor)
                              .then((videoTrack) => new MediaStream([videoTrack]))
                              .then((videoStream) => {
                                this.attachMediaStream(videoStream);
                                this.setState({ userAudioStream: audioStream, userVideoStream: videoStream, });
                                this.forceUpdate();
                              });
                          } else {
                            this.setState({ userAudioStream: audioStream });
                            this.forceUpdate();
                          }
                        });
                    } else {
                      this.reportError("No input device detected");
                      console.error("No input device detected");
                    }
                  })
                  .then(() => {
                    stream.getTracks().forEach((track) => {
                      track.stop();
                    });
                  });
              })
              .catch((error) => {
                if (this.state.videoEnabled) {
                  this.reportError(
                    strings.errorPermissionDeniedMicrophoneCamera
                  );
                  this.setState({
                    error: strings.errorPermissionDeniedMicrophoneCamera,
                    loading: false,
                  });
                } else {
                  this.reportError(strings.errorPermissionDeniedMicrophone);
                  this.setState({
                    error: strings.errorPermissionDeniedMicrophone,
                    loading: false,
                  });
                }
              });
          } else {
            this.reportError(strings.noAudioDevice);
            this.setState({ error: strings.noAudioDevice, loading: false });
          }
        });
    }
  }

  attachSinkId(sinkId) {
    const element = document.getElementById("outputTester");
    element.setSinkId(sinkId).catch((error) => {
      this.reportError(err.message);
    });
  }

  handleChangeLowBandwidthMode(event) {
    if (this.maxVFTimer) {
      clearTimeout(this.maxVFTimer);
      this.maxVFTimer = null;
    }
    const low_bandwidth = event.target.checked;
    let maxVideoForwarding = low_bandwidth
      ? 0
      : Cookies.get("maxVideoForwarding") !== undefined
      ? Cookies.get("maxVideoForwarding")
      : isMobile()
      ? 4
      : 9;
    if (
      typeof maxVideoForwarding === "string" ||
      maxVideoForwarding instanceof String
    )
      maxVideoForwarding = parseInt(maxVideoForwarding);

    this.setState(
      {
        lowBandwidthMode: low_bandwidth,
        maxVideoForwarding: maxVideoForwarding,
      },
      () => {
        // Cookies.set("maxVideoForwarding", this.state.maxVideoForwarding, default_cookies_param);
        return this.switchVideoEnabled(!low_bandwidth);
      }
    );
  }

  async handleVideoEnabledChanged(event) {
    const target = event.target;
    const video_on = target.checked;

    return this.switchVideoEnabled(video_on);
  }

  async switchVideoEnabled(video_on) {
    if (!video_on && this.state.userVideoStream != null) {
      await VoxeetSDK.video.local.stop();

      this.video.srcObject = null;
      this.video.height = "0";
    }
    
    if (video_on) {
      let approved = this.state.videoDevices.length > 0;
      if (this.state.videoDevices.length === 0) {
        // ask for video permission
        approved = await navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => {
              track.stop();
            });
            return true;
          })
          .catch((err) => {
            this.reportError(err.message);
            return false;
          });
      }
      if (approved) {
        this.setState(
          {
            videoEnabled: video_on,
          },
          () => {
            Cookies.set("videoEnabled", video_on, default_cookies_param);
            this.init();
          }
        );
      }
    } else {
      if (this.state.videoDevices.length > 0) {
        this.setState(
          {
            videoEnabled: video_on,
          },
          () => {
            Cookies.set("videoEnabled", video_on, default_cookies_param);
            this.init();
          }
        );
      }
    }
  }

  handleAudioTransparentModeChange() {
    this.setState(
      {
        audioTransparentMode: !this.state.audioTransparentMode,
      },
      () => {
        Cookies.set(
          "audioTransparentMode",
          this.state.audioTransparentMode,
          default_cookies_param
        );
      }
    );
  }

  handleVirtualBackgroundModeChange(mode) {
    this.setState(
      {
        virtualBackgroundMode: mode !== this.state.virtualBackgroundMode ? mode : null,
      },
      () => {
          switch (this.state.virtualBackgroundMode) {
            case "bokeh":
              VoxeetSDK
                .video.local
                .setProcessor({type: 'bokeh'})
                .catch((e) => {
                  console.error(e);
                });

              Cookies.set(
                "virtualBackgroundMode",
                this.state.virtualBackgroundMode,
                default_cookies_param
              );

              break;
            case "staticimage":
              break;
            default:
              VoxeetSDK
                .video.local
                .disableProcessing()
                .catch((e) => {
                  console.error(e);
                });
              Cookies.set(
                "virtualBackgroundMode",
                "none",
                default_cookies_param
              );
          }
        }
    );
  }

  handleVideoDenoiseChange() {
    this.setState(
      {
        videoDenoise: !this.state.videoDenoise,
      },
      () => {
        if (!VoxeetSDK.videoFilters || !isElectron()) {
          // Skip if not supported in SDK or not in NDS
          return;
        }
        if (this.state.userVideoStream) {
          const videoFilter =
            ["none", "bokeh"].indexOf(this.state.virtualBackgroundMode) >= 0
              ? this.state.virtualBackgroundMode
              : "none";
          VoxeetSDK.videoFilters
            .setFilter(videoFilter, {
              stream: this.state.userVideoStream,
              videoDenoise: this.state.videoDenoise,
            })
            .then(() => {
              Cookies.set(
                "videoDenoise",
                this.state.videoDenoise,
                default_cookies_param
              );
            })
            .catch((e) => console.warn(e));
        }
      }
    );
  }

  handleMaxVideoForwardingChange(event) {
    if (this.maxVFTimer) {
      clearTimeout(this.maxVFTimer);
      this.maxVFTimer = null;
    }
    let num;
    try {
      num = parseInt(event.target.value);
    } catch (e) {}
    if (num !== undefined && !isNaN(num)) {
      this.setState({ maxVideoForwarding: num }, () => {
        this.maxVFTimer = setTimeout(() => {
          Cookies.set("maxVideoForwarding", num, default_cookies_param);
          clearTimeout(this.maxVFTimer);
          this.maxVFTimer = null;
        }, 1500);
      });
    } else {
      this.setState({ maxVideoForwarding: "" });
    }
  }

  renderLoading() {
    return React.createElement(this.props.loadingScreen, {
      logo: this.props.logo,
    });
  }

  render() {
    const { handleJoin, logo, dolbyVoiceEnabled } = this.props;
    const {
      audioEnabled,
      error,
      loading,
      maxVideoForwarding,
      lowBandwidthMode,
      virtualBackgroundMode,
    } = this.state;
    const MAX_MAXVF = isMobile() ? 4 : 16;

    return (
      <Fragment>
        {loading ? (
          this.renderLoading()
        ) : (
          <div id="vxt-widget-container" className="vxt-widget-modal">
            <aside className={"vxt-widget-container vxt-widget-fullscreen-on"}>
              <div
                id="conference-attendees"
                className={"vxt-conference-attendees vxt-conference-preconfig"}
              >
                <div className="settings-preconfig-container">
                  <div className="settings-preconfig">
                    {error == null ? (
                      <div className="content">
                        <h3>{strings.titlePreConfig}</h3>
                        <form>
                          <div className="content-second-container">
                            {!window.voxeetNodeModule && (
                              <div className="video" onClick={this.toggleVideo}>
                                <video
                                  className="video-participant"
                                  width="360"
                                  id="video-settings"
                                  playsInline
                                  height="280"
                                  ref={(ref) => (this.video = ref)}
                                  autoPlay
                                  muted
                                />
                              </div>
                            )}
                          </div>
                          <div className="form-group">
                            <label htmlFor="video">{strings.camera}</label>
                            <select
                              name="video"
                              value={
                                this.state.videoDeviceSelected != null
                                  ? this.state.videoDeviceSelected.deviceId
                                  : ""
                              }
                              className="form-control select-video-device"
                              disabled={!this.state.videoEnabled}
                              onChange={this.setVideoDevice}
                            >
                              {this.state.videoDevices.map((device, i) => (
                                <option key={i} value={device.deviceId}>
                                  {device.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="content-first-container">
                            {(bowser.chrome || isElectron()) && (
                              <div className="form-group">
                                <label htmlFor="video">{strings.output}</label>
                                <select
                                  name="output"
                                  className="form-control select-audio-output"
                                  value={
                                    this.state.outputDeviceSelected != null
                                      ? this.state.outputDeviceSelected.deviceId
                                      : ""
                                  }
                                  disabled={false}
                                  onChange={this.setOutputDevice}
                                >
                                  {this.state.outputDevices.map((device, i) => (
                                    <option key={i} value={device.deviceId}>
                                      {device.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                            {audioEnabled && (
                              <div>
                                <div className="form-group">
                                  <label htmlFor="video">{strings.input}</label>
                                  <select
                                    name="audio"
                                    className="form-control select-audio-input"
                                    value={
                                      this.state.audioDeviceSelected != null
                                        ? this.state.audioDeviceSelected.deviceId
                                        : ""
                                    }
                                    disabled={false}
                                    onChange={this.setAudioDevice}
                                  >
                                    {this.state.audioDevices.map(
                                      (device, i) => (
                                        <option key={i} value={device.deviceId}>
                                          {device.label}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </div>
                                <div className="form-group">
                                  <PreConfigVuMeter
                                    stream={this.state.userAudioStream}
                                    maxLevel={21}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="group-switch">
                            {dolbyVoiceEnabled && (
                              <div className="group-enable">
                                <div className="enable-item">
                                  <input
                                    id="audioTransparentMode"
                                    name="audioTransparentMode"
                                    type="checkbox"
                                    onChange={
                                      this.handleAudioTransparentModeChange
                                    }
                                    checked={this.state.audioTransparentMode}
                                  />
                                  <label htmlFor="audioTransparentMode">
                                    {strings.audioTransparentMode}
                                  </label>
                                </div>
                              </div>
                            )}
                            <div className="group-enable">
                              <div className="enable-item">
                                <input
                                  id="lowBandwidthMode"
                                  name="lowBandwidthMode"
                                  type="checkbox"
                                  onChange={this.handleChangeLowBandwidthMode}
                                  checked={lowBandwidthMode}
                                />
                                <label htmlFor="lowBandwidthMode">
                                  {strings.lowBandwidthMode}
                                </label>
                              </div>
                            </div>
                            <div
                              className={`group-enable ${
                                lowBandwidthMode ? "disabled-form" : ""
                              }`}
                            >
                              <div className="enable-item">
                                <input
                                  id="videoEnabled"
                                  name="videoEnabled"
                                  type="checkbox"
                                  onChange={this.handleVideoEnabledChanged}
                                  checked={
                                    !lowBandwidthMode
                                      ? this.state.videoEnabled
                                      : false
                                  }
                                />
                                <label htmlFor="videoEnabled">
                                  {strings.sendMyVideo}
                                </label>
                              </div>
                            </div>
                            {(bowser.chrome || isElectron()) && (
                              <div
                                className={`group-enable ${
                                  !this.state.videoEnabled
                                    ? "disabled-form"
                                    : ""
                                }`}
                              >
                                <div className="enable-item">
                                  <input
                                    id="virtualBackgroundMode"
                                    name="virtualBackgroundMode"
                                    type="checkbox"
                                    onChange={() => {
                                      this.handleVirtualBackgroundModeChange(
                                        "bokeh"
                                      );
                                    }}
                                    checked={virtualBackgroundMode === "bokeh"}
                                  />
                                  <label htmlFor="virtualBackgroundMode">
                                    {strings.bokehMode}
                                  </label>
                                </div>
                              </div>
                            )}
                            <div
                              className={`group-enable maxVideoForwarding ${
                                lowBandwidthMode ? "disabled-form" : ""
                              }`}
                            >
                              <div className="input-wrapper">
                                <div className="input-value">0</div>
                                <input
                                  type="range"
                                  style={{
                                    background: `linear-gradient(to right, #00afef 0%, #00afef ${
                                      (100 / MAX_MAXVF) *
                                      (!lowBandwidthMode
                                        ? maxVideoForwarding
                                        : 0)
                                    }%, #fff ${
                                      (100 / MAX_MAXVF) *
                                      (!lowBandwidthMode
                                        ? maxVideoForwarding
                                        : 0)
                                    }%, #fff 100%)`,
                                  }}
                                  id="maxVideoForwarding"
                                  name="maxVideoForwarding"
                                  min={0}
                                  max={MAX_MAXVF}
                                  step={1}
                                  onChange={this.handleMaxVideoForwardingChange}
                                  value={
                                    !lowBandwidthMode ? maxVideoForwarding : 0
                                  }
                                />
                                <div className="input-value">{MAX_MAXVF}</div>
                              </div>
                              <label htmlFor="maxVideoForwarding">
                                <div className="maxVideoForwardingValue">{`${
                                  strings.showVideoParticipants1
                                } ${
                                  !lowBandwidthMode ? maxVideoForwarding : 0
                                } ${strings.showVideoParticipants2}`}</div>
                              </label>
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              disabled={this.state.lockJoin}
                              className="start-conference"
                              onClick={this.handleJoin}
                            >
                              {strings.joincall}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="voxeet-loading-message-container">
                        <div className="voxeet-loading-center-container">
                          <div className="voxeet-loading-logo-container">
                            {logo != null ? (
                              <img src={logo} />
                            ) : (
                              <div className="ddloader" />
                            )}
                          </div>
                          <div className="voxeet-loading-info-container">
                            {error}
                          </div>
                          <div className="voxeet-loading-info-container">
                            <button
                              className={"retry-devices"}
                              onClick={this.onDeviceChange}
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </Fragment>
    );
  }
}

ConferencePreConfigContainer.propTypes = {
  handleJoin: PropTypes.func.isRequired,
  constraints: PropTypes.object.isRequired,
  loadingScreen: PropTypes.func,
  logo: PropTypes.string,
  dolbyVoiceEnabled: PropTypes.bool,
  videoEnabled: PropTypes.bool,
  audioTransparentMode: PropTypes.bool,
  maxVideoForwarding: PropTypes.bool,
  virtualBackgroundMode: PropTypes.string,
  videoDenoise: PropTypes.bool,
};

export default ConferencePreConfigContainer;