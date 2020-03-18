import React, { Component } from "react";
import bowser from "bowser";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import ReactTooltip from "react-tooltip";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import Cookies from "js-cookie";
import { Actions as InputManagerActions } from "../../actions/InputManagerActions";
import AttendeesParticipantVideo from "./AttendeesParticipantVideo";
import AttendeesSettingsVuMeter from "./AttendeesSettingsVuMeter";
import { strings } from "../../languages/localizedStrings";

@connect(store => {
  return {
    inputManager: store.voxeet.inputManager,
    controlsStore: store.voxeet.controls
  };
})
class AttendeesSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      runningAnimation: false,
      audioDevices: [],
      videoDevices: [],
      outputDevices: [],
      testAudio: null,
      testAudioPlaying: false
    };
    this.setAudioDevice = this.setAudioDevice.bind(this);
    this.setVideoDevice = this.setVideoDevice.bind(this);
    this.setOutputDevice = this.setOutputDevice.bind(this);
  }

  componentDidUpdate(nextProps, nextState) {
    if (
      this.props.controlsStore.videoEnabled !=
        nextProps.controlsStore.videoEnabled ||
      this.props.controlsStore.audioEnabled !=
        nextProps.controlsStore.audioEnabled
    ) {
      VoxeetSDK.mediaDevice.enumerateAudioDevices().then(devices => {
        if (this.props.inputManager.currentAudioDevice != "") {
          let exist = false;
          devices.map((device, i) => {
            if (device.deviceId == this.props.inputManager.currentAudioDevice) {
              exist = true;
            }
          });
          if (!exist) {
            var date = new Date();
            date.setDate(date.getDate() + 365);
            Cookies.set("input", devices[0].deviceId, {
              path: "/",
              expires: date
            });
            this.props.dispatch(
              InputManagerActions.inputAudioChange(devices[0].deviceId)
            );
          }
        }
        this.setState({
          audioDevices: devices
        });
      });

      VoxeetSDK.mediaDevice.enumerateAudioDevices("output").then(devices => {
        if (this.props.inputManager.currentOutputDevice != "") {
          let exist = false;
          devices.map((device, i) => {
            if (
              device.deviceId == this.props.inputManager.currentOutputDevice
            ) {
              exist = true;
            }
          });
          if (!exist) {
            var date = new Date();
            date.setDate(date.getDate() + 365);
            Cookies.set("output", devices[0].deviceId, {
              path: "/",
              expires: date
            });
            this.props.dispatch(
              InputManagerActions.outputAudioChange(devices[0].deviceId)
            );
          }
        }
        this.setState({
          outputDevices: devices
        });
      });

      VoxeetSDK.mediaDevice.enumerateVideoDevices().then(devices => {
        if (this.props.inputManager.currentVideoDevice != "") {
          let exist = false;
          devices.map((device, i) => {
            if (device.deviceId == this.props.inputManager.currentVideoDevice) {
              exist = true;
            }
          });
          if (!exist) {
            var date = new Date();
            date.setDate(date.getDate() + 365);
            Cookies.set("camera", devices[0].deviceId, {
              path: "/",
              expires: date
            });
            this.props.dispatch(
              InputManagerActions.inputVideoChange(devices[0].deviceId)
            );
          }
        }
        this.setState({
          videoDevices: devices
        });
      });
    }
  }

  componentDidMount() {
    VoxeetSDK.mediaDevice.enumerateAudioDevices().then(devices => {
      if (this.props.inputManager.currentAudioDevice != "") {
        let exist = false;
        devices.map((device, i) => {
          if (device.deviceId == this.props.inputManager.currentAudioDevice) {
            exist = true;
          }
        });
        if (!exist) {
          var date = new Date();
          date.setDate(date.getDate() + 365);
          Cookies.set("input", devices[0].deviceId, {
            path: "/",
            expires: date
          });
          this.props.dispatch(
            InputManagerActions.inputAudioChange(devices[0].deviceId)
          );
        }
      }
      this.setState({
        audioDevices: devices
      });
    });

    VoxeetSDK.mediaDevice.enumerateAudioDevices("output").then(devices => {
      if (this.props.inputManager.currentOutputDevice != "") {
        let exist = false;
        devices.map((device, i) => {
          if (device.deviceId == this.props.inputManager.currentOutputDevice) {
            exist = true;
          }
        });
        if (!exist) {
          var date = new Date();
          date.setDate(date.getDate() + 365);
          Cookies.set("output", devices[0].deviceId, {
            path: "/",
            expires: date
          });
          this.props.dispatch(
            InputManagerActions.outputAudioChange(devices[0].deviceId)
          );
        }
      }
      this.setState({
        outputDevices: devices
      });
    });

    VoxeetSDK.mediaDevice.enumerateVideoDevices().then(devices => {
      if (this.props.inputManager.currentVideoDevice != "") {
        let exist = false;
        devices.map((device, i) => {
          if (device.deviceId == this.props.inputManager.currentVideoDevice) {
            exist = true;
          }
        });
        if (!exist) {
          var date = new Date();
          date.setDate(date.getDate() + 365);
          Cookies.set("camera", devices[0].deviceId, {
            path: "/",
            expires: date
          });
          this.props.dispatch(
            InputManagerActions.inputVideoChange(devices[0].deviceId)
          );
        }
      }
      this.setState({
        videoDevices: devices
      });
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this.props.attendeesSettingsOpened == true &&
      nextProps.attendeesSettingsOpened == false
    ) {
      this.setState({ runningAnimation: true });
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
  }

  setOutputDevice(e) {
    VoxeetSDK.mediaDevice.selectAudioOutput(e.target.value);
    var date = new Date();
    date.setDate(date.getDate() + 365);
    Cookies.set("output", e.target.value, { path: "/", expires: date });
    this.props.dispatch(InputManagerActions.outputAudioChange(e.target.value));
  }

  setAudioDevice(e) {
    e.persist();
    VoxeetSDK.mediaDevice.selectAudioInput(e.target.value).then(() => {
      var date = new Date();
      date.setDate(date.getDate() + 365);
      Cookies.set("input", e.target.value, { path: "/", expires: date });
      if (this.props.microphoneMuted) {
        VoxeetSDK.conference.toggleMute(VoxeetSDK.session.participant);
      }
    });
    this.props.dispatch(InputManagerActions.inputAudioChange(e.target.value));
  }

  setVideoDevice(e) {
    const { videoEnabled } = this.props;
    if (videoEnabled) {
      VoxeetSDK.mediaDevice.selectVideoInput(e.target.value);
    }
    var date = new Date();
    date.setDate(date.getDate() + 365);
    Cookies.set("camera", e.target.value, { path: "/", expires: date });
    this.props.dispatch(InputManagerActions.inputVideoChange(e.target.value));
  }

  render() {
    const { attendeesSettingsOpened } = this.props;
    const {
      currentAudioDevice,
      currentVideoDevice,
      currentOutputDevice
    } = this.props.inputManager;
    return (
      <div
        className={
          this.state.runningAnimation
            ? "attendees-settings attendees-settings-out"
            : attendeesSettingsOpened
            ? "attendees-settings"
            : "attendees-settings-hidden"
        }
      >
        <div className="attendees-settings-header">
          <h1>{strings.titleSettings}</h1>
        </div>

        <div className="settings">
          <div className="content">
            <form>
              <div className="form-group">
                <label htmlFor="video">Microphone</label>
                <select
                  name="audio"
                  value={currentAudioDevice}
                  className="form-control"
                  onChange={this.setAudioDevice}
                >
                  {this.state.audioDevices.map((device, i) => (
                    <option key={i} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <AttendeesSettingsVuMeter />
              </div>

              {bowser.chrome && (
                <div className="form-group form-output">
                  <label htmlFor="output">Sound Output</label>
                  <select
                    name="output"
                    value={currentOutputDevice}
                    className="form-control"
                    onChange={this.setOutputDevice}
                    disabled={false}
                  >
                    {this.state.outputDevices.map((device, i) => (
                      <option key={i} value={device.deviceId}>
                        {device.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group last">
                <label htmlFor="video">Camera</label>
                <select
                  name="video"
                  value={currentVideoDevice}
                  className="form-control"
                  onChange={this.setVideoDevice}
                  disabled={false}
                >
                  {this.state.videoDevices.map((device, i) => (
                    <option key={i} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hint-text">
                <p>{strings.problemSettings}</p>
                <p>{strings.saveSettings}</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

AttendeesSettings.propTypes = {
  videoEnabled: PropTypes.bool.isRequired,
  attendeesSettingsOpened: PropTypes.bool.isRequired
};

export default AttendeesSettings;
