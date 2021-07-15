import React, { Component } from "react";
import PropTypes from "prop-types";

class AttendeesParticipantVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoRef: React.createRef()
    }
    this.toggleScreenShareFullScreen = this.toggleScreenShareFullScreen.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  componentDidMount() {
    this.updateStream(this.props);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { stream } = nextProps;
    if(prevState && prevState.videoRef && prevState.videoRef.current )
      navigator.attachMediaStream(prevState.videoRef.current, stream);
    return null;
  }

  updateStream(props) {
    const { stream } = props;
    if(this.state.videoRef)
      navigator.attachMediaStream(this.state.videoRef.current, stream);
  }

  toggleScreenShareFullScreen() {
    if (this.videoRef.current.requestFullscreen) {
      this.videoRef.current.requestFullscreen();
    } else if (this.videoRef.current.mozRequestFullScreen) {
      this.videoRef.current.mozRequestFullScreen();
    } else if (this.videoRef.current.webkitRequestFullscreen) {
      this.videoRef.current.webkitRequestFullscreen();
    }
  }

  render() {
    const { classes, width, height, enableDbClick } = this.props;
    return window.voxeetNodeModule ? (
      <canvas
        className="video-participant"
        width={width}
        height={height}
        ref={this.state.videoRef}
      />
    ) : (
      <video
        className="video-participant"
        width={width}
        id="fullscreen-video"
        playsInline
        height={height}
        ref={this.state.videoRef}
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
