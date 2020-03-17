import React, { Component } from "react";
import PropTypes from "prop-types";
import StatusCardParticipant from "./StatusCardParticipant";

class StatusCardParticipants extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { participants } = this.props;
    return (
      <ul>
        {participants.map((participant, i) => (
          <StatusCardParticipant
            key={`status_participant_${i}`}
            participant={participant}
          />
        ))}
      </ul>
    );
  }
}

StatusCardParticipants.propTypes = {
  participants: PropTypes.array.isRequired
};

export default StatusCardParticipants;
