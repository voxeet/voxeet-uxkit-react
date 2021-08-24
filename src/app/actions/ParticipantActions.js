export const Types = {
  PARTICIPANTS_CLEAR: "PARTICIPANTS_CLEAR",
  PARTICIPANT_ADDED: "PARTICIPANT_ADDED",
  PARTICIPANT_UPDATED: "PARTICIPANT_UPDATED",
  PARTICIPANT_STATUS_UPDATED: "PARTICIPANT_STATUS_UPDATED",
  PARTICIPANT_JOINED: "PARTICIPANT_JOINED",
  PARTICIPANT_LEFT: "PARTICIPANT_LEFT",
  HANDLE_ON_CONNECT: "HANDLE_ON_CONNECT",
  PARTICIPANTS_MOVES: "PARTICIPANTS_MOVES",
  INVITED_USERS: "INVITED_USERS",
  HANDLE_ON_LEAVE: "HANDLE_ON_LEAVE",
  SAVE_USER_POSITION: "SAVE_USER_POSITION",
  PARTICIPANTS_SAVE: "PARTICIPANTS_SAVE",
  WEBINAR_ACTIVATED: "WEBINAR_ACTIVATED",
  PARTICIPANTS_RESET: "PARTICIPANTS_RESET",
  PARTICIPANT_SPEAK: "PARTICIPANT_SPEAK",
  SAVE_CURRENT_USER: "SAVE_CURRENT_USER",
  PARTICIPANT_TOGGLE_MICROPHONE: "PARTICIPANT_TOGGLE_MICROPHONE",
  SCREENSHARE_STARTED: "SCREENSHARE_STARTED",
  SCREENSHARE_STOPPED: "SCREENSHARE_STOPPED",
  FILE_PRESENTATION_STARTED: "FILE_PRESENTATION_STARTED",
  FILE_PRESENTATION_STOPPED: "FILE_PRESENTATION_STOPPED",
  VIDEO_PRESENTATION_STARTED: "VIDEO_PRESENTATION_STARTED",
  VIDEO_PRESENTATION_STOPPED: "VIDEO_PRESENTATION_STOPPED",
  PARTICIPANT_3D_MOVE: "PARTICIPANT_3D_MOVE",
  PARTICIPANT_ADMIN: "PARTICIPANT_ADMIN",
  PARTICIPANT_ADDED_UPDATED: "PARTICIPANT_ADDED_UPDATED",
  USER_INVITED: "USER_INVITED",
  PARTICIPANT_QUALITY_UPDATED: "PARTICIPANT_QUALITY_UPDATED",
  STREAM_ADDED_FOR_PARTICIPANT: "STREAM_ADDED_FOR_PARTICIPANT",
};

export class Actions {
  static clearParticipantsList() {
    return {
      type: Types.PARTICIPANTS_CLEAR,
    };
  }

  static user3DMoved(userId, moved) {
    return {
      type: Types.PARTICIPANTS_MOVES,
      payload: {
        userId,
        moved,
      },
    };
  }

  static userInvited(externalId) {
    return {
      type: Types.USER_INVITED,
      payload: {
        externalId,
      },
    };
  }

  static setInvitedUsers(invitedUsers) {
    return {
      type: Types.INVITED_USERS,
      payload: {
        invitedUsers,
      },
    };
  }

  static webinarActivated() {
    return {
      type: Types.WEBINAR_ACTIVATED,
    };
  }

  static triggerHandleOnConnect() {
    return (dispatch, getState) => {
      const {
        voxeet: { participants },
      } = getState();
      if (participants.handleOnConnect != null) participants.handleOnConnect();
    };
  }

  static saveCurrentUser(name, avatarUrl, externalId, isListener = false) {
    return {
      type: Types.SAVE_CURRENT_USER,
      payload: {
        name,
        avatarUrl,
        externalId,
        isListener,
      },
    };
  }

