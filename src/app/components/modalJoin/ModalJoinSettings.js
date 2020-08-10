import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { connect } from "@voxeet/react-redux-5.1.1";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import AttendeesParticipantVideo from "../attendees/AttendeesParticipantVideo";
import AttendeesParticipantVuMeter from "../attendees/AttendeesParticipantVuMeter";
import { strings } from "../../languages/localizedStrings";

class ModalJoinSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioDevices: [],
      videoDevices: []
    };
    this.loadDevices = this.loadDevices.bind(this);
  }

  setAudioDevice(e) {
    VoxeetSDK.mediaDevice.selectAudioInput(e.target.value).then(() => {});
  }

  setVideoDevice(e) {
    VoxeetSDK.mediaDevice.selectVideoInput(e.target.value).then(() => {});
  }

  componentDidMount() {
    this.loadDevices();
    navigator.mediaDevices.addEventListener('devicechange', this.loadDevices);
  }

  componentWillUnmount() {
    navigator.mediaDevices.removeEventListener('devicechange', this.loadDevices);
  }

  loadDevices() {
    VoxeetSDK.mediaDevice.enumerateAudioDevices().then(devices => {
      this.setState({
        audioDevices: devices
      });
    });

    VoxeetSDK.mediaDevice.enumerateVideoDevices().then(devices => {
      this.setState({
        videoDevices: devices
      });
    });
  }

  render() {
    return (
      <div>
        <h3>{strings.titlesettings}</h3>
        <form>
          <div className="form-group">
            <label htmlFor="video">Microphone</label>
            <select
              name="audio"
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
            <AttendeesParticipantVuMeter />
          </div>
          <div className="form-group">
            <label htmlFor="video">Video</label>
            <select
              name="video"
              className="form-control"
              onChange={this.setVideoDevice}
            ></select>
          </div>
          <div className="video"></div>
        </form>
      </div>
    );
  }
}

ModalJoinSettings.propTypes = {};

export default ModalJoinSettings;
