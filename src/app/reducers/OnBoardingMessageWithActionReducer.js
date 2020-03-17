import { Types } from "../actions/OnBoardingMessageWithActionActions";

const defaultState = {
  displayOnBoardingMessageWithAction: false,
  linkWithAction: null,
  isError: false,
  messageWithAction: null
};

const OnBoardingMessageWithActionReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.DISPLAY_ON_BOARDING_WITH_ACTION:
      return {
        displayOnBoardingMessageWithAction: true,
        messageWithAction: action.payload.messageWithAction,
        isError: action.payload.isError,
        linkWithAction: action.payload.linkWithAction
      };
    case Types.HIDE_ON_BOARDING_WITH_ACTION:
      return {
        displayOnBoardingMessageWithAction: false,
        messageWithAction: state.messageWithAction,
        isError: false,
        linkWithAction: state.linkWithAction
      };
    default:
      return state;
  }
};

export default OnBoardingMessageWithActionReducer;
