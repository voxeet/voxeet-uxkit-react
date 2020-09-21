import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import { strings } from "../../../../languages/localizedStrings";
import SpeakerActive from "../SpeakerActive";

class FilePresentationMode extends Component {
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
      isFilePresentation,
      filePresentationEnabled,
      screenShareStream,
      isAdmin,
      kickParticipant,
      isAdminActived,
      userIdStreamScreenShare,
      currentUser,
      isWebinar,
      isScreenshare,
      dolbyVoiceEnabled
    } = this.props;
    return (
      <SpeakerActive
        participant={participant}
        toggleMicrophone={toggleMicrophone}
        isWidgetFullScreenOn={isWidgetFullScreenOn}
        isFilePresentation={isFilePresentation}
        screenShareEnabled={screenShareEnabled}
        screenShareStream={screenShareStream}
        isScreenshare={isScreenshare}
        filePresentationEnabled={filePresentationEnabled}
        kickParticipant={kickParticipant}
        isAdmin={isAdmin}
        isAdminActived={isAdminActived}
        mySelf={participants.length >= 1 ? false : true}
        dolbyVoiceEnabled={dolbyVoiceEnabled}
      />
    );
  }
}

FilePresentationMode.propTypes = {
  participants: PropTypes.array.isRequired,
  participant: PropTypes.object.isRequired,
  isScreenshare: PropTypes.bool,
  isFilePresentation: PropTypes.bool,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  screenShareEnabled: PropTypes.bool.isRequired,
  filePresentationEnabled: PropTypes.bool.isRequired,
  screenShareStream: PropTypes.object,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
};

export default FilePresentationMode;
