import React, { Component } from "react";
import PropTypes from "prop-types";

class AttendeesParticipantVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoRef: React.createRef(),
    };
    this.toggleScreenShareFullScreen =
      this.toggleScreenShareFullScreen.bind(this);
  }

  componentDidMount() {
    this.updateStream(this.props);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { stream } = nextProps;
    if (prevState && prevState.videoRef && prevState.videoRef.current) {
      navigator.attachMediaStream(prevState.videoRef.current, stream);
    }

    return null;
  }

  updateStream(props) {
    const { stream } = props;
    if (this.state.videoRef)
      navigator.attachMediaStream(this.state.videoRef.current, stream);
  }

  toggleScreenShareFullScreen() {
    if (this.state.videoRef.current.requestFullscreen) {
      this.state.videoRef.current.requestFullscreen();
    } else if (this.state.videoRef.current.mozRequestFullScreen) {
      this.state.videoRef.current.mozRequestFullScreen();
    } else if (this.state.videoRef.current.webkitRequestFullscreen) {
      this.state.videoRef.current.webkitRequestFullscreen();
    }
  }

  render() {
    const { classes, width, height, enableDbClick, muted, streamId } =
      this.props;

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
        id={streamId ? `fullscreen-video-${streamId}` : "fullscreen-video"}
        playsInline
        height={height}
        ref={this.state.videoRef}
        onDoubleClick={enableDbClick ? this.toggleScreenShareFullScreen : null}
        autoPlay
        muted={muted}
      />
    );
  }
}

AttendeesParticipantVideo.propTypes = {
  stream: PropTypes.object,
  width: PropTypes.string,
  height: PropTypes.string,
  enableDbClick: PropTypes.bool,
  muted: PropTypes.bool,
  streamId: PropTypes.string,
};

AttendeesParticipantVideo.defaultProps = {
  muted: true,
};

export default AttendeesParticipantVideo;
