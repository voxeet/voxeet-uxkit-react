import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import IconMuteSoundOff from "../../../static/images/icons/icon-mute-sound-off.svg";
import IconMuteSoundOn from "../../../static/images/icons/icon-mute-sound-on.svg";
import { getUxKitContext } from "../../context";

@connect(
  (store) => {
    return {
      participantStore: store.voxeet.participants,
    };
  },
  null,
  null,
  { context: getUxKitContext() }
)
class AttendeesParticipantMute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { participant, toggleMicrophone } = this.props;
    return (
      <span className="participant-mute">
        <a
          className={
            "icon-mute-participant-" + (participant.isMuted ? "on" : "off")
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleMicrophone(participant.participant_id, participant.isMuted);
          }}
        >
          <img src={participant.isMuted ? IconMuteSoundOn : IconMuteSoundOff} />
        </a>
      </span>
    );
  }
}

AttendeesParticipantMute.propTypes = {
  participant: PropTypes.object,
  toggleMicrophone: PropTypes.func,
};

export default AttendeesParticipantMute;