  static handleOnLeave(handleOnLeave) {
    return (dispatch) => {
      dispatch({
        type: Types.HANDLE_ON_LEAVE,
        payload: {
          handleOnLeave,
        },
      });
    };
  }

  static handleOnConnect(handleOnConnect) {
    return (dispatch) => {
      dispatch({
        type: Types.HANDLE_ON_CONNECT,
        payload: {
          handleOnConnect,
        },
      });
    };
  }

  static onParticipantReset() {
    return {
      type: Types.PARTICIPANTS_RESET,
    };
  }

  static onParticipantAdmin() {
    return {
      type: Types.PARTICIPANT_ADMIN,
    };
  }

  static onParticipantSave() {
    return {
      type: Types.PARTICIPANTS_SAVE,
    };
  }

  static onParticipantAdded(userId, userInfo) {
    return {
      type: Types.PARTICIPANT_ADDED,
      payload: {
        userId,
        userInfo,
      },
    };
  }

  static onParticipantJoined(user, stream, disableSounds) {
    return {
      type: Types.PARTICIPANT_JOINED,
      payload: {
        user,
        disableSounds,
      },
    };
  }

  static onParticipantSpeak(userId, isSpeaking) {
    return {
      type: Types.PARTICIPANT_SPEAK,
      payload: {
        userId,
        isSpeaking,
      },
    };
  }

  static onParticipantUpdated(user, stream) {
    return {
      type: Types.PARTICIPANT_UPDATED,
      payload: {
        user,
        stream,
      },
    };
  }

  static onParticipantQualityUpdated(indicators) {
    let quality = {};

    for (let [key, value] of indicators) {
      let update = { audio: 0, video: 0 };
      if (value) {
        if (!isNaN(value.audio)) update.audio = value.audio;
        if (!isNaN(value.video)) update.video = value.video;
      }
      quality[key] = update;
    }
    return {
      type: Types.PARTICIPANT_QUALITY_UPDATED,
      payload: {
        quality,
      },
    };
  }

  static onParticipantStatusUpdated(userId, userInfo, status) {
    return {
      type: Types.PARTICIPANT_STATUS_UPDATED,
      payload: {
        userId,
        userInfo,
        status,
      },
    };
  }

  static onParticipantLeft(userId) {
    return {
      type: Types.PARTICIPANT_LEFT,
      payload: { userId },
    };
  }

  static onFilePresentationStarted(userId) {
    return {
      type: Types.FILE_PRESENTATION_STARTED,
      payload: { userId },
    };
  }

  static onVideoPresentationStarted(userId) {
    return {
      type: Types.VIDEO_PRESENTATION_STARTED,
      payload: { userId },
    };
  }

  static onVideoPresentationStopped() {
    return {
      type: Types.VIDEO_PRESENTATION_STOPPED,
    };
  }

  static onFilePresentationStopped() {
    return {
      type: Types.FILE_PRESENTATION_STOPPED,
    };
  }

  static onScreenShareStarted(userId, stream) {
    return {
      type: Types.SCREENSHARE_STARTED,
      payload: { userId, stream },
    };
  }

  static onScreenShareStopped() {
    return {
      type: Types.SCREENSHARE_STOPPED,
    };
  }

  static onParticipant3DMoves(userId, x, y) {
    return {
      type: Types.PARTICIPANT_3D_MOVE,
      payload: { userId, x, y },
    };
  }

  static onToogleMicrophone(userId, status) {
    return {
      type: Types.PARTICIPANT_TOGGLE_MICROPHONE,
      payload: { userId, status },
    };
  }

  static saveUserPosition(userId, relativePosition, position) {
    return {
      type: Types.SAVE_USER_POSITION,
      payload: { userId, relativePosition, position },
    };
  }

  static onStreamAddedForParticipant(user, stream, disableSounds) {
    return {
      type: Types.STREAM_ADDED_FOR_PARTICIPANT,
      payload: {
        user,
        stream},
    };
  }
}
