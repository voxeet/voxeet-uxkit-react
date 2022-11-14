import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import bowser from "bowser";
import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import { Actions as ControlsActions } from "../../actions/ControlsActions";
import { Actions as ParticipantActions } from "../../actions/ParticipantActions";
import { Actions as ActiveSpeakerActions } from "../../actions/ActiveSpeakerActions";

import {
  MODE_LIST,
  MODE_SPEAKER,
  MODE_TILES,
} from "../../constants/DisplayModes";
import { BROADCAST_KICK } from "../../constants/BroadcastMessageType";
import AttendeesHeader from "./AttendeesHeader";
import OnBoardingMessage from "./onBoardingMessage/onBoardingMessage";
import OnBoardingMessageWithAction from "./onBoardingMessage/onBoardingMessageWithAction";
import OnBoardingMessageWithDescription from "./onBoardingMessage/onBoardingMessageWithDescription";
import OnBoardingMessageOverlay from "./onBoardingMessage/onBoardingMessageOverlay";
import ActiveSpeakerOverlay from "./modes/ActiveSpeakerOverlay";
import {
  ListWidget,
  MeasuredTiles,
  Speakers,
  Tiles,
  ToggleModeButton,
  View3D,
} from "./modes";
import AttendeesSettings from "./AttendeesSettings";
import AttendeesToggleFullscreen from "./AttendeesToggleFullscreen";
import OnBoardingMessageWithConfirmation from "./onBoardingMessage/onBoardingMessageWithConfirmation";
import { getUxKitContext } from "../../context";
import { Actions as ErrorActions } from "../../actions/ErrorActions";

