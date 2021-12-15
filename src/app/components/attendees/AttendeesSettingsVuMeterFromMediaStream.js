import React, { Component } from "react";
import PropTypes from "prop-types";
import PreConfigVuMeter from "../preConfig/PreConfigVuMeter.js";

import { connect } from "react-redux";
import {getUxKitContext} from "../../context";

@connect(store => {
  return {
    inputManager: store.voxeet.inputManager,
  };
}, null, null, { context: getUxKitContext() })
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

  render() {
    return <PreConfigVuMeter stream={this.state.userStream} maxLevel={this.props.maxLevel} />;
  }
}

AttendeesSettingsVuMeterFromMediaStream.propTypes = {
  maxLevel: PropTypes.number,
};

export default AttendeesSettingsVuMeterFromMediaStream;
