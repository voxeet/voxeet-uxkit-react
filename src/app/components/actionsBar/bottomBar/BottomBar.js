import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";

@connect(store => {
  return {
    controlsStore: store.voxeet.controls
  };
})
class BottomBar extends Component {
  constructor(props) {
    super(props);
    this.state = { hide: false };
    this.renderButtons = this.renderButtons.bind(this);
  }

  renderButtons() {
    return React.createElement(this.props.actionsButtons, {
      ...this.props,
      isMuted: this.props.controlsStore.isMuted,
      isRecording: this.props.controlsStore.isRecording,
      audio3DEnabled: this.props.controlsStore.audio3DEnabled,
      videoEnabled: this.props.controlsStore.videoEnabled,
      isBottomBar: true
    });
  }

  render() {
    return (
      <div className="vxt-bottom-bar">
        <div className="vxt-bottom-bar-actions">{this.renderButtons()}</div>
      </div>
    );
  }
}

BottomBar.propTypes = {
  actionsButtons: PropTypes.func,
  shareActions: PropTypes.array,
  screenShareEnabled: PropTypes.bool,
  filePresentationEnabled: PropTypes.bool,
  videoPresentationEnabled: PropTypes.bool,
  forceFullscreen: PropTypes.bool.isRequired,
  isMuted: PropTypes.bool.isRequired,
  isWebinar: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isScreenshare: PropTypes.bool.isRequired,
  isVideoPresentation: PropTypes.bool.isRequired,
  isFilePresentation: PropTypes.bool.isRequired,
  isJoined: PropTypes.bool.isRequired,
  videoEnabled: PropTypes.bool.isRequired,
  audio3DEnabled: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  displayModal: PropTypes.bool.isRequired,
  recordingLocked: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  isWidgetOpened: PropTypes.bool.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  toggleWidget: PropTypes.func.isRequired,
  toggleFullScreen: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired,
  isDemo: PropTypes.bool.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  toggleAudio3D: PropTypes.func.isRequired,
  toggleRecording: PropTypes.func.isRequired,
  toggleVideo: PropTypes.func.isRequired,
  toggleScreenShare: PropTypes.func.isRequired,
  toggleVideoPresentation: PropTypes.func.isRequired,
  convertFilePresentation: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
  toggleMode: PropTypes.func.isRequired,
  conferencePincode: PropTypes.string,
  mode: PropTypes.string.isRequired
};

BottomBar.defaultProps = {
  forceFullscreen: false,
  isWidgetFullScreenOn: false
};

export default BottomBar;