const Attendees = (props) => {
  const [connectedParticipants, setConnectedParticipants] = useState([]);
  const [kickPermission, setKickPermission] = useState(false);

  useEffect(() => {
    if (!props.participants || props.participants.length === 0) return;

    const par = props.participants.filter((p) => p.status === "Connected");

    setConnectedParticipants(par);
  }, [props.participants]);

  useEffect(() => {
    const hasPermission = props.conferencePermissions.has("KICK");
    setKickPermission(hasPermission);
  }, [props.conferencePermissions]);

  function toggleMicrophone(participant_id, isMuted) {
    props.dispatch(ConferenceActions.toggleMicrophone(participant_id, isMuted));
  }

  function toggleForwardedVideo(participant_id) {
    props.dispatch(ConferenceActions.toggleForwardedVideo(participant_id));
  }

  function toggleErrorModal() {
    props.dispatch(ControlsActions.toggleModal());
    props.dispatch(ErrorActions.onClearError());
  }

  function forceActiveSpeaker(participant) {
    props.dispatch(ActiveSpeakerActions.forceActiveSpeaker(participant));
  }

  function disableForceActiveSpeaker() {
    props.dispatch(ActiveSpeakerActions.disableForceActiveSpeaker());
  }

  function saveUserPosition(participant_id, relativePosition, position) {
    props.dispatch(
      ParticipantActions.saveUserPosition(
        participant_id,
        relativePosition,
        position
      )
    );
  }

  function setUserPosition(participant_id, positionRelative, position, moved) {
    props.dispatch(ParticipantActions.user3DMoved(participant_id, moved));
    /*VoxeetSDK.setUserPosition(
      participant_id,
      positionRelative.x,
      -positionRelative.y
    );*/
  }

  function toggleModal() {
    props.dispatch(ControlsActions.toggleModal());
  }

  function toggleVideo() {
    props.dispatch(ConferenceActions.toggleVideo(props.videoEnabled));
  }

  function kickParticipant(participant_id) {
    props.dispatch(
      ConferenceActions.sendBroadcastMessage(BROADCAST_KICK, participant_id)
    );
  }

  function renderWaiting() {
    return React.createElement(props.attendeesWaiting, {
      ...props,
      key: "waiting",
    });
  }

  function renderParticipantList() {
    return React.createElement(props.attendeesList, {
      ...props,
      attendeesListOpened: props.attendeesListOpened,
      isWebinar: props.isWebinar,
      isAdmin: props.isAdmin,
      toggleMicrophone: toggleMicrophone,
      toggleForwardedVideo: toggleForwardedVideo,
      invitePermission: props.conferencePermissions.has("INVITE"),
      key: "participant_list",
    });
  }

  function renderChat() {
    return React.createElement(props.attendeesChat, {
      ...props,
      attendeesChatOpened: props.attendeesChatOpened,
      participants: props.participants,
      currentUser: props.currentUser,
      key: "chat",
    });
  }

  return (
    <div
      id="conference-attendees"
      className={
        props.isWidgetFullScreenOn
          ? "vxt-conference-attendees sidebar-less"
          : "vxt-conference-attendees"
      }
    >
      {(props.isWidgetFullScreenOn || props.forceFullscreen) &&
        !props.screenShareEnabled &&
        !props.videoPresentationEnabled &&
        !props.filePresentationEnabled &&
        props.displayModes.length > 1 &&
        (connectedParticipants.length > 0 || props.isWebinar) && (
          <ToggleModeButton mode={props.mode} toggleMode={props.toggleMode} />
        )}

      {props.isWidgetFullScreenOn && !props.forceFullscreen && (
        <AttendeesToggleFullscreen
          toggleWidget={props.toggleWidget}
          isWidgetOpened={props.isWidgetOpened}
        />
      )}

      {!props.forceFullscreen && !props.isWidgetFullScreenOn && (
        <AttendeesHeader />
      )}

      <OnBoardingMessageWithConfirmation />
      <OnBoardingMessageWithAction />
      <OnBoardingMessageWithDescription />
      <OnBoardingMessage />
      <OnBoardingMessageOverlay />

      {props.mode === MODE_TILES && (
        <ActiveSpeakerOverlay
          participants={connectedParticipants}
          currentUser={props.currentUser}
        />
      )}

      {!bowser.msie && (
        <AttendeesSettings
          videoEnabled={props.videoEnabled}
          isListener={props.currentUser.isListener}
          attendeesSettingsOpened={props.attendeesSettingsOpened}
          dolbyVoiceEnabled={props.dolbyVoiceEnabled}
        />
      )}

      {renderParticipantList()}

      {renderChat()}

      <section
        className={`sidebar-container ${
          props.attendeesListOpened ||
          props.attendeesChatOpened ||
          props.attendeesSettingsOpened
            ? "attendees-list-opened"
            : "attendees-list-close"
        }`}
      >
        {!props.isWidgetFullScreenOn &&
          !props.forceFullscreen &&
          !props.screenShareEnabled &&
          !props.filePresentationEnabled &&
          !props.videoPresentationEnabled && (
            <ListWidget
              participants={props.participants}
              isAdmin={props.isAdmin}
              currentUser={props.currentUser}
              isAdminActived={props.isAdminActived}
              kickParticipant={kickParticipant}
              isWebinar={props.isWebinar}
              toggleMicrophone={toggleMicrophone}
            />
          )}

        {props.mode === MODE_LIST &&
          (props.forceFullscreen || props.isWidgetFullScreenOn) &&
          connectedParticipants.length > 0 &&
          props.displayModes.indexOf("list") > -1 &&
          !props.screenShareEnabled &&
          !props.filePresentationEnabled &&
          !props.videoPresentationEnabled && (
            <View3D
              participants={props.participants}
              isAdmin={props.isAdmin}
              isAdminActived={props.isAdminActived}
              kickParticipant={kickParticipant}
              setUserPosition={setUserPosition}
              saveUserPosition={saveUserPosition}
              toggleMicrophone={toggleMicrophone}
              dolbyVoiceEnabled={props.dolbyVoiceEnabled}
              kickPermission={kickPermission}
            />
          )}
        {props.mode === MODE_TILES &&
          (props.forceFullscreen || props.isWidgetFullScreenOn) &&
          props.displayModes.indexOf("tiles") > -1 &&
          !props.screenShareEnabled &&
          !props.filePresentationEnabled &&
          !props.videoPresentationEnabled &&
          props.currentUser != null &&
          ((!props.isWebinar && !props.currentUser.isListener) ||
            (!props.isWebinar &&
              props.currentUser.isListener &&
              connectedParticipants.length > 0) ||
            (props.isWebinar && props.isAdmin) ||
            (props.isWebinar &&
              !props.isAdmin &&
              connectedParticipants.length > 0)) &&
          ((props.spatialAudioEnabled && (
            <MeasuredTiles
              participants={props.participants}
              isAdmin={props.isAdmin}
              isWebinar={props.isWebinar}
              isAdminActived={props.isAdminActived}
              currentUser={props.currentUser}
              kickParticipant={kickParticipant}
              toggleMicrophone={toggleMicrophone}
              isWidgetFullScreenOn={
                props.forceFullscreen || props.isWidgetFullScreenOn
              }
              dolbyVoiceEnabled={props.dolbyVoiceEnabled}
              kickPermission={kickPermission}
              spatialAudioEnabled={props.spatialAudioEnabled}
            />
          )) ||
            (!props.spatialAudioEnabled && (
              <Tiles
                participants={props.participants}
                isAdmin={props.isAdmin}
                isWebinar={props.isWebinar}
                isAdminActived={props.isAdminActived}
                currentUser={props.currentUser}
                kickParticipant={kickParticipant}
                toggleMicrophone={toggleMicrophone}
                isWidgetFullScreenOn={
                  props.forceFullscreen || props.isWidgetFullScreenOn
                }
                dolbyVoiceEnabled={props.dolbyVoiceEnabled}
                kickPermission={kickPermission}
                spatialAudioEnabled={props.spatialAudioEnabled}
              />
            )))}
        {props.mode === MODE_SPEAKER &&
          (props.displayModes.indexOf("speaker") > -1 ||
            props.screenShareEnabled ||
            props.filePresentationEnabled ||
            props.videoPresentationEnabled) &&
          props.currentUser != null &&
          ((!props.isWebinar && !props.currentUser.isListener) ||
            (!props.isWebinar && props.currentUser.isListener) ||
            (props.isWebinar && props.isAdmin) ||
            (props.isWebinar && !props.isAdmin)) && (
            <Speakers
              participants={connectedParticipants}
              isAdmin={props.isAdmin}
              isAdminActived={props.isAdminActived}
              isFilePresentation={props.isFilePresentation}
              isWebinar={props.isWebinar}
              kickParticipant={kickParticipant}
              userIdStreamScreenShare={props.userIdStreamScreenShare}
              forceActiveSpeaker={forceActiveSpeaker}
              disableForceActiveSpeaker={disableForceActiveSpeaker}
              toggleMicrophone={toggleMicrophone}
              isWidgetFullScreenOn={
                props.forceFullscreen || props.isWidgetFullScreenOn
              }
              screenShareEnabled={props.screenShareEnabled}
              filePresentationEnabled={props.filePresentationEnabled}
              videoPresentationEnabled={props.videoPresentationEnabled}
              userIdFilePresentation={props.userIdFilePresentation}
              userIdVideoPresentation={props.userIdVideoPresentation}
              userStream={props.userStream}
              currentUser={props.currentUser}
              isScreenshare={props.isScreenshare}
              isVideoPresentation={props.isVideoPresentation}
              screenShareStream={props.userStreamScreenShare}
              dolbyVoiceEnabled={props.dolbyVoiceEnabled}
              kickPermission={kickPermission}
              spatialAudioEnabled={props.spatialAudioEnabled}
            />
          )}
        {connectedParticipants.length === 0 &&
          (!props.isWebinar || (props.isWebinar && !props.isAdmin)) &&
          props.mode === MODE_TILES &&
          renderWaiting()}
      </section>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    participants: state.voxeet.participants.participants,
    currentUser: state.voxeet.participants.currentUser,
    userStream: state.voxeet.participants.userStream,
    isWebinar: state.voxeet.participants.isWebinar,
    isAdmin: state.voxeet.participants.isAdmin,
    userStreamScreenShare: state.voxeet.participants.userStreamScreenShare,
    userIdVideoPresentation: state.voxeet.participants.userIdVideoPresentation,
    userIdFilePresentation: state.voxeet.participants.userIdFilePresentation,
    videoPresentationEnabled:
      state.voxeet.participants.videoPresentationEnabled,
    filePresentationEnabled: state.voxeet.participants.filePresentationEnabled,
    screenShareEnabled: state.voxeet.participants.screenShareEnabled,
    errorStore: state.voxeet.error,
  };
}

