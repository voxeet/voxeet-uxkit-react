import React, { Component } from "react";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

class AttendeesSettingsVuMeter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      level: 0
    };
  }

  componentDidMount() {
    this._interval = setInterval(() => {
      VoxeetSDK.conference.audioLevel(VoxeetSDK.session.participant, level => {
        this.setState({ level: Math.round(level * 21) });
      });
    }, 200);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  render() {
    const { level } = this.state;
    return (
      <ul className="loadbar">
        {[...Array(21)].map((el, i) => (
          <li key={`loadbar_${i}`}>
            <div className={`bar ${level >= i ? "ins" : ""}`}></div>
          </li>
        ))}
      </ul>
    );
  }
}

AttendeesSettingsVuMeter.propTypes = {};

export default AttendeesSettingsVuMeter;
