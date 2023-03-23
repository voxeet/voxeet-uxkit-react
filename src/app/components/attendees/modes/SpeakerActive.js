import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import userPlaceholder from "../../../../static/images/user-placeholder.png";

import AttendeesParticipantBar from "../AttendeesParticipantBar";
import AttendeesParticipantVideo from "../AttendeesParticipantVideo";
import AttendeesParticipantFilePresentation from "../AttendeesParticipantFilePresentation";
import AttendeesParticipantVideoPresentation from "../AttendeesParticipantVideoPresentation";
import ToggleFullScreenScreenShare from "./ToggleFullScreenScreenShare";
import AttendeesParticipantVuMeter from "../AttendeesParticipantVuMeter";

class SpeakerActive extends Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      (!this.props.screenShareEnabled && nextProps.screenShareEnabled) ||
      (this.props.screenShareEnabled && !nextProps.screenShareEnabled)
    ) {
      return true;
    }
    if (this.props.screenShareStream.length !== nextProps.screenShareStream) {
      return true;
    }
    const checker = document.getElementById("video-active-video-on");
    return (
      (!this.props.screenShareEnabled &&
        ((checker != null && nextProps.participant.stream == null) ||
          (checker != null && !nextProps.participant.stream.active) ||
          (checker != null &&
            nextProps.participant.stream.getVideoTracks().length === 0) ||
          (checker == null && nextProps.participant.stream))) ||
      (this.props.mySelf && this.props.participant.name == null) ||
      this.props.mySelf !== nextProps.mySelf ||
      this.props.participant !== nextProps.participant
    );
  }

  render() {
    const {
      mySelf,
      participant,
      toggleMicrophone,
      isWidgetFullScreenOn,
      screenShareEnabled,
      isFilePresentation,
      filePresentationEnabled,
      videoPresentationEnabled,
      isVideoPresentation,
      screenShareStream,
      isAdmin,
      kickParticipant,
      isAdminActived,
      userStream,
      isScreenshare,
      dolbyVoiceEnabled,
      kickPermission,
      currentUser,
    } = this.props;
    const photoUrl = participant.avatarUrl || userPlaceholder;
    return (
      <div
        id={
          "video-active-video-" +
          (participant.stream &&
          participant.stream.active &&
          participant.stream.getVideoTracks().length > 0
            ? "on"
            : "off")
        }
        className="active-speaker"
      >
        <div
          className={"video-frame " + (screenShareEnabled && "screen-share")}
        >
          {participant &&
            !screenShareEnabled &&
            !filePresentationEnabled &&
            !videoPresentationEnabled && (
              <AttendeesParticipantBar
                kickParticipant={kickParticipant}
                isAdminActived={isAdminActived}
                isAdmin={isAdmin}
                participant={participant}
                toggleMicrophone={toggleMicrophone}
                dolbyVoiceEnabled={dolbyVoiceEnabled}
                kickPermission={kickPermission}
              />
            )}
          {filePresentationEnabled && (
            <AttendeesParticipantFilePresentation
              isFilePresentation={isFilePresentation}
            />
          )}

          {videoPresentationEnabled && (
            <AttendeesParticipantVideoPresentation
              isVideoPresentation={isVideoPresentation}
            />
          )}

          {!filePresentationEnabled && !videoPresentationEnabled && screenShareEnabled && (
            <Fragment>
              {screenShareStream.map((st) => {
                const isLocalScreenShare = currentUser.participant_id === st.userId;
                return (
                <div key={st.stream.id}
                  className="stream-media">
                  { !isLocalScreenShare &&
                    <ToggleFullScreenScreenShare streamId={st.stream.id}/>
                  }
                    <AttendeesParticipantVideo
                      streamId={st.stream.id}
                      muted={isLocalScreenShare}
                      stream={st.stream}
                      enableDbClick={!isLocalScreenShare}
                    />
                  </div>)
                })

              }
              </Fragment>
          )}
          {!filePresentationEnabled && !videoPresentationEnabled && !screenShareEnabled && (
            <Fragment>
              {(participant.stream &&
                participant.stream.active &&
                participant.stream.getVideoTracks().length > 0) ? (
                <div
                  className={
                    mySelf
                      ? "stream-media myself"
                      : "stream-media"
                  }
                >
                  <AttendeesParticipantVideo
                    muted={false}
                    stream={
                      participant.stream
                    }
                    enableDbClick={false}
                  />
                </div>
              ) : (
                <AttendeesParticipantVuMeter
                  participant={participant}
                  width={80}
                  height={80}
                  customClass={"preview-avatar"}
                  isActiveSpeaker={true}
                />
              )}
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

SpeakerActive.propTypes = {
  participant: PropTypes.object,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  isScreenshare: PropTypes.bool,
  isFilePresentation: PropTypes.bool,
  isVideoPresentation: PropTypes.bool,
  screenShareEnabled: PropTypes.bool,
  filePresentationEnabled: PropTypes.bool,
  videoPresentationEnabled: PropTypes.bool,
  screenShareStream: PropTypes.array,
  userStream: PropTypes.object,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired,
  mySelf: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
  kickPermission: PropTypes.bool,
  currentUser: PropTypes.object.isRequired,
};

export default SpeakerActive;
