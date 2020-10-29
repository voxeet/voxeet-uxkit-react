import { Types } from "../actions/OnBoardingMessageWithActionActions";

const defaultState = {
  displayOnBoardingMessageWithAction: false,
  linkWithAction: null,
  isError: false,
  messageWithAction: null,
  displayOnBoardingMessageWithDescription: false,
  linkWithHelp: null,
  title: null,
  description: null,
  displayOnBoardingMessageOverlay: false,
  displayOnBoardingMessageWithConfirmation: false,
  messageWithConfirmation: null,
  withCancelOption: false,
  confirmButtonTitle: "",
};

const OnBoardingMessageWithActionReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.DISPLAY_ON_BOARDING_WITH_ACTION:
      return {
        displayOnBoardingMessageWithAction: true,
        messageWithAction: action.payload.messageWithAction,
        isError: action.payload.isError,
        linkWithAction: action.payload.linkWithAction,
      };
    case Types.HIDE_ON_BOARDING_WITH_ACTION:
      return {
        displayOnBoardingMessageWithAction: false,
        messageWithAction: state.messageWithAction,
        isError: false,
      };
    case Types.DISPLAY_ON_BOARDING_WITH_DESCRIPTION:
      return {
        displayOnBoardingMessageWithDescription: true,
        title: action.payload.title,
        description: action.payload.description,
        isError: action.payload.isError,
        linkWithHelp: action.payload.linkWithHelp
      };
    case Types.HIDE_ON_BOARDING_WITH_DESCRIPTION:
      return {
        displayOnBoardingMessageWithDescription: false,
        title: state.title,
        description: state.description,
        isError: false,
        linkWithHelp: state.linkWithHelp
      };
    case Types.DISPLAY_ON_BOARDING_OVERLAY:
      return {
        displayOnBoardingMessageOverlay: true,
        description: action.payload.description,
        title: action.payload.title
      };
    case Types.HIDE_ON_BOARDING_OVERLAY:
      return {
        displayOnBoardingMessageOverlay: false,
        description: state.description,
        title: state.title
      };
    case Types.DISPLAY_ON_BOARDING_WITH_CONFIRMATION:
      return {
        displayOnBoardingMessageWithConfirmation: true,
        messageWithConfirmation: action.payload.messageWithConfirmation,
        confirmButtonTitle: action.payload.confirmButtonTitle,
        withCancelOption: action.payload.withCancelOption,
        actionCallback: action.payload.actionCallback,
      };
    case Types.HIDE_ON_BOARDING_WITH_CONFIRMATION:
      return {
        displayOnBoardingMessageWithConfirmation: false,
        messageWithConfirmation: state.messageWithConfirmation,
        actionCallback: state.actionCallback,
        withCancelOption: false,
        confirmButtonTitle: state.confirmButtonTitle
      };

    default:
      return state;
  }
};

export default OnBoardingMessageWithActionReducer;
