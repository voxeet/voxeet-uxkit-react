import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import bowser from "bowser";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import { Actions as ControlsActions } from "../../actions/ControlsActions";
import { Actions as ParticipantActions } from "../../actions/ParticipantActions";
import { Actions as ActiveSpeakerActions } from "../../actions/ActiveSpeakerActions";

import {
  MODE_LIST,
  MODE_TILES,
  MODE_SPEAKER,
} from "../../constants/DisplayModes";
import { BROADCAST_KICK } from "../../constants/BroadcastMessageType";

import Modal from "./modal/Modal";
import AttendeesHeader from "./AttendeesHeader";
import OnBoardingMessage from "./onBoardingMessage/onBoardingMessage";
import OnBoardingMessageWithAction from "./onBoardingMessage/onBoardingMessageWithAction";
import OnBoardingMessageWithDescription from "./onBoardingMessage/onBoardingMessageWithDescription";
import OnBoardingMessageOverlay from "./onBoardingMessage/onBoardingMessageOverlay";
import ActiveSpeakerOverlay from "./modes/ActiveSpeakerOverlay";
import {
  List,
  ListWidget,
  Speakers,
  Tiles,
  View3D,
  ToggleModeButton,
} from "./modes";
import AttendeesParticipantVideo from "./AttendeesParticipantVideo";
import AttendeesSettings from "./AttendeesSettings";
import AttendeesToggleFullscreen from "./AttendeesToggleFullscreen";
import OnBoardingMessageWithConfirmation from "./onBoardingMessage/onBoardingMessageWithConfirmation";

@connect((store) => {
  return {
    participantStore: store.voxeet.participants,
    errorStore: store.voxeet.error,
  };
})
class Attendees extends Component {
  constructor(props) {
    super(props);
    this.toggleMicrophone = this.toggleMicrophone.bind(this);
    this.toggleForwardedVideo = this.toggleForwardedVideo.bind(this);
    this.kickParticipant = this.kickParticipant.bind(this);
    this.toggleVideo = this.toggleVideo.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleErrorModal = this.toggleErrorModal.bind(this);
    this.forceActiveSpeaker = this.forceActiveSpeaker.bind(this);
    this.disableForceActiveSpeaker = this.disableForceActiveSpeaker.bind(this);
    this.setUserPosition = this.setUserPosition.bind(this);
    this.saveUserPosition = this.saveUserPosition.bind(this);
    this.renderWaiting = this.renderWaiting.bind(this);
  }

  componentDidMount() {}

  toggleMicrophone(participant_id, isMuted) {
    this.props.dispatch(
      ConferenceActions.toggleMicrophone(participant_id, isMuted)
    );
  }

  toggleForwardedVideo(participant_id) {
    this.props.dispatch(
      ConferenceActions.toggleForwardedVideo(participant_id)
    );
  }

  toggleErrorModal() {
    this.props.dispatch(ControlsActions.toggleModal());
    this.props.dispatch(ErrorActions.onClearError());
  }

  forceActiveSpeaker(participant) {
    this.props.dispatch(ActiveSpeakerActions.forceActiveSpeaker(participant));
  }

  disableForceActiveSpeaker() {
    this.props.dispatch(ActiveSpeakerActions.disableForceActiveSpeaker());
  }

  saveUserPosition(participant_id, relativePosition, position) {
    this.props.dispatch(
      ParticipantActions.saveUserPosition(
        participant_id,
        relativePosition,
        position
      )
    );
  }

  setUserPosition(participant_id, positionRelative, position, moved) {
    this.props.dispatch(ParticipantActions.user3DMoved(participant_id, moved));
    /*VoxeetSDK.setUserPosition(
      participant_id,
      positionRelative.x,
      -positionRelative.y
    );*/
  }

  toggleModal() {
    this.props.dispatch(ControlsActions.toggleModal());
  }

  toggleVideo() {
    const { videoEnabled } = this.props;
    this.props.dispatch(ConferenceActions.toggleVideo(videoEnabled));
  }

  kickParticipant(participant_id) {
    this.props.dispatch(
      ConferenceActions.sendBroadcastMessage(BROADCAST_KICK, participant_id)
    );
  }

  renderWaiting() {
    return React.createElement(this.props.attendeesWaiting, { ...this.props });
  }

