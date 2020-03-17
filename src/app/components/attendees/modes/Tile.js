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
      (checker != null && nextProps.participant.stream == null) ||
      (checker == null && nextProps.participant.stream) ||
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
      nbParticipant,
      mySelf
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
          (participant.stream ? "on" : "off")
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
        />
        <TileLegend
          participant={participant}
          kickParticipant={kickParticipant}
          isAdminActived={isAdminActived}
          isAdmin={isAdmin}
          toggleMicrophone={toggleMicrophone}
        />
      </div>
    );
  }
}

TileVideo.defaultProps = {
  mySelf: false
};

Tile.propTypes = {
  participant: PropTypes.object.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  mySelf: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  nbParticipant: PropTypes.number,
  isAdmin: PropTypes.bool.isRequired
};

export default Tile;
