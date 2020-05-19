import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import Fullscreen from "../../../../static/images/icons/icon-fullscreen.svg";

class ToggleFullScreenScreenShare extends Component {
  constructor(props) {
    super(props);
    this.toggleScreenShareFullScreen = this.toggleScreenShareFullScreen.bind(
      this
    );
  }

  toggleScreenShareFullScreen() {
    var elem = document.getElementById("fullscreen-video");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  render() {
    return (
      <a
        onClick={() => this.toggleScreenShareFullScreen()}
        className="fullscreen-screenshare"
      >
        <img width="20" src={Fullscreen} />
      </a>
    );
  }
}

ToggleFullScreenScreenShare.propTypes = {};

ToggleFullScreenScreenShare.defaultProps = {};

export default ToggleFullScreenScreenShare;
