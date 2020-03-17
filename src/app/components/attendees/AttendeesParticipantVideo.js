import React, { Component } from "react";
import PropTypes from "prop-types";

class AttendeesParticipantVideo extends Component {
  constructor(props) {
    super(props);
    this.toggleScreenShareFullScreen = this.toggleScreenShareFullScreen.bind(
      this
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentDidMount() {
    this.updateStream(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateStream(nextProps);
  }

  updateStream(props) {
    const { stream } = props;
    navigator.attachMediaStream(this.video, stream);
  }

  toggleScreenShareFullScreen() {
    if (this.video.requestFullscreen) {
      this.video.requestFullscreen();
    } else if (this.video.mozRequestFullScreen) {
      this.video.mozRequestFullScreen();
    } else if (this.video.webkitRequestFullscreen) {
      this.video.webkitRequestFullscreen();
    }
  }

  render() {
    const { classes, width, height, enableDbClick } = this.props;
    return window.voxeetNodeModule ? (
      <canvas
        className="video-participant"
        width={width}
        height={height}
        ref={ref => (this.video = ref)}
      />
    ) : (
      <video
        className="video-participant"
        width={width}
        id="fullscreen-video"
        playsInline
        height={height}
        ref={ref => (this.video = ref)}
        onDoubleClick={this.toggleScreenShareFullScreen}
        autoPlay
        muted
      />
    );
  }
}

AttendeesParticipantVideo.propTypes = {
  stream: PropTypes.object,
  width: PropTypes.string,
  height: PropTypes.string,
  enableDbClick: PropTypes.bool
};

export default AttendeesParticipantVideo;
