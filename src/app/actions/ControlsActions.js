export const Types = {
  TOGGLE_WIDGET: "TOGGLE_WIDGET",
  TOGGLE_FULLSCREEN: "TOGGLE_FULLSCREEN",
  TOGGLE_MODE: "TOGGLE_MODE",
  TOGGLE_MICROPHONE: "TOGGLE_MICROPHONE",
  TOGGLE_VIDEO: "TOGGLE_VIDEO",
  TOGGLE_AUDIO: "TOGGLE_AUDIO",
  DISPLAY_MODES_ALLOWED: "DISPLAY_MODES_ALLOWED",
  DISPLAY_ACTIONS_ALLOWED: "DISPLAY_ACTIONS_ALLOWED",
  SHARE_ACTIONS_ALLOWED: "SHARE_ACTIONS_ALLOWED",
  TOGGLE_MODAL: "TOGGLE_MODAL",
  FORCE_MODE: "FORCE_MODE",
  TOGGLE_SCREEN_SHARE_MODE: "TOGGLE_SCREEN_SHARE_MODE",
  TOGGLE_FILE_PRESENTATION_MODE: "TOGGLE_FILE_PRESENTATION_MODE",
  TOGGLE_VIDEO_PRESENTATION_MODE: "TOGGLE_VIDEO_PRESENTATION_MODE",
  TOGGLE_AUDIO3D: "TOGGLE_AUDIO3D",
  SET_CHROME_EXTENSION_ID: "SET_CHROME_EXTENSION_ID",
  SET_VIDEO_RATIO: "SET_VIDEO_RATIO",
  TOGGLE_RECORDING: "TOGGLE_RECORDING",
  TOGGLE_MODAL_WIDGET: "TOGGLE_MODAL_WIDGET",
  SAVE_CONSTRAINTS: "SAVE_CONSTRAINTS",
  ADMIN_ACTIVED: "ADMIN_ACTIVED",
  KICK_ON_HANG_UP: "KICK_ON_HANG_UP",
  RESET_WIDGET_CONTROLS: "RESET_WIDGET_CONTROLS",
  TOGGLE_ATTENDEES_LIST: "TOGGLE_ATTENDEES_LIST",
  TOGGLE_ATTENDEES_CHAT: "TOGGLE_ATTENDEES_CHAT",
  TOGGLE_ATTENDEES_SETTINGS: "TOGGLE_ATTENDEES_SETTINGS",
  UNLOCK_RECORDING: "UNLOCK_RECORDING",
  DISABLE_SOUNDS: "DISABLE_SOUNDS",
  LOCK_RECORDING: "LOCK_RECORDING",
  CLOSE_SESSION_HANG_UP: "CLOSE_SESSION_HANG_UP",
  SET_SIMULCAST: "SET_SIMULCAST",
  TOGGLE_AUDIO_TRANSPARENT_MODE: "TOGGLE_AUDIO_TRANSPARENT_MODE",
  SET_AUDIO_TRANSPARENT_MODE: "SET_AUDIO_TRANSPARENT_MODE",
  TOGGLE_MAX_REMOTE_PARTICIPANTS: "TOGGLE_MAX_REMOTE_PARTICIPANTS",
  TOGGLE_REQUESTED_VIDEO: "TOGGLE_REQUESTED_VIDEO",
  SET_REQUESTED_VIDEO: "SET_REQUESTED_VIDEO",
  SET_CONFERENCE_PERMISSIONS: "SET_CONFERENCE_PERMISSIONS",
  SET_VIRTUAL_BACKGROUND_MODE: "SET_VIRTUAL_BACKGROUND_MODE",
};

export class Actions {
  static toggleWidget() {
    return {
      type: Types.TOGGLE_WIDGET
    };
  }

  static setSimulcast(simulcast) {
    return {
      type: Types.SET_SIMULCAST,
      payload: {
        simulcast: simulcast
      }
    }
  }

  static toggleFullScreen() {
    return {
      type: Types.TOGGLE_FULLSCREEN
    };
  }

  static closeSessionAtHangUp(closeSessionAtHangUp) {
    return {
      type: Types.CLOSE_SESSION_HANG_UP,
      payload: {
        closeSessionAtHangUp: closeSessionAtHangUp
      }
    };
  }

  static setChromeExtensionId(chromeExtensionId) {
    return {
      type: Types.SET_CHROME_EXTENSION_ID,
      payload: {
        chromeExtensionId: chromeExtensionId
      }
    };
  }

  static saveConstraints(constraints) {
    return {
      type: Types.SAVE_CONSTRAINTS,
      payload: {
        constraints: constraints
      }
    };
  }

