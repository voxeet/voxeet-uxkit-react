import React, { Component } from "react";
import PropTypes from "prop-types";

import userPlaceholder from "../../../static/images/user-placeholder.png";
import AttendeesParticipantVuMeter from "../attendees/AttendeesParticipantVuMeter";

class StatusCardParticipant extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { participant } = this.props;
    const photoUrl = participant.avatarUrl || userPlaceholder;
    return (
      <li>
        <AttendeesParticipantVuMeter
          includeName={true}
          participant={participant}
          width={40}
          height={40}
          customClass={"preview-avatar"}
        />
      </li>
    );
  }
}

StatusCardParticipant.propTypes = {
  participant: PropTypes.object.isRequired
};

export default StatusCardParticipant;
