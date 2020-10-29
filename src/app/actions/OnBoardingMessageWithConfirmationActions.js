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

  static onBoardingMessageWithConfirmation(
    messageWithConfirmation,
    confirmButtonTitle,
    withCancelOption,
    actionCallback = null,
  ) {
    return {
      type: Types.DISPLAY_ON_BOARDING_WITH_CONFIRMATION,
      payload: { messageWithConfirmation, confirmButtonTitle, withCancelOption, actionCallback }
    };
  }

  static hideOnBoardingWithConfirmation() {
    return {
      type: Types.HIDE_ON_BOARDING_WITH_CONFIRMATION
    };
  }
}
