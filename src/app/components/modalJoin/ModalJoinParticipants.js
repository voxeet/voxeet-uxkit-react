import React, { Component } from "react";
import PropTypes from "prop-types";
import ModalJoinParticipant from "./ModalJoinParticipant";

class ModalJoinParticipants extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { participants } = this.props;
    return (
      <ul className="modal-join-participants">
        {participants.map((participant, i) => (
          <ModalJoinParticipant
            key={`status_participant_${i}`}
            participant={participant}
          />
        ))}
      </ul>
    );
  }
}

ModalJoinParticipants.propTypes = {
  participants: PropTypes.array.isRequired
};

export default ModalJoinParticipants;