  renderParticipantList() {
    return React.createElement(this.props.attendeesList, {
      ...this.props,
      attendeesListOpened: this.props.attendeesListOpened,
      isWebinar: this.props.participantStore.isWebinar,
      isAdmin: this.props.participantStore.isAdmin,
      toggleMicrophone: this.toggleMicrophone,
      toggleForwardedVideo: this.toggleForwardedVideo,
      invitePermission: this.props.conferencePermissions.has("INVITE")
    });
  }

  renderChat() {
    return React.createElement(this.props.attendeesChat, {
      ...this.props,
      attendeesChatOpened: this.props.attendeesChatOpened,
      participants: this.props.participantStore.participants,
      currentUser: this.props.participantStore.currentUser,
    });
  }

  render() {
    const {
      mode,
      forceFullscreen,
      toggleMode,
      toggleWidget,
      isWidgetOpened,
      isWidgetFullScreenOn,
      videoEnabled,
      isAdminActived,
      displayModes,
      isScreenshare,
      isFilePresentation,
      attendeesListOpened,
      attendeesChatOpened,
      attendeesSettingsOpened,
      conferenceId,
      isVideoPresentation,
      dolbyVoiceEnabled,
      conferencePermissions
    } = this.props;
    const {
      participants,
      screenShareEnabled,
      filePresentationEnabled,
      videoPresentationEnabled,
      isAdmin,
      isWebinar,
      userStreamScreenShare,
      userIdStreamScreenShare,
      userIdFilePresentation,
      userIdVideoPresentation,
      userStream,
      currentUser,
    } = this.props.participantStore;
    const participantsConnected = participants.filter((p) => p.isConnected);
    const kickPermission = conferencePermissions.has("KICK");
    return (
      <div
        id="conference-attendees"
        className={
          isWidgetFullScreenOn
            ? "vxt-conference-attendees sidebar-less"
            : "vxt-conference-attendees"
        }
      >
        {(isWidgetFullScreenOn || forceFullscreen) &&
          !screenShareEnabled &&
          !videoPresentationEnabled &&
          !filePresentationEnabled &&
          displayModes.length > 1 &&
          (participantsConnected.length > 0 || isWebinar) && (
            <ToggleModeButton mode={mode} toggleMode={toggleMode} />
          )}

        {isWidgetFullScreenOn && !forceFullscreen && (
          <AttendeesToggleFullscreen
            toggleWidget={toggleWidget}
            isWidgetOpened={isWidgetOpened}
          />
        )}

        {!forceFullscreen && !isWidgetFullScreenOn && <AttendeesHeader />}

        <OnBoardingMessageWithConfirmation />
        <OnBoardingMessageWithAction />
        <OnBoardingMessageWithDescription />
        <OnBoardingMessage />
        <OnBoardingMessageOverlay />

        { mode === MODE_TILES &&
          (<ActiveSpeakerOverlay
            participants={participantsConnected}
            currentUser={currentUser}/>)}

        {!bowser.msie && (
          <AttendeesSettings
            videoEnabled={videoEnabled}
            isListener={currentUser.isListener}
            attendeesSettingsOpened={this.props.attendeesSettingsOpened}
            dolbyVoiceEnabled={dolbyVoiceEnabled}
          />
        )}

        {this.renderParticipantList()}

        {this.renderChat()}

        <section
          className={`sidebar-container ${
            attendeesListOpened ||
            attendeesChatOpened ||
            attendeesSettingsOpened
              ? "attendees-list-opened"
              : "attendees-list-close"
          }`}
        >
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            !screenShareEnabled &&
            !filePresentationEnabled &&
            !videoPresentationEnabled && (
              <ListWidget
                participants={participants}
                isAdmin={isAdmin}
                currentUser={currentUser}
                isAdminActived={isAdminActived}
                kickParticipant={this.kickParticipant}
                isWebinar={isWebinar}
                toggleMicrophone={this.toggleMicrophone}
              />
            )}

          {mode === MODE_LIST &&
            (forceFullscreen || isWidgetFullScreenOn) &&
            participantsConnected.length > 0 &&
            displayModes.indexOf("list") > -1 &&
            !screenShareEnabled &&
            !filePresentationEnabled &&
            !videoPresentationEnabled && (
              <View3D
                participants={participants}
                isAdmin={isAdmin}
                isAdminActived={isAdminActived}
                kickParticipant={this.kickParticipant}
                setUserPosition={this.setUserPosition}
                saveUserPosition={this.saveUserPosition}
                toggleMicrophone={this.toggleMicrophone}
                dolbyVoiceEnabled={dolbyVoiceEnabled}
                kickPermission={kickPermission}
              />
            )}
          {mode === MODE_TILES &&
            (forceFullscreen || isWidgetFullScreenOn) &&
            displayModes.indexOf("tiles") > -1 &&
            !screenShareEnabled &&
            !filePresentationEnabled &&
            !videoPresentationEnabled &&
            currentUser != null &&
            ((!isWebinar && !currentUser.isListener) ||
              (!isWebinar &&
                currentUser.isListener &&
                participantsConnected.length > 0) ||
              (isWebinar && isAdmin) ||
              (isWebinar && !isAdmin && participantsConnected.length > 0)) && (
              <Tiles
                participants={participants}
                isAdmin={isAdmin}
                isWebinar={isWebinar}
                isAdminActived={isAdminActived}
                currentUser={currentUser}
                kickParticipant={this.kickParticipant}
                toggleMicrophone={this.toggleMicrophone}
                isWidgetFullScreenOn={forceFullscreen || isWidgetFullScreenOn}
                dolbyVoiceEnabled={dolbyVoiceEnabled}
                kickPermission={kickPermission}
              />
            )}
          {mode === MODE_SPEAKER &&
            (displayModes.indexOf("speaker") > -1 ||
              screenShareEnabled ||
              filePresentationEnabled ||
              videoPresentationEnabled) &&
            currentUser != null &&
            ((!isWebinar && !currentUser.isListener) ||
              (!isWebinar &&
                currentUser.isListener &&
                participantsConnected.length > 0) ||
              (isWebinar && isAdmin) ||
              (isWebinar && !isAdmin && participantsConnected.length > 0)) && (
              <Speakers
                participants={participantsConnected}
                isAdmin={isAdmin}
                isAdminActived={isAdminActived}
                isFilePresentation={isFilePresentation}
                isWebinar={isWebinar}
                kickParticipant={this.kickParticipant}
                userIdStreamScreenShare={userIdStreamScreenShare}
                forceActiveSpeaker={this.forceActiveSpeaker}
                disableForceActiveSpeaker={this.disableForceActiveSpeaker}
                toggleMicrophone={this.toggleMicrophone}
                isWidgetFullScreenOn={forceFullscreen || isWidgetFullScreenOn}
                screenShareEnabled={screenShareEnabled}
                filePresentationEnabled={filePresentationEnabled}
                videoPresentationEnabled={videoPresentationEnabled}
                userIdFilePresentation={userIdFilePresentation}
                userIdVideoPresentation={userIdVideoPresentation}
                userStream={userStream}
                currentUser={currentUser}
                isScreenshare={isScreenshare}
                isVideoPresentation={isVideoPresentation}
                screenShareStream={userStreamScreenShare}
                dolbyVoiceEnabled={dolbyVoiceEnabled}
                kickPermission={kickPermission}
              />
            )}
          {participantsConnected.length === 0 &&
            (!isWebinar || (isWebinar && !isAdmin)) &&
            mode === MODE_TILES &&
            this.renderWaiting()}
        </section>
      </div>
    );
  }
}

Attendees.propTypes = {
  mode: PropTypes.string.isRequired,
  conferenceId: PropTypes.string,
  toggleMode: PropTypes.func.isRequired,
  isWidgetOpened: PropTypes.bool.isRequired,
  toggleWidget: PropTypes.func.isRequired,
  attendeesListOpened: PropTypes.bool.isRequired,
  attendeesChatOpened: PropTypes.bool.isRequired,
  attendeesSettingsOpened: PropTypes.bool.isRequired,
  forceFullscreen: PropTypes.bool,
  videoEnabled: PropTypes.bool,
  isWidgetFullScreenOn: PropTypes.bool,
  displayModal: PropTypes.bool,
  isAdminActived: PropTypes.bool,
  displayModes: PropTypes.array,
  isScreenshare: PropTypes.bool,
  isVideoPresentation: PropTypes.bool,
  videoPresentationEnabled: PropTypes.bool,
  isFilePresentation: PropTypes.bool,
  attendeesWaiting: PropTypes.func,
  attendeesChat: PropTypes.func,
  attendeesList: PropTypes.func,
  dolbyVoiceEnabled: PropTypes.bool,
  conferencePermissions: PropTypes.object,
  chatOptions: PropTypes.object,
};

export default Attendees;
