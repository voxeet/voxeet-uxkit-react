import React, { Component } from "react";
import bowser from "bowser";
import PropTypes from "prop-types";

import {
  ToggleMicrophoneButton,
  ToggleRecordingButton,
  ToggleScreenShareButton,
  Toggle3DAudioButton,
  HangUpButtonBottomBar,
  ToggleVideoButton,
  ToggleSettingsButton,
  TogglePSTN,
  ToggleAttendeesListButton,
  ToggleAttendeesChatButton,
} from "./buttons";

class ActionsButtons extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isBottomBar,
      forceFullscreen,
      isMuted,
      isRecording,
      isWidgetFullScreenOn,
      toggleVideoPresentation,
      videoEnabled,
      isVideoPresentation,
      videoPresentationEnabled,
      displayModal,
      conferencePincode,
      convertFilePresentation,
      toggleMicrophone,
      screenShareEnabled,
      filePresentationEnabled,
      toggleRecording,
      toggleVideo,
      toggleScreenShare,
      attendeesSettingsOpened,
      toggleAttendeesSettings,
      toggleAttendeesList,
      attendeesListOpened,
      attendeesChatOpened,
      toggleAttendeesChat,
      recordingLocked,
      toggleModal,
      toggleAudio3D,
      participants,
      isWebinar,
      isAdmin,
      displayActions,
      shareActions,
      leave,
      audio3DEnabled,
      displayExternalLiveModal,
      currentUser,
      isFilePresentation,
      isScreenshare,
      isDemo,
      conferencePermissions,
    } = this.props;
    let nbParticipants = 0;
    if (participants && participants.length) {
      nbParticipants = participants.filter((p) => p.isConnected).length;
    }
    //if ((!isWebinar && !currentUser.isListener) || (isWebinar && isAdmin))
    nbParticipants += 1;

    return (
      <div>
        <ul className="controls-left">
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("mute") > -1 &&
            conferencePermissions.has("SEND_AUDIO") &&
            !isDemo && (
              <ToggleMicrophoneButton
                isMuted={isMuted}
                toggle={toggleMicrophone}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("video") > -1 &&
            conferencePermissions.has("SEND_VIDEO") &&
            !isDemo && (
              <ToggleVideoButton
                videoEnabled={videoEnabled}
                toggle={toggleVideo}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
        </ul>
        <ul className="controls-center">
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("recording") > -1 &&
            conferencePermissions.has("RECORD") &&
            !isDemo && (
              <ToggleRecordingButton
                isRecording={isRecording}
                recordingLocked={recordingLocked}
                toggle={toggleRecording}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("share") > -1 &&
            conferencePermissions.has("SHARE_SCREEN") &&
            !isDemo &&
            shareActions.length > 0 && (
              <ToggleScreenShareButton
                screenShareEnabled={screenShareEnabled}
                filePresentationEnabled={filePresentationEnabled}
                videoPresentationEnabled={videoPresentationEnabled}
                currentUserScreenShare={isScreenshare}
                currentUserFilePresentation={isFilePresentation}
                currentUserVideoPresentation={isVideoPresentation}
                toggle={toggleScreenShare}
                toggleVideoPresentation={toggleVideoPresentation}
                convertFilePresentation={convertFilePresentation}
                shareActions={shareActions}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {isBottomBar && (!isWebinar || (isWebinar && isAdmin)) && !isDemo && (
            <li className="separator"></li>
          )}
          {isBottomBar && (
            <HangUpButtonBottomBar leave={leave} tooltipPlace="top" />
          )}
        </ul>
        <ul className="controls-right">
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("pstn") > -1 &&
            conferencePincode.length > 0 &&
            !isDemo && (
              <TogglePSTN
                conferencePincode={conferencePincode}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            !bowser.msie &&
            (
              <ToggleSettingsButton
                attendeesSettingsOpened={attendeesSettingsOpened}
                toggle={toggleAttendeesSettings}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {displayActions.indexOf("attendees") > -1 && (
            <ToggleAttendeesListButton
              nbParticipants={nbParticipants}
              tooltipPlace={isBottomBar ? "top" : "right"}
              toggle={toggleAttendeesList}
              isBottomBar={isBottomBar}
              isOpen={attendeesListOpened}
              isWebinar={isWebinar}
              isAdmin={isAdmin}
              currentUser={currentUser}
            />
          )}
          {displayActions.indexOf("chat") > -1 && (
            <ToggleAttendeesChatButton
              tooltipPlace={isBottomBar ? "top" : "right"}
              toggle={toggleAttendeesChat}
              isBottomBar={isBottomBar}
              isOpen={attendeesChatOpened}
            />
          )}
        </ul>
      </div>
    );
  }
}

ActionsButtons.propTypes = {
  isBottomBar: PropTypes.bool.isRequired,
  forceFullscreen: PropTypes.bool.isRequired,
  isMuted: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  isWebinar: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  videoEnabled: PropTypes.bool.isRequired,
  screenShareEnabled: PropTypes.bool.isRequired,
  filePresentationEnabled: PropTypes.bool.isRequired,
  videoPresentationEnabled: PropTypes.bool.isRequired,
  displayModal: PropTypes.bool.isRequired,
  isScreenshare: PropTypes.bool.isRequired,
  isVideoPresentation: PropTypes.bool.isRequired,
  isFilePresentation: PropTypes.bool.isRequired,
  displayActions: PropTypes.array.isRequired,
  toggleAudio3D: PropTypes.func.isRequired,
  recordingLocked: PropTypes.bool.isRequired,
  audio3DEnabled: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired,
  toggleRecording: PropTypes.func.isRequired,
  toggleVideo: PropTypes.func.isRequired,
  toggleScreenShare: PropTypes.func.isRequired,
  toggleVideoPresentation: PropTypes.func.isRequired,
  convertFilePresentation: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
  toggleMode: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  toggleAttendeesList: PropTypes.func.isRequired,
  attendeesListOpened: PropTypes.bool.isRequired,
  toggleAttendeesChat: PropTypes.func.isRequired,
  attendeesChatOpened: PropTypes.bool.isRequired,
  toggleAttendeesSettings: PropTypes.func.isRequired,
  attendeesSettingsOpened: PropTypes.bool.isRequired,
  conferencePermissions: PropTypes.object.isRequired,
};

ActionsButtons.defaultProps = {
  isBottomBar: false,
  forceFullscreen: false,
};

export default ActionsButtons;
