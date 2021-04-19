import React, { Component } from "react";
import PropTypes from "prop-types";

import TileVideo from "./TileVideo";
import TileLegend from "./TileLegend";

class Tile extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const checker = document.getElementById(
      "video-" + this.props.nbParticipant + "-video-on"
    );
    if (
      (this.props.participant.participant_id !== nextProps.participant.participant_id) ||
      (checker != null && nextProps.participant.stream == null) ||
      (checker != null && !nextProps.participant.stream.active) ||
      (checker != null && nextProps.participant.stream.getVideoTracks().length === 0) ||
      (checker == null && nextProps.participant.stream) ||
      (this.props.mySelf && this.props.participant.name == null) ||
      (this.props.participant.stream && nextProps.participant.stream &&
          this.props.participant.stream.id != nextProps.participant.stream.id) ||
      (!this.props.participant.stream && nextProps.participant.stream) ||
      (this.props.kickPermission != nextProps.kickPermission)
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
      nbParticipant,
      mySelf,
      dolbyVoiceEnabled,
      kickPermission,
      currentUser
    } = this.props;
    return (
      <div
        className={
          "tile-item " +
          (participant.isConnected
            ? "participant-available"
            : "participant-offline")
        }
        id={
          "video-" +
          nbParticipant +
          "-video-" +
          (participant.stream &&
          participant.stream.active &&
          participant.stream.getVideoTracks().length > 0
            ? "on"
            : "off")
        }
      >
        <TileVideo
          mySelf={mySelf}
          kickParticipant={kickParticipant}
          isAdminActived={isAdminActived}
          isAdmin={isAdmin}
          participant={participant}
          toggleMicrophone={toggleMicrophone}
          isWidgetFullScreenOn={isWidgetFullScreenOn}
          dolbyVoiceEnabled={dolbyVoiceEnabled}
          kickPermission={kickPermission}
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
    );
  }
}

TileVideo.defaultProps = {
  mySelf: false,
};

Tile.propTypes = {
  participant: PropTypes.object.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  mySelf: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  nbParticipant: PropTypes.number,
  dolbyVoiceEnabled: PropTypes.bool,
  kickPermission: PropTypes.bool
};

export default Tile;
