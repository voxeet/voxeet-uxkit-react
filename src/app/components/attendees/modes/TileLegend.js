import React, { Component } from "react";
import PropTypes from "prop-types";

import AttendeesParticipantMute from "../AttendeesParticipantMute";
import AttendeesKickParticipant from "../AttendeesKickParticipant";

class TileLegend extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      participant,
      toggleMicrophone,
      isAdmin,
      kickParticipant,
      isAdminActived
    } = this.props;
    return (
      <span className="tile-legend">
        <span className="participant-username">{participant.name}</span>
        <AttendeesParticipantMute
          participant={participant}
          toggleMicrophone={toggleMicrophone}
        />
        {isAdmin && isAdminActived && (
          <AttendeesKickParticipant
            isAdminActived={isAdminActived}
            participant={participant}
            kickParticipant={kickParticipant}
          />
        )}
      </span>
    );
  }
}

TileLegend.propTypes = {
  participant: PropTypes.object.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired
};

export default TileLegend;
