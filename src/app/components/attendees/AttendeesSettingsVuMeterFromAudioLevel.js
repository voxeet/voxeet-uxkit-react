import React, { Component } from "react";
import PropTypes from "prop-types";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import VuMeter from "../preConfig/VuMeter";

class AttendeesSettingsVuMeterFromAudioLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      level: 0,
    };
  }

  componentDidMount() {
    this._interval = setInterval(() => {
      VoxeetSDK.conference.audioLevel(
        VoxeetSDK.session.participant,
        (level) => {
          this.setState({ level: Math.round(level * this.props.maxLevel) });
        }
      );
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  render() {
    return <VuMeter level={this.state.level} maxLevel={this.props.maxLevel} />;
  }
}

AttendeesSettingsVuMeterFromAudioLevel.propTypes = {
  maxLevel: PropTypes.number,
};

export default AttendeesSettingsVuMeterFromAudioLevel;
