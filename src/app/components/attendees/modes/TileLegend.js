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
      isAdminActived,
      dolbyVoiceEnabled,
      currentUser
    } = this.props;
    return (
      <span className="tile-legend">
        <span className="participant-username">{participant.name}</span>
        {!(dolbyVoiceEnabled && currentUser.isListener) && <AttendeesParticipantMute
          participant={participant}
          toggleMicrophone={toggleMicrophone}
        />}
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
  isAdminActived: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
};

export default TileLegend;
