import { Types } from "../actions/ControlsActions";
import modes from "../constants/DisplayModes";
import sounds from "../libs/sounds";

const defaultState = {
  isWidgetOpened: false,
  isWidgetFullScreenOn: false,
  isMuted: false,
  videoEnabled: false,
  audioEnabled: true,
  displayModal: false,
  audio3DEnabled: true,
  isScreenshare: false,
  isFilePresentation: false,
  closeSessionAtHangUp: true,
  isVideoPresentation: false,
  constraints: null,
  isRecording: false,
  videoRatio: null,
  chromeExtensionId: null,
  isAdminActived: false,
  disableSounds: false,
  isKickOnHangUpActived: false,
  recordingLocked: false,
  simulcast: false,
  modalOpened: true,
  displayActions: [
    "mute",
    "recording",
    "share",
    "video",
    "attendees",
    "chat",
    "pstn"
  ],
  conferencePermissions: new Set([
    "INVITE",
    "UPDATE_PERMISSIONS",
    "KICK",
    "JOIN",
    "SEND_AUDIO",
    "SEND_VIDEO",
    "SHARE_SCREEN",
    "SHARE_VIDEO",
    "SHARE_FILE",
    "SEND_MESSAGE",
    "RECORD",
    "STREAM"
  ]),
  shareActions: ["screenshare", "filepresentation", "videopresentation"],
  displayModes: ["tiles", "speaker", "list"],
  mode: "tiles",
  modeSaveBeforePresentation: "tiles",
  displayAttendeesList: false,
  displayAttendeesSettings: false,
  displayAttendeesChat: false,
  audioTransparentMode: false,
  maxVideoForwarding: undefined,
  requestedVideos: [],
  virtualBackgroundMode: null
};

const ControlsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.TOGGLE_WIDGET:
      return {
        ...state,
        isWidgetOpened: !state.isWidgetOpened,
        isWidgetFullScreenOn: false
      };
    case Types.DISABLE_SOUNDS: {
      return {
        ...state,
        disableSounds: true
      };
    }
    case Types.SET_SIMULCAST: {
      return {
        ...state,
        simulcast: action.payload.simulcast
      }
    }
    case Types.FORCE_MODE:
      return {
        ...state,
        modeSaved: state.mode,
        mode: action.payload.mode
      };
    case Types.SET_CHROME_EXTENSION_ID:
      return {
        ...state,
        chromeExtensionId: action.payload.chromeExtensionId
      };
    case Types.SET_VIDEO_RATIO:
      return {
        ...state,
        videoRatio: action.payload.videoRatio
      };
    case Types.SAVE_CONSTRAINTS:
      return {
        ...state,
        constraints: action.payload.constraints
      };
    case Types.TOGGLE_SCREEN_SHARE_MODE:
      return {
        ...state,
        isScreenshare: action.payload.isScreenshare,
        mode: action.payload.isScreenshare ? state.mode : state.modeSaved
      };
    case Types.TOGGLE_VIDEO_PRESENTATION_MODE:
      return {
        ...state,
        isVideoPresentation: action.payload.isVideoPresentation,
        mode: action.payload.isVideoPresentation ? state.mode : state.modeSaved
      };
    case Types.TOGGLE_FILE_PRESENTATION_MODE:
      return {
        ...state,
        isFilePresentation: action.payload.isFilePresentation,
        mode: action.payload.isFilePresentation ? state.mode : state.modeSaved
      };
    case Types.TOGGLE_FULLSCREEN:
      const fullScreenStatus = !state.isWidgetFullScreenOn;
      return {
        ...state,
        isWidgetOpened: fullScreenStatus || state.isWidgetOpened,
        isWidgetFullScreenOn: fullScreenStatus
      };
    case Types.CLOSE_SESSION_HANG_UP:
      return {
        ...state,
        closeSessionAtHangUp: action.payload.closeSessionAtHangUp
      };
    case Types.ADMIN_ACTIVED:
      return {
        ...state,
        isAdminActived: true
      };
    case Types.DISPLAY_MODES_ALLOWED:
      return {
        ...state,
        displayModes: action.payload.displayModes,
        mode: action.payload.displayModes[0]
      };
    case Types.DISPLAY_ACTIONS_ALLOWED:
      return {
        ...state,
        displayActions: action.payload.displayActions
      };
    case Types.SHARE_ACTIONS_ALLOWED:
      return {
        ...state,
        shareActions: action.payload.shareActions
      };
    case Types.KICK_ON_HANG_UP:
      return {
        ...state,
        isKickOnHangUpActived: true
      };
    case Types.UNLOCK_RECORDING:
      return {
        ...state,
        recordingLocked: false
      };
    case Types.LOCK_RECORDING: {
      if (!state.disableSounds) {
        const audio = new Audio(sounds.call_recorded);
        audio.play().catch((e) => {
          console.error('Could not play the sound', e.message)
        });;
      }
      return {
        ...state,
        recordingLocked: true
      };
    }
    case Types.TOGGLE_MODE:
      let currentModeIndex = state.displayModes.findIndex(
        m => m === state.mode
      );
      if (
        currentModeIndex + 1 == state.displayModes.length ||
          state.displayModes[currentModeIndex + 1] == "list"
      ) {
        currentModeIndex = 0;
        if (
          state.displayModes[currentModeIndex] == "list"
        ) {
          currentModeIndex++;
        }
      } else {
        currentModeIndex++;
      }
      return {
        ...state,
        mode: state.displayModes[currentModeIndex] || state.displayModes[0]
      };
    case Types.TOGGLE_MICROPHONE: {
      const currentStatus = state.isMuted;
      if (!state.disableSounds) {
        const audio = new Audio(!currentStatus ? sounds.mute_off : sounds.mute_on);
        audio.play().catch((e) => {
          console.error('Could not play the sound', e.message)
        });;
      }
      return {
        ...state,
        isMuted: !currentStatus
      };
    }
    case Types.TOGGLE_VIDEO: {
      const currentStatus = action.payload.state;
      return {
        ...state,
        videoEnabled: currentStatus
      };
    }
    case Types.TOGGLE_AUDIO_TRANSPARENT_MODE: {
      const currentStatus = state.audioTransparentMode;
      return {
        ...state,
        audioTransparentMode: !currentStatus
      };
    }
    case Types.SET_AUDIO_TRANSPARENT_MODE: {
      const audioTransparentMode = action.payload.audioTransparentMode;
      return {
        ...state,
        audioTransparentMode
      };
    }
    case Types.TOGGLE_MAX_REMOTE_PARTICIPANTS: {
      return {
        ...state,
        maxVideoForwarding: action.payload.maxVideoForwarding
      };
    }
    case Types.TOGGLE_AUDIO: {
      const currentStatus = action.payload.state;
      return {
        ...state,
        audioEnabled: currentStatus,
        isMuted: !currentStatus
      };
    }
    case Types.TOGGLE_MODAL: {
      const currentStatus = state.displayModal;
      return {
        ...state,
        displayModal: !currentStatus
      };
    }
    case Types.TOGGLE_RECORDING: {
      const currentStatus = state.isRecording;
      if (!currentStatus && !state.disableSounds) {
        const audio = new Audio(sounds.call_recorded);
        audio.play().catch((e) => {
          console.error('Could not play the sound', e.message)
        });;
      }
      return {
        ...state,
        isRecording: !currentStatus
      };
    }
    case Types.TOGGLE_AUDIO3D: {
      const currentStatus = state.audio3DEnabled;
      return {
        ...state,
        audio3DEnabled: !currentStatus
      };
    }
    case Types.TOGGLE_MODAL_WIDGET: {
      const currentStatus = state.modalOpened;
      return {
        ...state,
        modalOpened: !currentStatus
      };
    }
    case Types.RESET_WIDGET_CONTROLS: {
      return {
        ...state,
        isWidgetOpened: false,
        isWidgetFullScreenOn: false,
        isMuted: false,
        videoEnabled: false,
        displayModal: false,
        constraints: null,
        recordingLocked: false,
        audio3DEnabled: true,
        isScreenshare: false,
        isRecording: false,
        isExternalLive: false,
        isAdminActived: false,
        isKickOnHangUpActived: false,
        modalOpened: true
      };
    }
    case Types.TOGGLE_ATTENDEES_CHAT: {
      return {
        ...state,
        displayAttendeesChat: !state.displayAttendeesChat,
        displayAttendeesList: false,
        displayAttendeesSettings: false
      };
    }
    case Types.TOGGLE_ATTENDEES_LIST: {
      return {
        ...state,
        displayAttendeesList: !state.displayAttendeesList,
        displayAttendeesChat: false,
        displayAttendeesSettings: false
      };
    }
    case Types.TOGGLE_ATTENDEES_SETTINGS: {
      return {
        ...state,
        displayAttendeesSettings: !state.displayAttendeesSettings,
        displayAttendeesChat: false,
        displayAttendeesList: false
      };
    }
    case Types.TOGGLE_REQUESTED_VIDEO: {
      const participant_id = action.payload.participant_id;
      const requested = state.requestedVideos.indexOf(participant_id)>-1;
      let rv = !requested? [...state.requestedVideos, participant_id]:state.requestedVideos.filter(id=>id!=participant_id);
      return {
        ...state,
        requestedVideos: rv
      };
    }
    case Types.SET_REQUESTED_VIDEO: {
      const participant_id = action.payload.participant_id;
      const fw_state = action.payload.state;
      const requested = state.requestedVideos.indexOf(participant_id)>-1;
      if(fw_state===requested)
        return state;
      let rv = !requested? [...state.requestedVideos, participant_id]:state.requestedVideos.filter(id=>id!=participant_id);
      return {
        ...state,
        requestedVideos: rv
      };
    }
    case Types.SET_CONFERENCE_PERMISSIONS: {
      return {
        ...state,
        conferencePermissions: action.payload.conferencePermissions
      };
    }
    case Types.SET_VIRTUAL_BACKGROUND_MODE:
      return {
        ...state,
        virtualBackgroundMode: action.payload.mode
      };
    default:
      return state;
  }
};

export default ControlsReducer;
