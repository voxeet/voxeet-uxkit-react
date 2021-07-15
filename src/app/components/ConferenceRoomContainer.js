import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import { strings } from "../languages/localizedStrings";

import { Actions as ConferenceActions } from "../actions/ConferenceActions";
import { Actions as ControlsActions } from "../actions/ControlsActions";
import { Actions as TimerActions } from "../actions/TimerActions";
import { Actions as ErrorActions } from "../actions/ErrorActions";
import { Actions as ChatActions } from "../actions/ChatActions";
import { Actions as OnBoardingMessageActions } from "../actions/OnBoardingMessageActions";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import {
  BROADCAST_KICK_ADMIN_HANG_UP,
  RECORDING_STATE
} from "../constants/BroadcastMessageType";

import { Sidebar } from "./actionsBar";
import Attendees from "./attendees/Attendees";
import ModalClose from "./attendees/modal/ModalClose";
import Modal from "./attendees/modal/Modal";

import BottomBar from "./actionsBar/bottomBar/BottomBar";

@connect(store => {
  return {
    controlsStore: store.voxeet.controls,
    participantsStore: store.voxeet.participants,
    errorStore: store.voxeet.error
  };
})
class ConferenceRoomContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalExternalLiveOpen: false
    };
    this.leaveConference = this.leaveConference.bind(this);
    this.toggleWidget = this.toggleWidget.bind(this);
    this.toggleFullScreen = this.toggleFullScreen.bind(this);
    this.toggleMicrophone = this.toggleMicrophone.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
    this.toggleScreenShare = this.toggleScreenShare.bind(this);
    this.toggleVideoPresentation = this.toggleVideoPresentation.bind(this);
    this.convertFilePresentation = this.convertFilePresentation.bind(this);
    this.toggleModalWidget = this.toggleModalWidget.bind(this);
    this.toggleVideo = this.toggleVideo.bind(this);
    this.toggleAudio3D = this.toggleAudio3D.bind(this);
    this.toggleMode = this.toggleMode.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleErrorModal = this.toggleErrorModal.bind(this);
    this.getSidebarClasses = this.getSidebarClasses.bind(this);
    this.toggleAttendeesList = this.toggleAttendeesList.bind(this);
    this.toggleAttendeesChat = this.toggleAttendeesChat.bind(this);
    this.toggleAttendeesSettings = this.toggleAttendeesSettings.bind(this);
    this.props.dispatch(TimerActions.startTime());
  }

  toggleWidget() {
    this.props.dispatch(ControlsActions.toggleWidget());
  }

  toggleFullScreen() {
    this.props.dispatch(ControlsActions.toggleFullScreen());
  }

  leaveConference() {
    const {
      isWidgetOpened,
      videoEnabled,
      isKickOnHangUpActived
    } = this.props.controlsStore;
    const { isAdmin, isWebinar } = this.props.participantsStore;
    const { handleOnLeave } = this.props;
    if (isAdmin && isKickOnHangUpActived) {
      this.props
        .dispatch(
          ConferenceActions.sendBroadcastMessage(BROADCAST_KICK_ADMIN_HANG_UP)
        )
        .then(() => {
          this.props.dispatch(ChatActions.clearMessages());
          this.props.dispatch(ConferenceActions.leave());
        });
    } else {
      if (isWidgetOpened) this.props.dispatch(ControlsActions.toggleWidget());
      if (videoEnabled) this.props.dispatch(ControlsActions.toggleVideo(false));
      this.props.dispatch(ConferenceActions.leave());
    }
  }

  playBlockedAudio() {
    this.props.dispatch(ConferenceActions.playBlockedAudio());
  }

  toggleMicrophone() {
    this.props.dispatch(ConferenceActions.toggleMicrophone());
  }

  toggleRecording() {
    const { isRecording, recordingLocked } = this.props.controlsStore;
    const { currentUser } = this.props.participantsStore;
    const { conferenceId } = this.props;
    if (!recordingLocked) {
      this.props.dispatch(
        ConferenceActions.toggleRecording(conferenceId, isRecording)
      );
      this.props.dispatch(
        ConferenceActions.sendBroadcastMessage(RECORDING_STATE, null, {
          name: currentUser.name,
          userId: currentUser.participant_id,
          recordingRunning: !isRecording
        })
      );
    } else {
      this.props.dispatch(
        OnBoardingMessageActions.onBoardingDisplay(
          strings.conferenceAlreadyRecord,
          1000
        )
      );
    }
  }

  toggleVideo() {
    const { videoEnabled } = this.props.controlsStore;
    this.props.dispatch(ConferenceActions.toggleVideo(videoEnabled));
  }

  toggleScreenShare(type) {
    const {
      isFilePresentation,
      isScreenshare,
      isVideoPresentation
    } = this.props.controlsStore;
    if (isScreenshare || type == "screenshare") {
      this.props.dispatch(ConferenceActions.toggleScreenShare());
    } else if (isFilePresentation) {
      this.props.dispatch(ConferenceActions.stopFilePresentation());
    } else if (isVideoPresentation) {
      this.props.dispatch(ConferenceActions.toggleVideoPresentation());
    }
  }

  toggleVideoPresentation(url) {
    this.props.dispatch(ConferenceActions.toggleVideoPresentation(url));
  }

  convertFilePresentation(file) {
    this.props.dispatch(ConferenceActions.convertFile(file));
  }

  toggleModal() {
    this.props.dispatch(ControlsActions.toggleModal());
  }

  toggleErrorModal() {
    this.props.dispatch(ControlsActions.toggleModal());
    this.props.dispatch(ErrorActions.onClearError());
  }

  toggleModalWidget() {
    this.props.dispatch(ControlsActions.toggleModalWidget());
  }

  toggleMode() {
    this.props.dispatch(ControlsActions.toggleMode());
  }

  toggleAudio3D() {
    const { audio3DEnabled } = this.props.controlsStore;
    this.props.dispatch(ConferenceActions.toggleAudio3D(!audio3DEnabled));
  }

  toggleAttendeesList() {
    this.props.dispatch(ControlsActions.toggleAttendeesList());
  }

  toggleAttendeesSettings() {
    this.props.dispatch(ControlsActions.toggleAttendeesSettings());
  }

  toggleAttendeesChat() {
    this.props.dispatch(ChatActions.resetBadgeMessage());
    this.props.dispatch(ControlsActions.toggleAttendeesChat());
  }

  getSidebarClasses() {
    const { forceFullscreen, isModal, isWebinar } = this.props;
    const {
      isWidgetOpened,
      isWidgetFullScreenOn,
      modalOpened
    } = this.props.controlsStore;
    if (isModal) {
      return modalOpened
        ? " modal-content vxt-widget-opened vxt-widget-fullscreen-on"
        : "";
    }
    return isWidgetOpened || forceFullscreen
      ? " vxt-widget-opened " +
          (isWidgetFullScreenOn || forceFullscreen
            ? "vxt-widget-fullscreen-on"
            : "vxt-widget-mode-on")
      : "";
  }

  render() {
    const {
      isJoined,
      isModal,
      forceFullscreen,
      screenShareEnabled,
      filePresentationEnabled,
      videoPresentationEnabled,
      actionsButtons,
      attendeesChat,
      attendeesList,
      isWebinar,
      isAdmin,
      attendeesWaiting,
      isDemo,
      conferencePincode,
      conferenceId,
      dolbyVoiceEnabled,
      maxVideoForwarding,
      chatOptions,
    } = this.props;
    const { errorMessage, isError } = this.props.errorStore;
    const { isModalExternalLiveOpen } = this.state;
    const { userStream, currentUser, participants } = this.props.participantsStore;
    const {
      mode,
      videoEnabled,
      recordingLocked,
      isWidgetOpened,
      isWidgetFullScreenOn,
      isMuted,
      isRecording,
      modalOpened,
      displayModal,
      displayActions,
      shareActions,
      audio3DEnabled,
      isFilePresentation,
      isScreenshare,
      isVideoPresentation,
      isAdminActived,
      displayModes,
      displayAttendeesList,
      displayAttendeesChat,
      displayAttendeesSettings,
      conferencePermissions,
    } = this.props.controlsStore;

    return (
      <div
        id="vxt-widget-container"
        className={
          isModal
            ? !modalOpened
              ? "vxt-widget-modal modal-hidden"
              : "vxt-widget-modal"
            : ""
        }
      >
        <aside className={"vxt-widget-container" + this.getSidebarClasses()}>
          {isModal && <ModalClose toggle={this.toggleModalWidget} />}
          {!isWidgetFullScreenOn && !forceFullscreen && (
            <Sidebar
              isJoined={isJoined}
              conferencePincode={conferencePincode}
              isWebinar={isWebinar}
              isAdmin={isAdmin}
              shareActions={shareActions}
              mode={mode}
              participants={participants}
              forceFullscreen={forceFullscreen}
              leave={this.leaveConference}
              isDemo={isDemo}
              currentUser={currentUser}
              filePresentationEnabled={filePresentationEnabled}
              displayActions={displayActions}
              screenShareEnabled={screenShareEnabled}
              dolbyVoiceEnabled={dolbyVoiceEnabled}
              toggleWidget={this.toggleWidget}
              toggleFullScreen={this.toggleFullScreen}
              isWidgetOpened={isWidgetOpened}
              isWidgetFullScreenOn={isWidgetFullScreenOn}
              recordingLocked={recordingLocked}
              isScreenshare={isScreenshare}
              isVideoPresentation={isVideoPresentation}
              videoPresentationEnabled={videoPresentationEnabled}
              isMuted={isMuted}
              videoEnabled={videoEnabled}
              toggleAudio3D={this.toggleAudio3D}
              audio3DEnabled={audio3DEnabled}
              displayModal={displayModal}
              isRecording={isRecording}
              isFilePresentation={isFilePresentation}
              toggleMicrophone={this.toggleMicrophone}
              toggleRecording={this.toggleRecording}
              toggleScreenShare={this.toggleScreenShare}
              toggleVideoPresentation={this.toggleVideoPresentation}
              toggleAttendeesList={this.toggleAttendeesList}
              toggleAttendeesChat={this.toggleAttendeesChat}
              attendeesChatOpened={displayAttendeesChat}
              attendeesListOpened={displayAttendeesList}
              toggleAttendeesSettings={this.toggleAttendeesSettings}
              attendeesSettingsOpened={displayAttendeesSettings}
              convertFilePresentation={this.convertFilePresentation}
              toggleVideo={this.toggleVideo}
              toggleModal={this.toggleModal}
              toggleMode={this.toggleMode}
              actionsButtons={actionsButtons}
              conferencePermissions={conferencePermissions}
            />
          )}

          {isJoined && (
            <Attendees
              mode={mode}
              conferenceId={conferenceId}
              toggleMode={this.toggleMode}
              forceFullscreen={forceFullscreen}
              toggleWidget={this.toggleWidget}
              isWidgetOpened={isWidgetOpened}
              isModalExternalLive={true}
              videoEnabled={videoEnabled}
              isWidgetFullScreenOn={isWidgetFullScreenOn}
              displayModal={displayModal}
              isAdminActived={isAdminActived}
              displayModes={displayModes}
              isScreenshare={isScreenshare}
              isVideoPresentation={isVideoPresentation}
              isFilePresentation={isFilePresentation}
              attendeesWaiting={attendeesWaiting}
              attendeesListOpened={displayAttendeesList}
              attendeesChatOpened={displayAttendeesChat}
              attendeesSettingsOpened={displayAttendeesSettings}
              attendeesChat={attendeesChat}
              attendeesList={attendeesList}
              dolbyVoiceEnabled={dolbyVoiceEnabled}
              conferencePermissions={conferencePermissions}
              chatOptions={chatOptions}
            />
          )}
          {isJoined && (isWidgetFullScreenOn || forceFullscreen) && (
            <BottomBar
              isJoined={isJoined}
              participants={participants}
              isWebinar={isWebinar}
              currentUser={currentUser}
              isAdmin={isAdmin}
              conferencePincode={conferencePincode}
              mode={mode}
              isDemo={isDemo}
              displayActions={displayActions}
              shareActions={shareActions}
              leave={this.leaveConference}
              screenShareEnabled={screenShareEnabled}
              dolbyVoiceEnabled={dolbyVoiceEnabled}
              filePresentationEnabled={filePresentationEnabled}
              videoPresentationEnabled={videoPresentationEnabled}
              recordingLocked={recordingLocked}
              isScreenshare={isScreenshare}
              isFilePresentation={isFilePresentation}
              toggleWidget={this.toggleWidget}
              toggleAudio3D={this.toggleAudio3D}
              toggleFullScreen={this.toggleFullScreen}
              isWidgetOpened={isWidgetOpened}
              isMuted={isMuted}
              isVideoPresentation={isVideoPresentation}
              videoEnabled={videoEnabled}
              audio3DEnabled={audio3DEnabled}
              displayModal={displayModal}
              isRecording={isRecording}
              toggleMicrophone={this.toggleMicrophone}
              toggleRecording={this.toggleRecording}
              toggleScreenShare={this.toggleScreenShare}
              toggleVideoPresentation={this.toggleVideoPresentation}
              convertFilePresentation={this.convertFilePresentation}
              toggleVideo={this.toggleVideo}
              toggleModal={this.toggleModal}
              toggleMode={this.toggleMode}
              toggleAttendeesList={this.toggleAttendeesList}
              attendeesListOpened={displayAttendeesList}
              toggleAttendeesChat={this.toggleAttendeesChat}
              attendeesChatOpened={displayAttendeesChat}
              toggleAttendeesSettings={this.toggleAttendeesSettings}
              attendeesSettingsOpened={displayAttendeesSettings}
              actionsButtons={actionsButtons}
              conferencePermissions={conferencePermissions}
              chatOptions={chatOptions}
            />
          )}
        </aside>
        {displayModal && !isError && (
          <Modal
            isModalSettings={true}
            toggle={this.toggleModal}
            toggleVideo={this.toggleVideo}
            microphoneMuted={isMuted}
            videoEnabled={videoEnabled}
            userStream={userStream}
          />
        )}
      </div>
    );
  }
}

ConferenceRoomContainer.propTypes = {
  isJoined: PropTypes.bool,
  isDemo: PropTypes.bool,
  isModal: PropTypes.bool,
  isWebinar: PropTypes.bool,
  isAdmin: PropTypes.bool,
  forceFullscreen: PropTypes.bool,
  actionsButtons: PropTypes.func,
  filePresentationEnabled: PropTypes.bool,
  videoPresentationEnabled: PropTypes.bool,
  screenShareEnabled: PropTypes.bool,
  handleOnLeave: PropTypes.func,
  conferenceId: PropTypes.string,
  conferencePincode: PropTypes.string,
  attendeesList: PropTypes.func,
  attendeesChat: PropTypes.func,
  attendeesWaiting: PropTypes.func,
  dolbyVoiceEnabled: PropTypes.bool,
  conferencePermissions: PropTypes.object,
  chatOptions: PropTypes.object,
};

export default ConferenceRoomContainer;
