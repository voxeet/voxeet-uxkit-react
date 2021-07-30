import { Types } from "../actions/VideoPresentationActions";
const defaultState = {
  url: null,
  playing: false,
  ts: 0,
  player: null
};

const VideoPresentationReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.VIDEO_PRESENTATION_PLAY: {
      return {
        ...state,
        playing: true
      };
    }
    case Types.VIDEO_PRESENTATION_PLAYER: {
      return {
        ...state,
        player: action.payload.player
      };
    }
    case Types.VIDEO_PRESENTATION_PAUSE: {
      return {
        ...state,
        playing: false
      };
    }
    case Types.VIDEO_PRESENTATION_SEEK: {
      if (state.player != null)
        state.player.seekTo(action.payload.ts, "seconds");
      return {
        ...state
      };
    }
    case Types.VIDEO_PRESENTATION_START: {
      return {
        ...state,
        playing: true,
        ts: action.payload.ts,
        url: action.payload.url
      };
    }
    case Types.VIDEO_PRESENTATION_STOP: {
      return {
        ...state,
        url: null,
        playing: false,
        player: null,
        ts: 0
      };
    }
    default: {
      return state;
    }
  }
};

export default VideoPresentationReducer;
