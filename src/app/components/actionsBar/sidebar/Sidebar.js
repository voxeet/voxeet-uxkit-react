import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  ToggleSidebarButton,
  ToggleFullScreenButton,
  HangupButton,
  CloseModalButton
} from "../buttons";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.renderButtons = this.renderButtons.bind(this);
  }

  renderButtons() {
    return React.createElement(this.props.actionsButtons, {
      ...this.props
    });
  }

  render() {
    const {
      forceFullscreen,
      isWidgetOpened,
      isWidgetFullScreenOn,
      toggleWidget,
      toggleFullScreen,
      leave
    } = this.props;

    return (
      <div id="vxt-sidebar" className="vxt-sidebar">
        {this.props.isJoined && (
          <div id="conference-control">
            <div className="conference-actions-up">
              <ul className="status-icons-list">
                {!forceFullscreen && (
                  <ToggleSidebarButton
                    toggleWidget={toggleWidget}
                    isWidgetOpened={isWidgetOpened}
                  />
                )}
                {!forceFullscreen && (
                  <ToggleFullScreenButton
                    toggleFullScreen={toggleFullScreen}
                    isWidgetFullScreenOn={isWidgetFullScreenOn}
                  />
                )}
                {!isWidgetFullScreenOn && <HangupButton leave={leave} />}
              </ul>
            </div>
            <div className="vxt-conference-control conference-actions">
              {isWidgetOpened && this.renderButtons()}
            </div>
          </div>
        )}
      </div>
    );
  }
}

Sidebar.propTypes = {
  actionsButtons: PropTypes.func,
  screenShareEnabled: PropTypes.bool,
  displayActions: PropTypes.array.isRequired,
  forceFullscreen: PropTypes.bool.isRequired,
  isScreenshare: PropTypes.bool.isRequired,
  videoPresentationEnabled: PropTypes.bool,
  isMuted: PropTypes.bool.isRequired,
  isJoined: PropTypes.bool.isRequired,
  isWebinar: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  videoEnabled: PropTypes.bool.isRequired,
  displayModal: PropTypes.bool.isRequired,
  isDemo: PropTypes.bool.isRequired,
  recordingLocked: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  toggleAudio3D: PropTypes.func.isRequired,
  audio3DEnabled: PropTypes.bool.isRequired,
  isWidgetOpened: PropTypes.bool.isRequired,
  isVideoPresentation: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  toggleWidget: PropTypes.func.isRequired,
  toggleFullScreen: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  toggleRecording: PropTypes.func.isRequired,
  toggleVideo: PropTypes.func.isRequired,
  toggleScreenShare: PropTypes.func.isRequired,
  toggleVideoPresentation: PropTypes.func.isRequired,
  convertFilePresentation: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
  toggleMode: PropTypes.func.isRequired
};

Sidebar.defaultProps = {
  forceFullscreen: false
};

export default Sidebar;