  static disableSounds() {
    return {
      type: Types.DISABLE_SOUNDS
    };
  }

  static setVideoRatio(videoRatio) {
    return {
      type: Types.SET_VIDEO_RATIO,
      payload: {
        videoRatio: videoRatio
      }
    };
  }

  static forceMode(mode) {
    return {
      type: Types.FORCE_MODE,
      payload: {
        mode: mode
      }
    };
  }

  static toggleScreenShareMode(isScreenshare) {
    return {
      type: Types.TOGGLE_SCREEN_SHARE_MODE,
      payload: {
        isScreenshare
      }
    };
  }

  static toggleFilePresentationMode(isFilePresentation) {
    return {
      type: Types.TOGGLE_FILE_PRESENTATION_MODE,
      payload: {
        isFilePresentation
      }
    };
  }

  static toggleVideoPresentationMode(isVideoPresentation) {
    return {
      type: Types.TOGGLE_VIDEO_PRESENTATION_MODE,
      payload: {
        isVideoPresentation
      }
    };
  }

  static toggleMode() {
    return {
      type: Types.TOGGLE_MODE
    };
  }

  static toggleAudio3D() {
    return {
      type: Types.TOGGLE_AUDIO3D
    };
  }

  static adminActived() {
    return {
      type: Types.ADMIN_ACTIVED
    };
  }

  static isKickOnHangUpActived() {
    return {
      type: Types.KICK_ON_HANG_UP
    };
  }

  static displayModesAllowed(displayModes) {
    return {
      type: Types.DISPLAY_MODES_ALLOWED,
      payload: {
        displayModes: displayModes
      }
    };
  }

  static shareActionsAllowed(shareActions) {
    return {
      type: Types.SHARE_ACTIONS_ALLOWED,
      payload: {
        shareActions: shareActions
      }
    };
  }

  static displayActionsAllowed(displayActions) {
    return {
      type: Types.DISPLAY_ACTIONS_ALLOWED,
      payload: {
        displayActions: displayActions
      }
    };
  }

  static toggleAudio(state) {
    return {
      type: Types.TOGGLE_AUDIO,
      payload: {
        state: state
      }
    };
  }

  static toggleMicrophone() {
    return {
      type: Types.TOGGLE_MICROPHONE
    };
  }

  static toggleVideo(state) {
    return {
      type: Types.TOGGLE_VIDEO,
      payload: {
        state: state
      }
    };
  }

  static toggleModal() {
    return {
      type: Types.TOGGLE_MODAL
    };
  }

  static toggleRecording() {
    return {
      type: Types.TOGGLE_RECORDING
    };
  }

  static lockRecording() {
    return {
      type: Types.LOCK_RECORDING
    };
  }

  static unlockRecording() {
    return {
      type: Types.UNLOCK_RECORDING
    };
  }

  static toggleModalWidget() {
    return {
      type: Types.TOGGLE_MODAL_WIDGET
    };
  }

  static resetWidgetControls() {
    return {
      type: Types.RESET_WIDGET_CONTROLS
    };
  }

  static toggleAttendeesList() {
    return {
      type: Types.TOGGLE_ATTENDEES_LIST
    };
  }

  static toggleAttendeesSettings() {
    return {
      type: Types.TOGGLE_ATTENDEES_SETTINGS
    };
  }

  static setAudioTransparentMode(state) {
    return {
      type: Types.SET_AUDIO_TRANSPARENT_MODE,
      payload: {
        audioTransparentMode : state
      }
    };
  }

  static toggleAudioTransparentMode() {
    return {
      type: Types.TOGGLE_AUDIO_TRANSPARENT_MODE
    };
  }

  static setMaxVideoForwarding(state) {
    return {
      type: Types.TOGGLE_MAX_REMOTE_PARTICIPANTS,
      payload: {
        maxVideoForwarding: state
      }
    };
  }

  static toggleAttendeesChat() {
    return {
      type: Types.TOGGLE_ATTENDEES_CHAT
    };
  }

  static toggleRequestedVideo(participant_id) {
    return {
      type: Types.TOGGLE_REQUESTED_VIDEO,
      payload: {
        participant_id
      }
    };
  }

  static setRequestedVideo(participant_id, state) {
    return {
      type: Types.SET_REQUESTED_VIDEO,
      payload: {
        participant_id,
        state
      }
    };
  }

  static setConferencePermissions(conferencePermissions) {
    return {
      type: Types.SET_CONFERENCE_PERMISSIONS,
      payload: {
        conferencePermissions
      }
    };
  }

  static setVirtualBackgroundMode(mode) {
    return {
      type: Types.SET_VIRTUAL_BACKGROUND_MODE,
      payload: {
        mode: mode
      }
    };
  }
}
