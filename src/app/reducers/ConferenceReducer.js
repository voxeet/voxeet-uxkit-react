import { Types } from "../actions/ConferenceActions";
import sounds from "../libs/sounds";

const defaultState = {
  conferenceId: null,
  conferencePincode: null,
  initialized: false,
  connecting: false,
  isLive: false,
  isReplaying: false,
  isDemo: false,
  conferenceReplayId: null,
  hasLeft: false,
  time: 0,
  isJoined: false,
  dolbyVoiceEnabled: true
};

const ConferenceReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.INCREMENT_TIME:
      return {
        ...state,
        time: action.payload.time
      };
    case Types.CONFERENCE_CONNECTING:
      return {
        ...state,
        connecting: true,
        isReplaying: false
      };
    case Types.CONFERENCE_DEMO:
      return {
        ...state,
        isDemo: true
      };
    case Types.CONFERENCE_REPLAYING:
      return {
        ...state,
        connecting: true,
        conferenceReplayId: action.payload.conferenceReplayId,
        isReplaying: true
      };
    case Types.CONFERENCE_JOINED: {
      return {
        ...state,
        conferenceId: action.payload.conferenceId,
        conferencePincode: action.payload.conferencePincode,
        dolbyVoiceEnabled: action.payload.dolbyVoiceEnabled,
        connecting: false,
        hasLeft: false,
        isJoined: true
      };
    }
    case Types.CONFERENCE_LEAVE: {
      if (!action.payload.disableSounds) {
        const audio = new Audio(sounds.conference_exit);
        audio.play().catch((e) => {
          console.error('Could not play the sound', e.message)
        });;
      }
      return {
        ...state,
        conferenceId: null,
        conferencePincode: null,
        initialized: false,
        connecting: false,
        isLive: false,
        hasLeft: true,
        isReplaying: false,
        isDemo: false,
        conferenceReplayId: null,
        time: 0,
        isJoined: false
      };
    }
    case Types.REPLAY_ENDED: {
      return {
        ...state,
        initialized: true,
        time: 0,
        conferenceReplayId: null,
        isReplaying: false,
        isJoined: false
      };
    }
    case Types.INITIALIZED_SUCCESS:
      return {
        ...state,
        initialized: true,
        userId: action.payload.userId
      };
    default:
      return state;
  }
};

export default ConferenceReducer;
