export const Types = {
  DISPLAY_ON_BOARDING_WITH_ACTION: "DISPLAY_ON_BOARDING_WITH_ACTION",
  HIDE_ON_BOARDING_WITH_ACTION: "HIDE_ON_BOARDING_WITH_ACTION",
  DISPLAY_ON_BOARDING_WITH_DESCRIPTION: "DISPLAY_ON_BOARDING_WITH_DESCRIPTION",
  HIDE_ON_BOARDING_WITH_DESCRIPTION: "HIDE_ON_BOARDING_WITH_DESCRIPTION",
  DISPLAY_ON_BOARDING_OVERLAY: "DISPLAY_ON_BOARDING_OVERLAY",
  HIDE_ON_BOARDING_OVERLAY: "HIDE_ON_BOARDING_OVERLAY",
  DISPLAY_ON_BOARDING_WITH_CONFIRMATION: "DISPLAY_ON_BOARDING_WITH_CONFIRMATION",
  HIDE_ON_BOARDING_WITH_CONFIRMATION: "HIDE_ON_BOARDING_WITH_CONFIRMATION",
};

export class Actions {
  static onBoardingMessageWithAction(
    messageWithAction,
    linkWithAction,
    isError = false,
    actionCallback = null,
  ) {
    return {
      type: Types.DISPLAY_ON_BOARDING_WITH_ACTION,
      payload: { messageWithAction, linkWithAction, isError, actionCallback }
    };
  }

  static hideOnBoardingWithAction() {
    return {
      type: Types.HIDE_ON_BOARDING_WITH_ACTION
    };
  }

  static onBoardingMessageWithDescription(
      title,
      description,
      linkWithHelp,
      isError = false
  ) {
    return {
      type: Types.DISPLAY_ON_BOARDING_WITH_DESCRIPTION,
      payload: { title, description, linkWithHelp, isError }
    };
  }

  static hideOnBoardingMessageWithDescription() {
    return {
      type: Types.HIDE_ON_BOARDING_WITH_DESCRIPTION
    };
  }

  static onBoardingMessageOverlay(
      description,
      title
  ) {
    return {
      type: Types.DISPLAY_ON_BOARDING_OVERLAY,
      payload: { description, title }
    };
  }

  static hideOnBoardingMessageOverlay() {
    return {
      type: Types.HIDE_ON_BOARDING_OVERLAY
    };
  }
}
