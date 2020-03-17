import { Types } from "../actions/ActiveSpeakerActions";

const defaultState = {
  interval: null,
  activeSpeaker: null,
  forceActiveUserEnabled: false
};

const ActiveSpeakerReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.START_ACTIVE_SPEAKER:
      return {
        ...state,
        interval: action.payload.interval
      };
    case Types.STOP_ACTIVE_SPEAKER:
      if (state.interval) clearInterval(state.interval);
      return {
        ...state,
        interval: null
      };
    case Types.FORCE_ACTIVE_SPEAKER: {
      return {
        ...state,
        forceActiveUserEnabled: true,
        activeSpeaker: action.payload.participant
      };
    }
    case Types.DISABLE_FORCE_ACTIVE_SPEAKER: {
      return {
        ...state,
        forceActiveUserEnabled: false,
        activeSpeaker: null
      };
    }
    case Types.PARTICIPANT_SPEAKING: {
      return {
        ...state,
        activeSpeaker: action.payload.participant
      };
    }
    default:
      return state;
  }
};

export default ActiveSpeakerReducer;
