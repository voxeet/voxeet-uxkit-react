import React, { Component } from "react";
import PropTypes from "prop-types";

import AttendeesParticipantVideo from "../AttendeesParticipantVideo";
import AttendeesParticipantVuMeter from "../AttendeesParticipantVuMeter";
import AttendeesParticipantMute from "../AttendeesParticipantMute";

class SpeakerDetails extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { participant, isWidgetFullScreenOn, toggleMicrophone } = this.props;
    return (
      <span className="participant-details">
        {participant.stream ? (
          <div
            className={
              "stream-media " + (!isWidgetFullScreenOn ? "bubble" : "")
            }
          >
            <AttendeesParticipantVideo
              width="200"
              height="120"
              stream={participant.stream}
            />
          </div>
        ) : (
          <AttendeesParticipantVuMeter participant={participant} />
        )}
        <span className="participant-username">{participant.name}</span>
      </span>
    );
  }
}

SpeakerDetails.propTypes = {
  participant: PropTypes.object.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired
};

export default SpeakerDetails;
