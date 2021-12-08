import React, { Fragment, Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import { Actions as InputManagerActions } from "../actions/InputManagerActions";
import AttendeesParticipantVideo from "./attendees/AttendeesParticipantVideo";
import PropTypes from "prop-types";
import Cookies from "./../libs/Storage";
import bowser from "bowser";
import PreConfigVuMeter from "./preConfig/PreConfigVuMeter";
import { strings } from "../languages/localizedStrings.js";
import { getVideoDeviceName } from "./../libs/getVideoDeviceName";
import {isMobile, isElectron} from "../libs/browserDetection";

var today = new Date();
today.setDate(today.getDate() + 365);
const default_cookies_param = {
  path: "/",
  expires: today,
  secure: true,
  sameSite: 'none'
};

@connect(store => {
  return {
    inputManager: store.voxeet.inputManager,
    controlsStore: store.voxeet.controls
  };
})
class ConferencePreConfigContainer extends Component {
  constructor(props) {

    super(props);
    // defaults
    let maxVideoForwarding = ((this.props.controlsStore.maxVideoForwarding !== undefined) ? this.props.controlsStore.maxVideoForwarding : isMobile()?4:9);
    let audioTransparentMode = ((this.props.controlsStore.audioTransparentMode !== undefined) ? this.props.controlsStore.audioTransparentMode : false);
    let videoEnabled = ((this.props.controlsStore.videoEnabled !== undefined) ?
        this.props.controlsStore.videoEnabled :
        (this.props.constraints? this.props.constraints.video: false));
    let lowBandwidthMode = !videoEnabled && !maxVideoForwarding
    let virtualBackgroundMode = ((this.props.controlsStore.virtualBackgroundMode !== undefined) ? this.props.controlsStore.virtualBackgroundMode : null);

    this.state = {
      loading: true,
      lockJoin: false,
      audioDeviceSelected: null,
      videoDeviceSelected: null,
      outputDeviceSelected: null,
      audioDevices: [],
      videoDevices: [],
      outputDevices: [],
      userStream: null,
      error: null,
      level: 0,
      videoEnabled: videoEnabled,
      audioEnabled: true,
      audioTransparentMode: audioTransparentMode,
      maxVideoForwarding: maxVideoForwarding,
      lowBandwidthMode: lowBandwidthMode,
      virtualBackgroundMode
    };
    this.setAudioDevice = this.setAudioDevice.bind(this);
    this.setVideoDevice = this.setVideoDevice.bind(this);
    this.setOutputDevice = this.setOutputDevice.bind(this);
    this.handleVideoEnabledChanged = this.handleVideoEnabledChanged.bind(this);
    this.handleChangeLowBandwidthMode = this.handleChangeLowBandwidthMode.bind(this);
    this.handleMaxVideoForwardingChange = this.handleMaxVideoForwardingChange.bind(this);
    this.handleJoin = this.handleJoin.bind(this);
    this.releaseStream = this.releaseStream.bind(this);
    this.onDeviceChange = this.onDeviceChange.bind(this);
    this.handleAudioTransparentModeChange = this.handleAudioTransparentModeChange.bind(this);
    this.handleVirtualBackgroundModeChange = this.handleVirtualBackgroundModeChange.bind(this);
    this.attachMediaStream = this.attachMediaStream.bind(this);
    this.maxVFTimer = null;
  }

  componentDidMount() {
    this.init();
    navigator.mediaDevices.addEventListener('devicechange', this.onDeviceChange);
  }

  componentWillUnmount() {
    navigator.mediaDevices.removeEventListener('devicechange', this.onDeviceChange);
    this.releaseStream();
  }

  reportError(error) {
    console.error(error);
  }

  onDeviceChange() {
    this.releaseStream();

    this.setState({
      error: null,
      loading: true
    }, () => {
      this.init();
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
      virtualBackgroundMode: this.state.virtualBackgroundMode
    };
    handleJoin(payload);
  }

  attachMediaStream(stream){
    if(stream){
      let tracks = stream.getVideoTracks();
      if(VoxeetSDK.videoFilters && tracks && tracks[0]) {
        switch (this.state.virtualBackgroundMode) {
          case 'bokeh':
            VoxeetSDK.videoFilters.setFilter('bokeh', {stream: tracks[0]});
            break;
          default:
            VoxeetSDK.videoFilters.setFilter('none', {stream: tracks[0]});
        }
      }
    }
    navigator.attachMediaStream(this.video, stream);
  }

  releaseStream() {
    if (this.state.userStream) {
      this.state.userStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }

  restartCamera() {
    let videoConstraints = false;
    if (this.state.videoDeviceSelected != null)
      videoConstraints = {
        deviceId: { exact: this.state.videoDeviceSelected }
      };
    return navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: { exact: this.state.audioDeviceSelected } },
        video: videoConstraints
      })
      .then(stream => {
        this.attachMediaStream(stream);
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          return navigator.mediaDevices.enumerateDevices().then(sources => {
            let resultVideo = new Array();
            /* GET SOURCES */
            sources.forEach(source => {
              if (source.kind === "videoinput" && source.deviceId != "") {
                resultVideo.push(source);
              }
            });

            this.setState({ userStream: stream, videoDevices: resultVideo });
          });
        }
      })
      .catch(error => {
        this.reportError(error.message);
        this.setState({ videoEnabled: false });
      });
  }

  setAudioDevice(e) {
    this.releaseStream();
    this.setState({ lockJoin: true });
    const deviceId = e.target.value;
    let videoConstraints = false;
    if (this.state.videoDeviceSelected != null && this.state.videoEnabled)
      videoConstraints = {
        deviceId: { exact: this.state.videoDeviceSelected }
      };
    navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: videoConstraints
      })
      .then(stream => {
        this.props.dispatch(InputManagerActions.inputAudioChange(deviceId));
        this.setState({
          audioDeviceSelected: deviceId,
          userStream: stream,
          lockJoin: false
        });
        Cookies.set("input", deviceId, default_cookies_param);
        if (this.state.videoDeviceSelected != null)
          this.attachMediaStream(stream);
      });
  }

  setOutputDevice(e) {
    const deviceId = e.target.value;
    this.props.dispatch(InputManagerActions.outputAudioChange(deviceId));
    Cookies.set("output", deviceId, default_cookies_param);
    this.setState({ outputDeviceSelected: deviceId });
  }

  setVideoDevice(e) {
    this.releaseStream();
    this.setState({ lockJoin: true });
    const deviceId = e.target.value;
    navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: { exact: this.state.audioDeviceSelected } },
        video: { deviceId: { exact: deviceId } }
      })
      .then(stream => {
        getVideoDeviceName(deviceId)
          .then((isBackCamera) => {
            this.props.dispatch(InputManagerActions.inputVideoChange(deviceId, isBackCamera))
          })
        this.setState({
          videoDeviceSelected: deviceId,
          userStream: stream,
          lockJoin: false
        });
        Cookies.set("camera", deviceId, default_cookies_param);
        this.attachMediaStream(stream);
      });
  }

  init() {
    let resultAudio = new Array();
    let resultVideo = new Array();
    let resultAudioOutput = new Array();
    let videoCookieExist = false;
    let outputCookieExist = false;
    let inputCookieExist = false;
    if (this.state.userStream) this.releaseStream();
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(function (sources) {
          /* GET SOURCES */
          sources.forEach(source => {
            if (source.kind === "videoinput" && source.deviceId != "") {
              if (Cookies.get("camera") == source.deviceId)
                videoCookieExist = true;
              resultVideo.push(source);
            }
            if (source.kind === `audioinput` && source.deviceId != "") {
              if (Cookies.get("input") == source.deviceId)
                inputCookieExist = true;
              resultAudio.push(source);
            }
            if (source.kind === "audiooutput" && source.deviceId != "") {
              if (Cookies.get("output") == source.deviceId)
                outputCookieExist = true;
              resultAudioOutput.push(source);
            }
          });
        })
        .then(() => {
          if (resultAudio.length > 0) {
            Promise.resolve()
                .then(() =>{
                  return navigator.mediaDevices
                      .getUserMedia({
                        audio: true,
                        video: this.state.videoEnabled && resultVideo.length > 0
                      }).catch((error) => {
                        console.warn('Could not get audio or video', error && error.message)
                        // Try audio only
                        return  navigator.mediaDevices
                            .getUserMedia({
                              audio: true,
                              video: false
                            }).then((stream) => {
                              // Disable video
                              this.setState({
                                videoEnabled: false,
                                error: strings.errorPermissionDeniedMicrophoneCamera,
                                loading: false
                              });
                              return stream;
                            });
                      });
                })
              .then(stream => {
                stream.getTracks().forEach(track => {
                  track.stop();
                });
                resultAudio = new Array();
                resultVideo = new Array();
                resultAudioOutput = new Array();
                navigator.mediaDevices.enumerateDevices().then(sources => {
                  let videoCookieExist = false;
                  let outputCookieExist = false;
                  let inputCookieExist = false;

                  /* GET SOURCES */
                  sources.forEach(source => {
                    if (source.kind === "videoinput" && source.deviceId != "") {
                      if (Cookies.get("camera") == source.deviceId)
                        videoCookieExist = true;
                      resultVideo.push(source);
                    }
                    if (source.kind === `audioinput` && source.deviceId != "") {
                      if (Cookies.get("input") == source.deviceId)
                        inputCookieExist = true;
                      resultAudio.push(source);
                    }
                    if (source.kind === "audiooutput" && source.deviceId != "") {
                      if (Cookies.get("output") == source.deviceId)
                        outputCookieExist = true;
                      resultAudioOutput.push(source);
                    }
                  });

                  /* OUTPUT AUDIO MANAGMENT */
                  if (bowser.chrome && resultAudioOutput && resultAudioOutput.length > 0) {
                    let selected_device = resultAudioOutput.find(device => device.deviceId == 'default');
                    if (!selected_device)
                      selected_device = resultAudioOutput[0];
                    if (!outputCookieExist) {
                      Cookies.set("output", selected_device.deviceId, default_cookies_param);
                      this.props.dispatch(
                        InputManagerActions.outputAudioChange(
                          selected_device.deviceId
                        )
                      );
                      this.setState({
                        outputDevices: resultAudioOutput,
                        outputDeviceSelected: selected_device.deviceId
                      });
                    } else {
                      this.props.dispatch(
                        InputManagerActions.outputAudioChange(
                          Cookies.get("output")
                        )
                      );
                      this.setState({
                        outputDevices: resultAudioOutput,
                        outputDeviceSelected: Cookies.get("output")
                      });
                    }
                  }

                  /* INPUT VIDEO MANAGMENT */
                  if (resultVideo.length > 0) {
                    if (!videoCookieExist) {
                      let selected_device = resultVideo.find(device => device.deviceId == 'default');
                      if (!selected_device)
                        selected_device = resultVideo[0];
                      Cookies.set("camera", selected_device.deviceId, default_cookies_param);
                      getVideoDeviceName(selected_device.deviceId)
                        .then((isBackCamera) => {
                          this.props.dispatch(InputManagerActions.inputVideoChange(selected_device.deviceId, isBackCamera))
                        })
                      this.setState({
                        videoDevices: resultVideo,
                        videoDeviceSelected: selected_device.deviceId
                      });
                    } else {
                      getVideoDeviceName(Cookies.get("camera"))
                        .then((isBackCamera) => {
                          this.props.dispatch(InputManagerActions.inputVideoChange(Cookies.get("camera"), isBackCamera))
                        })
                      this.setState({
                        videoDevices: resultVideo,
                        videoDeviceSelected: Cookies.get("camera")
                      });
                    }
                  } else {
                    this.setState({ videoEnabled: false });
                  }

                  /* INPUT AUDIO MANAGMENT */
                  if (resultAudio.length > 0) {
                    if (!inputCookieExist) {
                      let selected_device = resultAudio.find(device => device.deviceId == 'default');
                      if (!selected_device)
                        selected_device = resultAudio[0];
                      Cookies.set("input", selected_device.deviceId, default_cookies_param);
                      this.props.dispatch(
                        InputManagerActions.inputAudioChange(
                          selected_device.deviceId
                        )
                      );
                      this.setState({
                        audioDevices: resultAudio,
                        audioDeviceSelected: selected_device.deviceId
                      });
                    } else {
                      this.props.dispatch(
                        InputManagerActions.inputAudioChange(
                          Cookies.get("input")
                        )
                      );
                      this.setState({
                        audioDevices: resultAudio,
                        audioDeviceSelected: Cookies.get("input")
                      });
                    }
                  } else {
                    this.reportError(strings.noAudioDevice);
                    this.setState({
                      error: strings.noAudioDevice,
                      loading: false
                    });
                  }

                  /* GETUSERMEDIA FROM PREVIOUS MANAGMENT */
                  if (resultAudio.length > 0 && this.state.error == null) {
                    this.setState({ loading: false });
                    navigator.mediaDevices
                      .getUserMedia({
                        audio: { deviceId: { exact: this.state.audioDeviceSelected } },
                        video:
                          resultVideo.length > 0 && this.state.videoEnabled
                            ? {
                              deviceId: {
                                exact: this.state.videoDeviceSelected
                              }
                            }
                            : false
                      })
                      .then(stream => {
                        this.attachMediaStream(stream);
                        this.setState({ userStream: stream });
                        this.forceUpdate();
                      });
                  } else {
                    this.reportError("No input device detected");
                    console.error("No input device detected");
                  }
                });
              })
              .catch(error => {
                if (this.state.videoEnabled) {
                  this.reportError(strings.errorPermissionDeniedMicrophoneCamera);
                  this.setState({
                    error: strings.errorPermissionDeniedMicrophoneCamera,
                    loading: false
                  });
                } else {
                  this.reportError(strings.errorPermissionDeniedMicrophone);
                  this.setState({
                    error: strings.errorPermissionDeniedMicrophone,
                    loading: false
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
    element.setSinkId(sinkId).catch(error => {
      this.reportError(err.message);
    });
  }

  handleChangeLowBandwidthMode(event) {
    if (this.maxVFTimer) {
      clearTimeout(this.maxVFTimer);
      this.maxVFTimer = null;
    }
    const low_bandwidth = event.target.checked;
    let maxVideoForwarding = low_bandwidth?0:(Cookies.get("maxVideoForwarding")!==undefined?Cookies.get("maxVideoForwarding"):(isMobile()?4:9));
    if(typeof maxVideoForwarding === 'string' || maxVideoForwarding instanceof String)
      maxVideoForwarding = parseInt(maxVideoForwarding);

    this.setState({
      lowBandwidthMode: low_bandwidth,
      maxVideoForwarding: maxVideoForwarding
    }, () => {
      // Cookies.set("maxVideoForwarding", this.state.maxVideoForwarding, default_cookies_param);
      return this.switchVideoEnabled(!low_bandwidth);
    })
  }

  async handleVideoEnabledChanged(event) {
    const target = event.target;
    const video_on = target.checked;

    return this.switchVideoEnabled(video_on);

  }

  async switchVideoEnabled(video_on) {

    if (!video_on && this.state.userStream != null) {
      this.state.userStream.getTracks().forEach(track => {
        if (track.kind == "video") track.stop();
      });
      this.video.srcObject = null;
      this.video.height = "0";
    }
    if (video_on) {
      let approved = this.state.videoDevices.length > 0;
      if (this.state.videoDevices.length === 0) {
        // ask for video permission
        approved = await navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            stream.getTracks().forEach(track => {
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
        this.setState({
          videoEnabled: video_on
        }, () => {
          Cookies.set('videoEnabled', video_on, default_cookies_param);
          this.init();
        });
      }
    } else {
      if (this.state.videoDevices.length > 0) {
        this.setState({
          videoEnabled: video_on
        }, () => {
          Cookies.set('videoEnabled', video_on, default_cookies_param);
          this.init();
        });
      }
    }

  }

  handleAudioTransparentModeChange() {
    this.setState({
      audioTransparentMode: !this.state.audioTransparentMode
    }, () => {
      Cookies.set("audioTransparentMode", this.state.audioTransparentMode, default_cookies_param);
    });
  }

  handleVirtualBackgroundModeChange(mode) {
    this.setState({
      virtualBackgroundMode: mode!==this.state.virtualBackgroundMode?mode:null
    }, () => {
      if(this.state.userStream && VoxeetSDK.videoFilters) {
        let tracks = this.state.userStream.getVideoTracks();
        if(tracks && tracks[0]) {
          switch (this.state.virtualBackgroundMode) {
            case 'bokeh':
              VoxeetSDK.videoFilters.setFilter('bokeh', {stream: tracks[0]});
              break;
            default:
              VoxeetSDK.videoFilters.setFilter('none', {stream: tracks[0]});
          }
        }
      }
      Cookies.set("virtualBackgroundMode", this.state.virtualBackgroundMode, default_cookies_param);
    });
  }

  handleMaxVideoForwardingChange(event) {
    if (this.maxVFTimer) {
      clearTimeout(this.maxVFTimer);
      this.maxVFTimer = null;
    }
    let num;
    try { num = parseInt(event.target.value) } catch (e) { };
    if (num !== undefined && !isNaN(num)) {
      this.setState({ maxVideoForwarding: num }, () => {
        this.maxVFTimer = setTimeout(() => {
          Cookies.set("maxVideoForwarding", num, default_cookies_param);
          clearTimeout(this.maxVFTimer);
          this.maxVFTimer = null;
        }, 1500);
      });
    }
    else {
      this.setState({ maxVideoForwarding: '' });
    }
  }

  renderLoading() {
    return React.createElement(this.props.loadingScreen, {
      logo: this.props.logo
    });
  }

  render() {
    const { handleJoin, logo, dolbyVoiceEnabled } = this.props;
    const {
      level,
      videoEnabled,
      audioEnabled,
      videoDeviceSelected,
      audioDeviceSelected,
      outputDeviceSelected,
      error,
      loading,
      maxVideoForwarding,
      lowBandwidthMode,
      virtualBackgroundMode
    } = this.state;
    const MAX_MAXVF = isMobile()?4:16;

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
                                    ref={ref => (this.video = ref)}
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
                                  videoDeviceSelected != null
                                    ? videoDeviceSelected
                                    : ""
                                }
                                className="form-control select-video-device"
                                disabled={this.state.videoEnabled ? false : true}
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
                              {bowser.chrome && (
                                <div className="form-group">
                                  <label htmlFor="video">{strings.output}</label>
                                  <select
                                    name="output"
                                    className="form-control select-audio-output"
                                    value={
                                      outputDeviceSelected != null
                                        ? outputDeviceSelected
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
                                        audioDeviceSelected != null
                                          ? audioDeviceSelected
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
                                      stream={this.state.userStream}
                                      maxLevel = {21}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className='group-switch'>
                              {dolbyVoiceEnabled && <div className="group-enable">
                                <div className='enable-item'>
                                  <input
                                    id="audioTransparentMode"
                                    name="audioTransparentMode"
                                    type="checkbox"
                                    onChange={this.handleAudioTransparentModeChange}
                                    checked={this.state.audioTransparentMode}
                                  />
                                  <label htmlFor="audioTransparentMode">
                                    {strings.audioTransparentMode}
                                  </label>
                                </div>
                              </div>}
                              <div className="group-enable">
                                <div className='enable-item'>
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
                              <div className={`group-enable ${lowBandwidthMode ? 'disabled-form' : ''}`}>
                                <div className='enable-item'>
                                  <input
                                    id="videoEnabled"
                                    name="videoEnabled"
                                    type="checkbox"
                                    onChange={this.handleVideoEnabledChanged}
                                    checked={!lowBandwidthMode ? this.state.videoEnabled : false}
                                  />
                                  <label htmlFor="videoEnabled">
                                    {strings.sendMyVideo}
                                  </label>
                                </div>
                              </div>
                              {isElectron() &&  <div className={`group-enable ${!this.state.videoEnabled ? 'disabled-form' : ''}`}>
                                <div className='enable-item'>
                                  <input
                                      id="virtualBackgroundMode"
                                      name="virtualBackgroundMode"
                                      type="checkbox"
                                      onChange={() => {
                                        this.handleVirtualBackgroundModeChange('bokeh')
                                      }}
                                      checked={virtualBackgroundMode == 'bokeh' ? true : false}
                                  />
                                  <label htmlFor="virtualBackgroundMode">
                                    {strings.bokehMode}
                                  </label>
                                </div>
                              </div>}
                              <div className={`group-enable maxVideoForwarding ${lowBandwidthMode ? 'disabled-form' : ''}`}>
                                <div className='input-wrapper'>
                                  <div className='input-value'>0</div>
                                  <input
                                    type="range"
                                    style={{ background: `linear-gradient(to right, #00afef 0%, #00afef ${(100 / MAX_MAXVF) * (!lowBandwidthMode ? maxVideoForwarding : 0)}%, #fff ${(100 / MAX_MAXVF) * (!lowBandwidthMode ? maxVideoForwarding : 0)}%, #fff 100%)` }}
                                    id="maxVideoForwarding"
                                    name="maxVideoForwarding"
                                    min={0}
                                    max={MAX_MAXVF}
                                    step={1}
                                    onChange={this.handleMaxVideoForwardingChange}
                                    value={!lowBandwidthMode ? maxVideoForwarding : 0}
                                  />
                                  <div className='input-value'>{MAX_MAXVF}</div>
                                </div>
                                <label htmlFor="maxVideoForwarding">
                                  <div className='maxVideoForwardingValue'>{`${strings.showVideoParticipants1} ${!lowBandwidthMode ? maxVideoForwarding : 0} ${strings.showVideoParticipants2}`}</div>
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
                                {logo != null ?
                                  <img src={logo} />
                                  :
                                  <div className='ddloader' />
                                }
                              </div>
                              <div className="voxeet-loading-info-container">{error}</div>
                              <div className="voxeet-loading-info-container"><button className={'retry-devices'} onClick={this.onDeviceChange}>Retry</button></div>
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
};

export default ConferencePreConfigContainer;
