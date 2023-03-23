import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
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
import { updateSpatialScene } from "../../libs/position";

const Attendees = (props) => {
  const [connectedParticipants, setConnectedParticipants] = useState([]);
  const [kickPermission, setKickPermission] = useState(false);

  useEffect(() => {
    if (props.spatialAudioEnabled) {
      updateSpatialScene();
    }
  }, []);

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

      <AttendeesSettings
        videoEnabled={props.videoEnabled}
        isListener={props.currentUser.isListener}
        attendeesSettingsOpened={props.attendeesSettingsOpened}
        dolbyVoiceEnabled={props.dolbyVoiceEnabled}
      />

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
