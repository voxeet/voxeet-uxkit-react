import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import IconVfSoundOff from "../../../static/images/icons/icon-vf-sound-off.svg";
import IconVfSoundOn from "../../../static/images/icons/icon-vf-sound-on.svg";
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
class AttendeesParticipantVf extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { participant, toggleMicrophone } = this.props;
    return (
      <span className="participant-vf">
        <a
          className={
            "icon-vf-participant-" + (participant.isVfd ? "on" : "off")
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleMicrophone(participant.participant_id, participant.isVfd);
          }}
        >
          <img src={participant.isVfd ? IconVfSoundOn : IconVfSoundOff} />
        </a>
      </span>
    );
  }
}

AttendeesParticipantVf.propTypes = {
  participant: PropTypes.object,
  toggleMicrophone: PropTypes.func,
};

export default AttendeesParticipantVf;
