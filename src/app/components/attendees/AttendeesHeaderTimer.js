import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Actions as TimerActions } from "../../actions/TimerActions";
import {getUxKitContext} from "../../context";

@connect(state => {
  return {
    timerStore: state.voxeet.timer
  };
}, null, null, { context: getUxKitContext() })
class AttendeesHeaderTimer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { time } = this.props.timerStore;
    return <div className="timer">{this._timerFormat(time)}</div>;
  }

  _timerFormat(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration - minutes * 60);
    if (duration < 10) {
      return "0:0" + seconds;
    }
    if (duration < 60) {
      return "0:" + seconds;
    }
    if (seconds < 10) {
      return minutes + ":0" + seconds;
    }
    return minutes + ":" + seconds;
  }
}

AttendeesHeaderTimer.propTypes = {
  initialize: PropTypes.bool
};

export default AttendeesHeaderTimer;
