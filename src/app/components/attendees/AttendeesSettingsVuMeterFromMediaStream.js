import React, { Component } from "react";
import PropTypes from "prop-types";
import PreConfigVuMeter from "../preConfig/PreConfigVuMeter.js";

import { connect } from "@voxeet/react-redux-5.1.1";

@connect((store) => {
  return {
    inputManager: store.voxeet.inputManager,
  };
})
class AttendeesSettingsVuMeterFromMediaStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userStream: null,
    };
  }

  componentDidMount() {
    if (this.props.inputManager.currentAudioDevice != null)
      navigator.mediaDevices
        .getUserMedia({
          audio: { deviceId: this.props.inputManager.currentAudioDevice },
          video: false,
        })
        .then((stream) => this.setState({ userStream: stream }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.inputManager.currentAudioDevice !==
        this.props.inputManager.currentAudioDevice &&
      this.props.inputManager.currentAudioDevice !== null
    )
      navigator.mediaDevices
        .getUserMedia({
          audio: { deviceId: this.props.inputManager.currentAudioDevice },
          video: false,
        })
        .then((stream) => this.setState({ userStream: stream }));
  }

  componentWillUnmount() {
    if(this.state.userStream){
      this.state.userStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }

  render() {
    return <PreConfigVuMeter stream={this.state.userStream} maxLevel={this.props.maxLevel} />;
  }
}

AttendeesSettingsVuMeterFromMediaStream.propTypes = {
  maxLevel: PropTypes.number,
};

export default AttendeesSettingsVuMeterFromMediaStream;
