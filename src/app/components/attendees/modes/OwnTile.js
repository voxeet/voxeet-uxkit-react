import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";

import TileVideo from "./TileVideo";
import TileLegend from "./TileLegend";
import Draggable from "react-draggable";

@connect(store => {
  return {
    inputManager: store.voxeet.inputManager
  };
})
class OwnTile extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const checker = document.getElementById(
      "video-local-video-on"
    );
    if (
      (checker != null && nextProps.participant.stream == null) ||
      (checker != null && !nextProps.participant.stream.active) ||
      (checker != null && nextProps.participant.stream.getVideoTracks().length === 0) ||
      (checker == null && nextProps.participant.stream) ||
      (this.props.inputManager.isBackCamera != nextProps.inputManager.isBackCamera) ||
      (this.props.mySelf && this.props.participant.name == null)
    ) {
      return true;
    }
    return false;
  }

  render() {
    const {
      participant,
      toggleMicrophone,
      isWidgetFullScreenOn,
      isAdmin,
      kickParticipant,
      isAdminActived,
      mySelf,
      dolbyVoiceEnabled,
      currentUser
    } = this.props;
    const { currentVideoDevice, isBackCamera } = this.props.inputManager;
    return (
      <Draggable bounds="parent">
        <div
          className={
            "tile-local-item " +
            (participant.isConnected
              ? "participant-available"
              : "participant-offline")
          }
          id={
            "video-local-video-" +
            (participant.stream &&
              participant.stream.active &&
              participant.stream.getVideoTracks().length > 0
              ? "on"
              : "off")
          }
        >
          <TileVideo
            isBackCamera={isBackCamera}
            mySelf={mySelf}
            kickParticipant={kickParticipant}
            isAdminActived={isAdminActived}
            isAdmin={isAdmin}
            participant={participant}
            toggleMicrophone={toggleMicrophone}
            isWidgetFullScreenOn={isWidgetFullScreenOn}
            dolbyVoiceEnabled={dolbyVoiceEnabled}
          />
          <TileLegend
            participant={participant}
            kickParticipant={kickParticipant}
            isAdminActived={isAdminActived}
            isAdmin={isAdmin}
            toggleMicrophone={toggleMicrophone}
            dolbyVoiceEnabled={dolbyVoiceEnabled}
            currentUser={currentUser}
          />
        </div>
      </Draggable>
    );
  }
}

OwnTile.defaultProps = {
  mySelf: false,
};

OwnTile.propTypes = {
  participant: PropTypes.object.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  mySelf: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
};

export default OwnTile;
