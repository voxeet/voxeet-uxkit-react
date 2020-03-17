import React, { Component } from "react";
import PropTypes from "prop-types";

import AttendeesParticipantMute from "./AttendeesParticipantMute";
import AttendeesKickParticipant from "./AttendeesKickParticipant";

class AttendeesParticipantBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      participant,
      toggleMicrophone,
      is3D,
      isAdmin,
      kickParticipant,
      isAdminActived /*, toggleAutomatically*/
    } = this.props;
    let className = "participant-bar";
    if (participant.stream) {
      className += " with-video";
    }
    return (
      <div className={is3D ? "participant-bar-3d" : className}>
        <span className="quality">
          <span className="green"></span>
          <span className="green"></span>
          <span className="green"></span>
        </span>
        <span className="name">{participant.name}</span>
        <ul className="bar-icons">
          <li>
            {toggleMicrophone != null && !participant.isMyself && (
              <AttendeesParticipantMute
                participant={participant}
                toggleMicrophone={toggleMicrophone}
              />
            )}
            {isAdmin && isAdminActived && !participant.isMyself && (
              <AttendeesKickParticipant
                participant={participant}
                kickParticipant={kickParticipant}
              />
            )}
          </li>
        </ul>
      </div>
    );
  }
}

AttendeesParticipantBar.propTypes = {
  toggleAutomatically: PropTypes.bool,
  participant: PropTypes.object,
  toggleMicrophone: PropTypes.func,
  is3D: PropTypes.bool,
  kickParticipant: PropTypes.func,
  isAdmin: PropTypes.bool,
  isAdminActived: PropTypes.bool
};

AttendeesParticipantBar.defaultProps = {
  is3D: false,
  toggleMicrophone: null,
  toggleAutomatically: false
};

export default AttendeesParticipantBar;
