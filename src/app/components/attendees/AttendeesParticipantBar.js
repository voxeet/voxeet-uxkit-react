import React, { Component } from "react";
import PropTypes from "prop-types";

import AttendeesParticipantMute from "./AttendeesParticipantMute";
import AttendeesKickParticipant from "./AttendeesKickParticipant";
import { connect } from "@voxeet/react-redux-5.1.1";

@connect((store) => {
  return {
    participantStore: store.voxeet.participants,
  };
})
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
      isAdminActived /*, toggleAutomatically*/,
      dolbyVoiceEnabled,
      kickPermission,
    } = this.props;
    const { quality, currentUser } = this.props.participantStore;
    let audioq = 0,
      videoq = 0,
      avquality = 0;
    if (quality && quality[participant.participant_id]) {
      audioq = quality[participant.participant_id].audio;
      videoq = quality[participant.participant_id].video;
      if (audioq > 0 && videoq > 0) avquality = (audioq + videoq) / 2;
      if ((audioq == 0 || audioq == -1) && videoq > 0) avquality = videoq;
      if (audioq > 0 && (videoq == 0 || videoq == -1)) avquality = audioq;
      //avquality = Math.max(audioq, videoq);
    }
    let className = "participant-bar";
    if (
      participant.stream &&
      participant.stream.active &&
      participant.stream.getVideoTracks().length > 0
    ) {
      className += " with-video";
    }
    return (
      <div className={is3D ? "participant-bar-3d" : className}>
        <div className="quality">
          <div className={avquality>=0.5?"on":"off"} />
          <div className={avquality>=1.5?"on":"off"} />
          <div className={avquality>=2.5?"on":"off"} />
          <div className={avquality>=3.5?"on":"off"} />
          <div className={avquality>=4.5?"on":"off"} />
        </div>
        <div className="name">{participant.name}</div>
        <ul className="bar-icons">
          <li>
            {toggleMicrophone != null && !participant.isMyself && !(dolbyVoiceEnabled && currentUser.isListener) && (
              <AttendeesParticipantMute
                participant={participant}
                toggleMicrophone={toggleMicrophone}
              />
            )}
            {isAdmin && isAdminActived && !participant.isMyself &&  kickPermission && (
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
  isAdminActived: PropTypes.bool,
  dolbyVoiceEnabled: PropTypes.bool,
  kickPermission: PropTypes.bool
};

AttendeesParticipantBar.defaultProps = {
  is3D: false,
  toggleMicrophone: null,
  toggleAutomatically: false,
};

export default AttendeesParticipantBar;
