import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import { strings } from "../../../../languages/localizedStrings";
import SpeakerActive from "../SpeakerActive";

class VideoPresentationMode extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      participants,
      participant,
      toggleMicrophone,
      isVideoPresentation,
      videoPresentationEnabled,
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
      isScreenshare
    } = this.props;
    return (
      <SpeakerActive
        participant={participant}
        toggleMicrophone={toggleMicrophone}
        isWidgetFullScreenOn={isWidgetFullScreenOn}
        isFilePresentation={isFilePresentation}
        screenShareEnabled={screenShareEnabled}
        screenShareStream={screenShareStream}
        isVideoPresentation={isVideoPresentation}
        videoPresentationEnabled={videoPresentationEnabled}
        kickParticipant={kickParticipant}
        isAdmin={isAdmin}
        isAdminActived={isAdminActived}
        mySelf={participants.length >= 1 ? false : true}
      />
    );
  }
}

VideoPresentationMode.propTypes = {
  participants: PropTypes.array.isRequired,
  participant: PropTypes.object.isRequired,
  isScreenshare: PropTypes.bool,
  videoPresentationEnabled: PropTypes.bool,
  isVideoPresentation: PropTypes.bool,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  screenShareEnabled: PropTypes.bool.isRequired,
  screenShareStream: PropTypes.object,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired
};

export default VideoPresentationMode;
