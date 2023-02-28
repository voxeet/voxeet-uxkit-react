import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Actions as ActiveSpeakerActions } from "../../../actions/ActiveSpeakerActions";

import Speaker from "./Speaker";
import SpeakerVideo from "./SpeakerVideo";
import AttendeesParticipantBar from "../AttendeesParticipantBar";
import ScreenshareMode from "./presentationMode/ScreenshareMode";
import FilePresentationMode from "./presentationMode/FilePresentationMode";
import VideoPresentationMode from "./presentationMode/VideoPresentationMode";
import { getUxKitContext } from "../../../context";
import { setDefaultPositionLayout } from "../../../libs/position";

const Speakers = ({
  dispatch,
  participants,
  forceActiveSpeaker,
  disableForceActiveSpeaker,
  forceFullscreen,
  toggleMicrophone,
  isWidgetFullScreenOn,
  screenShareEnabled,
  filePresentationEnabled,
  isFilePresentation,
  screenShareStream,
  isAdmin,
  kickParticipant,
  isAdminActived,
  userIdStreamScreenShare,
  userIdFilePresentation,
  userIdVideoPresentation,
  currentUser,
  isWebinar,
  isScreenshare,
  videoPresentationEnabled,
  isVideoPresentation,
  dolbyVoiceEnabled,
  kickPermission,
  spatialAudioEnabled,
  activeSpeakerStore,
}) => {
  const [activeSpeaker, setActiveSpeaker] = useState();

  useEffect(() => {
    dispatch(ActiveSpeakerActions.startActiveSpeaker());
    if (spatialAudioEnabled) {
      setDefaultPositionLayout();
    }
    return dispatch(ActiveSpeakerActions.stopActiveSpeaker());
  }, []);

  useEffect(() => {
    if (!activeSpeakerStore) return;

    if (activeSpeakerStore.activeSpeaker) {
      setActiveSpeaker(activeSpeakerStore.activeSpeaker);
      return;
    }

    if (participants.length === 0) {
      setActiveSpeaker(currentUser);
      return;
    }

    setActiveSpeaker(participants[0]);
  }, [activeSpeakerStore.activeSpeaker]);

  return !activeSpeaker ? null : (
    <div className="SidebarSpeaker">
      {(activeSpeaker || screenShareEnabled) &&
        !filePresentationEnabled &&
        !videoPresentationEnabled && (
          <ScreenshareMode
            participants={participants}
            participant={activeSpeaker}
            isAdmin={isAdmin}
            isAdminActived={isAdminActived}
            kickParticipant={kickParticipant}
            toggleMicrophone={toggleMicrophone}
            isWidgetFullScreenOn={forceFullscreen || isWidgetFullScreenOn}
            screenShareEnabled={screenShareEnabled}
            filePresentationEnabled={filePresentationEnabled}
            currentUser={currentUser}
            isScreenshare={isScreenshare}
            screenShareStream={screenShareStream}
            dolbyVoiceEnabled={dolbyVoiceEnabled}
            userIdStreamScreenShare={userIdStreamScreenShare}
          />
        )}
      {videoPresentationEnabled && (
        <VideoPresentationMode
          participants={participants}
          participant={activeSpeaker}
          isAdmin={isAdmin}
          isAdminActived={isAdminActived}
          kickParticipant={kickParticipant}
          toggleMicrophone={toggleMicrophone}
          isWidgetFullScreenOn={forceFullscreen || isWidgetFullScreenOn}
          screenShareEnabled={screenShareEnabled}
          videoPresentationEnabled={videoPresentationEnabled}
          isVideoPresentation={isVideoPresentation}
          currentUser={currentUser}
          isScreenshare={isScreenshare}
          screenShareStream={screenShareStream}
        />
      )}
      {filePresentationEnabled && (
        <FilePresentationMode
          participants={participants}
          participant={activeSpeaker}
          isAdmin={isAdmin}
          isAdminActived={isAdminActived}
          kickParticipant={kickParticipant}
          toggleMicrophone={toggleMicrophone}
          isWidgetFullScreenOn={forceFullscreen || isWidgetFullScreenOn}
          screenShareEnabled={screenShareEnabled}
          filePresentationEnabled={filePresentationEnabled}
          isFilePresentation={isFilePresentation}
          currentUser={currentUser}
          isScreenshare={isScreenshare}
          screenShareStream={screenShareStream}
          dolbyVoiceEnabled={dolbyVoiceEnabled}
        />
      )}
      <div className="SidebarList">
        <ul className="list-items">
          {((!isWebinar &&
            !currentUser.isListener &&
            currentUser.isConnected) ||
            (isWebinar && isAdmin)) && (
            <li className={"item small-item participant-available myself-item"}>
              <SpeakerVideo mySelf={true} participant={currentUser} />
              {isWidgetFullScreenOn && (
                <AttendeesParticipantBar
                  participant={currentUser}
                  dolbyVoiceEnabled={dolbyVoiceEnabled}
                />
              )}
            </li>
          )}
          {participants.map((participant, i) => {
            if (participant.isConnected)
              return (
                <Speaker
                  key={participant.participant_id}
                  participant={participant}
                  toggleMicrophone={toggleMicrophone}
                  kickParticipant={kickParticipant}
                  isAdmin={isAdmin}
                  nbParticipant={i}
                  userIdStreamScreenShare={userIdStreamScreenShare}
                  userIdFilePresentation={userIdFilePresentation}
                  userIdVideoPresentation={userIdVideoPresentation}
                  screenShareEnabled={screenShareEnabled}
                  activeSpeaker={activeSpeaker}
                  forceActiveUserEnabled={
                    activeSpeakerStore.forceActiveUserEnabled
                  }
                  isAdminActived={isAdminActived}
                  isWidgetFullScreenOn={isWidgetFullScreenOn}
                  disableForceActiveSpeaker={disableForceActiveSpeaker}
                  forceActiveSpeaker={forceActiveSpeaker}
                  dolbyVoiceEnabled={dolbyVoiceEnabled}
                  kickPermission={kickPermission}
                  currentUser={currentUser}
                  spatialAudioEnabled={spatialAudioEnabled}
                />
              );
          })}
        </ul>
      </div>
    </div>
  );
};

Speakers.propTypes = {
  participants: PropTypes.array.isRequired,
  forceActiveSpeaker: PropTypes.func.isRequired,
  disableForceActiveSpeaker: PropTypes.func.isRequired,
  userIdStreamScreenShare: PropTypes.string,
  isWebinar: PropTypes.bool.isRequired,
  isScreenshare: PropTypes.bool,
  isFilePresentation: PropTypes.bool,
  isVideoPresentation: PropTypes.bool,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  screenShareEnabled: PropTypes.bool.isRequired,
  filePresentationEnabled: PropTypes.bool.isRequired,
  videoPresentationEnabled: PropTypes.bool.isRequired,
  userIdFilePresentation: PropTypes.string,
  userIdVideoPresentation: PropTypes.string,
  screenShareStream: PropTypes.object,
  userStream: PropTypes.object,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
  kickPermission: PropTypes.bool,
};

export default connect(
  (state) => {
    return {
      currentUser: state.voxeet.participants.currentUser,
      activeSpeakerStore: state.voxeet.activeSpeaker,
      userIdStreamScreenShare:
        state.voxeet.participants.userIdStreamScreenShare,
    };
  },
  null,
  null,
  { context: getUxKitContext() }
)(Speakers);