export default connect(mapStateToProps, null, null, {
  context: getUxKitContext(),
})(Attendees);

/*

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

  toggleMicrophone(participant_id, isMuted) {
    this.props.dispatch(
      ConferenceActions.toggleMicrophone(participant_id, isMuted)
    );
  }

  toggleForwardedVideo(participant_id) {
    this.props.dispatch(ConferenceActions.toggleForwardedVideo(participant_id));
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
    /!*VoxeetSDK.setUserPosition(
      participant_id,
      positionRelative.x,
      -positionRelative.y
    );*!/
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
    return React.createElement(this.props.attendeesWaiting, {
      ...this.props,
      key: "waiting",
    });
  }

  renderParticipantList() {
    return React.createElement(this.props.attendeesList, {
      ...this.props,
      attendeesListOpened: this.props.attendeesListOpened,
      isWebinar: this.props.isWebinar,
      isAdmin: this.props.isAdmin,
      toggleMicrophone: this.toggleMicrophone,
      toggleForwardedVideo: this.toggleForwardedVideo,
      invitePermission: this.props.conferencePermissions.has("INVITE"),
      key: "participant_list",
    });
  }

  renderChat() {
    return React.createElement(this.props.attendeesChat, {
      ...this.props,
      attendeesChatOpened: this.props.attendeesChatOpened,
      participants: this.props.participants,
      currentUser: this.props.currentUser,
      key: "chat",
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
      conferencePermissions,
      spatialAudioEnabled,
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
    } = this.props;
    const participantsConnected = participants.filter((p) => {
      const connected = p.isConnected;
      if (!connected) {
        console.log(p.status);
      } else {
        console.log(p.status);
      }

      return connected;
    });
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

        {mode === MODE_TILES && (
          <ActiveSpeakerOverlay
            participants={participantsConnected}
            currentUser={currentUser}
          />
        )}

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
              (isWebinar && !isAdmin && participantsConnected.length > 0)) &&
            ((spatialAudioEnabled && (
              <MeasuredTiles
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
                spatialAudioEnabled={spatialAudioEnabled}
              />
            )) ||
              (!spatialAudioEnabled && (
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
                  spatialAudioEnabled={spatialAudioEnabled}
                />
              )))}
          {mode === MODE_SPEAKER &&
            (displayModes.indexOf("speaker") > -1 ||
              screenShareEnabled ||
              filePresentationEnabled ||
              videoPresentationEnabled) &&
            currentUser != null &&
            ((!isWebinar && !currentUser.isListener) ||
              (!isWebinar && currentUser.isListener) ||
              (isWebinar && isAdmin) ||
              (isWebinar && !isAdmin)) && (
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
                spatialAudioEnabled={spatialAudioEnabled}
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
*/

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
  attendeesChat: PropTypes.object,
  attendeesList: PropTypes.object,
  dolbyVoiceEnabled: PropTypes.bool,
  conferencePermissions: PropTypes.object,
  chatOptions: PropTypes.object,
  spatialAudioEnabled: PropTypes.bool,
};
