import React, { Component } from "react";
import PropTypes from "prop-types";

import AttendeesParticipantVideo from "../AttendeesParticipantVideo";
import AttendeesParticipantVuMeter from "../AttendeesParticipantVuMeter";
import AttendeesParticipantMute from "../AttendeesParticipantMute";
import AttendeesKickParticipant from "../AttendeesKickParticipant";

import {
  STATUS_CONNECTING,
  STATUS_CONNECTED,
  STATUS_WARN,
  STATUS_ERROR
} from "../../../constants/ParticipantStatus";

class ListItem extends Component {
  constructor(props) {
    super(props);
  }

  getStatusClasses(participant) {
    let classes = ["participant-status"];
    if (participant.stream) classes.push("stream");
    switch (participant.status) {
      case STATUS_CONNECTED:
      default:
        classes.push("connected");
        break;
      case STATUS_CONNECTING:
        classes.push("connecting");
        break;
      case STATUS_WARN:
        classes.push("warn");
        break;
      case STATUS_ERROR:
        classes.push("error");
        break;
    }
    return classes.join(" ");
  }

  render() {
    const {
      participant,
      isAdmin,
      toggleMicrophone,
      kickParticipant,
      isAdminActived,
      dolbyVoiceEnabled,
      currentUser
    } = this.props;
    return (
      <li
        className={
          "item " +
          (participant.isConnected
            ? "participant-available"
            : "participant-offline")
        }
      >
        <span className="participant-details">
          {participant.stream && participant.stream.active && participant.stream.getVideoTracks().length > 0 ? (
            <div className="stream-media bubble">
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
        {!(dolbyVoiceEnabled && currentUser.isListener) && <AttendeesParticipantMute
          participant={participant}
          toggleMicrophone={toggleMicrophone}
        />}
        {isAdmin && isAdminActived && (
          <AttendeesKickParticipant
            participant={participant}
            kickParticipant={kickParticipant}
          />
        )}
      </li>
    );
  }
}

ListItem.propTypes = {
  participant: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
};

export default ListItem;
