import React, { Component } from "react";
import PropTypes from "prop-types";

import userPlaceholder from "../../../../static/images/user-placeholder.png";

import AttendeesParticipantBar from "../AttendeesParticipantBar";
import AttendeesParticipantVideo from "../AttendeesParticipantVideo";
import AttendeesParticipantVuMeter from "../AttendeesParticipantVuMeter";

class TileVideo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      participant,
      toggleMicrophone,
      isWidgetFullScreenOn,
      isAdmin,
      kickParticipant,
      isAdminActived,
      mySelf
    } = this.props;
    const photoUrl = participant.avatarUrl || userPlaceholder;
    return (
      <span className="tile-video video-frame">
        {isWidgetFullScreenOn && (
          <AttendeesParticipantBar
            toggleAutomatically={true}
            kickParticipant={kickParticipant}
            isAdminActived={isAdminActived}
            isAdmin={isAdmin}
            participant={participant}
            toggleMicrophone={toggleMicrophone}
          />
        )}
        {participant.stream ? (
          <div className={mySelf ? "stream-media myself" : "stream-media"}>
            <AttendeesParticipantVideo stream={participant.stream} />
          </div>
        ) : (
          <AttendeesParticipantVuMeter
            participant={participant}
            width={80}
            height={80}
            customClass={"preview-avatar"}
          />
        )}
      </span>
    );
  }
}

TileVideo.defaultProps = {
  mySelf: false
};

TileVideo.propTypes = {
  participant: PropTypes.object.isRequired,
  mySelf: PropTypes.bool,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired
};

export default TileVideo;
