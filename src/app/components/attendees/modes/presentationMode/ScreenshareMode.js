import React, { Component } from "react";
import PropTypes from "prop-types";
import SpeakerActive from "../SpeakerActive";

class ScreenshareMode extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      participants,
      participant,
      toggleMicrophone,
      isWidgetFullScreenOn,
      screenShareEnabled,
      filePresentationEnabled,
      screenShareStream,
      isAdmin,
      kickParticipant,
      isAdminActived,
      currentUser,
      isWebinar,
      isScreenshare,
      dolbyVoiceEnabled,
    } = this.props;

    return (
      <SpeakerActive
        participant={participant}
        toggleMicrophone={toggleMicrophone}
        isWidgetFullScreenOn={isWidgetFullScreenOn}
        screenShareEnabled={screenShareEnabled}
        screenShareStream={screenShareStream}
        isScreenshare={isScreenshare}
        kickParticipant={kickParticipant}
        isAdmin={isAdmin}
        isAdminActived={isAdminActived}
        mySelf={participants.length === 0}
        dolbyVoiceEnabled={dolbyVoiceEnabled}
        currentUser={currentUser}
      />
    )
  }
}

ScreenshareMode.propTypes = {
  participants: PropTypes.array.isRequired,
  participant: PropTypes.object.isRequired,
  isScreenshare: PropTypes.bool,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  screenShareEnabled: PropTypes.bool.isRequired,
  filePresentationEnabled: PropTypes.bool.isRequired,
  screenShareStream: PropTypes.array,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
  currentUser: PropTypes.object.isRequired,
};

export default ScreenshareMode;
