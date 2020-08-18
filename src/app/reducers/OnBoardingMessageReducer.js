import { Types } from "../actions/OnBoardingMessageActions";

const defaultState = {
  displayOnBoardingMessage: false,
  timer: 3000,
  message: null,
};

const OnBoardingMessageReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.DISPLAY_ON_BOARDING:
      return {
        displayOnBoardingMessage: true,
        message: action.payload.message,
        timer: action.payload.timer
      };
    case Types.HIDE_ON_BOARDING:
      return {
        displayOnBoardingMessage: false,
        timer: 3000,
        message: state.message
      };
    default:
      return state;
  }
};

export default OnBoardingMessageReducer;
