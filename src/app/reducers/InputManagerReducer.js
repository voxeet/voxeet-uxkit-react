import { Types } from "../actions/InputManagerActions";

const defaultState = {
  currentAudioDevice: "",
  currentOutputDevice: "",
  currentVideoDevice: "",
  isBackCamera: false,
};

const InputManagerReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.INPUT_AUDIO_CHANGE:
      return {
        ...state,
        currentAudioDevice: action.payload.device
      };
    case Types.OUTPUT_AUDIO_CHANGE:
      return {
        ...state,
        currentOutputDevice: action.payload.device
      };
    case Types.INPUT_VIDEO_CHANGE:
      return {
        ...state,
        isBackCamera: action.payload.isBackCamera,
        currentVideoDevice: action.payload.device
      };
    default:
      return state;
  }
};

export default InputManagerReducer;