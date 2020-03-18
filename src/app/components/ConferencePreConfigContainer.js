import React, { Fragment, Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import { Actions as InputManagerActions } from "../actions/InputManagerActions";
import AttendeesParticipantVideo from "./attendees/AttendeesParticipantVideo";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import Logo from "../../static/images/logo.svg";
import bowser from "bowser";
import PreConfigVuMeter from "./preConfig/PreConfigVuMeter";
import AudioTest from "../../static/sounds/voxeet_reaching_out.mp3";
import { strings } from "../languages/localizedStrings.js";

@connect(store => {
  return {
    inputManager: store.voxeet.inputManager
  };
})
class ConferencePreConfigContainer extends Component {
  constructor(props) {
    super(props);
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
      videoEnabled: this.props.constraints.video,
      audioEnabled: true,
      error: null,
      level: 0
    };
    this.setAudioDevice = this.setAudioDevice.bind(this);
    this.setVideoDevice = this.setVideoDevice.bind(this);
    this.setOutputDevice = this.setOutputDevice.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleJoin = this.handleJoin.bind(this);
    this.releaseStream = this.releaseStream.bind(this);
  }

  componentWillUnmount() {
    this.releaseStream();
  }

  handleJoin() {
    const { handleJoin } = this.props;
    const payload = {
      audioDeviceSelected: this.state.audioDeviceSelected,
      videoDeviceSelected: this.state.videoDeviceSelected,
      outputDeviceSelected: this.state.outputDeviceSelected,
      videoEnabled: this.state.videoEnabled,
      audioEnabled: this.state.audioEnabled
    };
    handleJoin(payload);
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
    navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: { exact: this.state.audioDeviceSelected } },
        video: videoConstraints
      })
      .then(stream => {
        navigator.attachMediaStream(this.video, stream);
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          return navigator.mediaDevices.enumerateDevices().then(sources => {
            let resultVideo = new Array();
            /* GET SOURCES */
            sources.forEach(source => {
              if (source.kind === "videoinput") {
                resultVideo.push(source);
              }
            });

            this.setState({ userStream: stream, videoDevices: resultVideo });
          });
        }
      })
      .catch(error => {
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
        audio: { exact: { deviceId: deviceId } },
        video: videoConstraints
      })
      .then(stream => {
        this.props.dispatch(InputManagerActions.inputAudioChange(deviceId));
        this.setState({
          audioDeviceSelected: deviceId,
          userStream: stream,
          lockJoin: false
        });
        var date = new Date();
        date.setDate(date.getDate() + 365);
        Cookies.set("input", deviceId, { path: "/", expires: date });
        if (this.state.videoDeviceSelected != null)
          navigator.attachMediaStream(this.video, stream);
      });
  }

  setOutputDevice(e) {
    const deviceId = e.target.value;
    this.props.dispatch(InputManagerActions.outputAudioChange(deviceId));
    var date = new Date();
    date.setDate(date.getDate() + 365);
    Cookies.set("output", deviceId, { path: "/", expires: date });
    this.setState({ outputDeviceSelected: deviceId });
  }

  setVideoDevice(e) {
    this.releaseStream();
    this.setState({ lockJoin: true });
    const deviceId = e.target.value;
    navigator.mediaDevices
      .getUserMedia({
        audio: { exact: { deviceId: this.state.audioDeviceSelected } },
        video: { deviceId: { exact: deviceId } }
      })
      .then(stream => {
        this.props.dispatch(InputManagerActions.inputVideoChange(deviceId));
        this.setState({
          videoDeviceSelected: deviceId,
          userStream: stream,
          lockJoin: false
        });
        var date = new Date();
        date.setDate(date.getDate() + 365);
        Cookies.set("camera", deviceId, { path: "/", expires: date });
        navigator.attachMediaStream(this.video, stream);
      });
  }

  componentDidMount() {
    let resultAudio = new Array();
    let resultVideo = new Array();
    let resultAudioOutput = new Array();
    let videoCookieExist = false;
    let outputCookieExist = false;
    let inputCookieExist = false;
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(function(sources) {
          /* GET SOURCES */
          sources.forEach(source => {
            if (source.kind === "videoinput") {
              if (Cookies.get("camera") == source.deviceId)
                videoCookieExist = true;
              resultVideo.push(source);
            }
            if (source.kind === `audioinput`) {
              if (Cookies.get("input") == source.deviceId)
                inputCookieExist = true;
              resultAudio.push(source);
            }
            if (source.kind === "audiooutput") {
              if (Cookies.get("output") == source.deviceId)
                outputCookieExist = true;
              resultAudioOutput.push(source);
            }
          });
        })
        .then(() => {
          if (resultAudio.length > 0) {
            navigator.mediaDevices
              .getUserMedia({
                audio: true,
                video:
                  this.state.videoEnabled && resultVideo.length > 0
                    ? true
                    : false
              })
              .then(stream => {
                resultAudio = new Array();
                resultVideo = new Array();
                resultAudioOutput = new Array();
                navigator.mediaDevices.enumerateDevices().then(sources => {
                  stream.getTracks().forEach(track => {
                    track.stop();
                  });
                  let videoCookieExist = false;
                  let outputCookieExist = false;
                  let inputCookieExist = false;

                  /* GET SOURCES */
                  sources.forEach(source => {
                    if (source.kind === "videoinput") {
                      if (Cookies.get("camera") == source.deviceId)
                        videoCookieExist = true;
                      resultVideo.push(source);
                    }
                    if (source.kind === `audioinput`) {
                      if (Cookies.get("input") == source.deviceId)
                        inputCookieExist = true;
                      resultAudio.push(source);
                    }
                    if (source.kind === "audiooutput") {
                      if (Cookies.get("output") == source.deviceId)
                        outputCookieExist = true;
                      resultAudioOutput.push(source);
                    }
                  });

                  /* OUTPUT AUDIO MANAGMENT */
                  if (bowser.chrome && resultAudioOutput) {
                    if (!outputCookieExist) {
                      var date = new Date();
                      date.setDate(date.getDate() + 365);
                      Cookies.set("output", resultAudioOutput[0].deviceId, {
                        path: "/",
                        expires: date
                      });
                      this.props.dispatch(
                        InputManagerActions.outputAudioChange(
                          resultAudioOutput[0].deviceId
                        )
                      );
                      this.setState({
                        outputDevices: resultAudioOutput,
                        outputDeviceSelected: resultAudioOutput[0]
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
                      var date = new Date();
                      date.setDate(date.getDate() + 365);
                      Cookies.set("camera", resultVideo[0].deviceId, {
                        path: "/",
                        expires: date
                      });
                      this.props.dispatch(
                        InputManagerActions.inputVideoChange(
                          resultVideo[0].deviceId
                        )
                      );
                      this.setState({
                        videoDevices: resultVideo,
                        videoDeviceSelected: resultVideo[0].deviceId
                      });
                    } else {
                      this.props.dispatch(
                        InputManagerActions.inputVideoChange(
                          Cookies.get("camera")
                        )
                      );
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
                      var date = new Date();
                      date.setDate(date.getDate() + 365);
                      Cookies.set("input", resultAudio[0].deviceId, {
                        path: "/",
                        expires: date
                      });
                      this.props.dispatch(
                        InputManagerActions.inputAudioChange(
                          resultAudio[0].deviceId
                        )
                      );
                      this.setState({
                        audioDevices: resultAudio,
                        audioDeviceSelected: resultAudio[0].deviceId
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
                        audio: true,
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
                        navigator.attachMediaStream(this.video, stream);
                        this.setState({ userStream: stream });
                        this.forceUpdate();
                      });
                  } else {
                    console.error("No input device detected");
                  }
                });
              })
              .catch(error => {
                if (this.state.videoEnabled) {
                  this.setState({
                    error: strings.errorPermissionDeniedMicrophoneCamera,
                    loading: false
                  });
                } else {
                  this.setState({
                    error: strings.errorPermissionDeniedMicrophone,
                    loading: false
                  });
                }
              });
          } else {
            this.setState({ error: strings.noAudioDevice, loading: false });
          }
        });
    }
  }

  attachSinkId(sinkId) {
    const element = document.getElementById("outputTester");
    element.setSinkId(sinkId).catch(error => {
      console.error(errorMessage);
    });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;

    if (!target.checked && this.state.userStream != null) {
      this.state.userStream.getTracks().forEach(track => {
        if (track.kind == "video") track.stop();
      });
      this.video.srcObject = null;
      this.video.height = "0";
    }
    if (target.checked) {
      this.restartCamera();
      this.video.height = "280";
    }
    if (this.state.videoDevices.length > 0) {
      this.setState({
        videoEnabled: value
      });
    }
  }

  renderLoading() {
    return React.createElement(this.props.loadingScreen, {
      logo: this.props.logo
    });
  }

  render() {
    const { handleJoin, logo } = this.props;
    const {
      level,
      videoEnabled,
      audioEnabled,
      videoDeviceSelected,
      audioDeviceSelected,
      outputDeviceSelected,
      error,
      loading
    } = this.state;
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
                          <div className="content-first-container">
                            {audioEnabled && (
                              <div>
                                <div className="form-group">
                                  <label htmlFor="video">{strings.input}</label>
                                  <select
                                    name="audio"
                                    className="form-control"
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
                                  />
                                </div>
                              </div>
                            )}
                            {bowser.chrome && (
                              <div className="form-group">
                                <label htmlFor="video">{strings.output}</label>
                                <select
                                  name="output"
                                  className="form-control"
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
                          </div>

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
                              className="form-control"
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

                          <div className="form-group group-enable">
                            <div>
                              <input
                                id="videoEnabled"
                                name="videoEnabled"
                                type="checkbox"
                                onChange={this.handleInputChange}
                                checked={this.state.videoEnabled}
                              />
                              <label htmlFor="videoEnabled">
                                {strings.video}
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
                            <img src={logo != null ? logo : Logo} />
                          </div>
                          <div className="voxeet-loading-info-container">{error}</div>
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
  logo: PropTypes.string
};

export default ConferencePreConfigContainer;
