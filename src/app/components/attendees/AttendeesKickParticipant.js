import React, { Component } from "react";
import PropTypes from "prop-types";

class AttendeesKickParticipant extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { participant, kickParticipant } = this.props;
    return (
      <span className="participant-kick">
        <a
          className="icon-close"
          title="Kick participant"
          onClick={() => kickParticipant(participant.participant_id)}
        ></a>
      </span>
    );
  }
}

AttendeesKickParticipant.propTypes = {
  participant: PropTypes.object.isRequired,
  kickParticipant: PropTypes.func.isRequired
};

export default AttendeesKickParticipant;
