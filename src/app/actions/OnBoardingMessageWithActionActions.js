export const Types = {
  DISPLAY_ON_BOARDING_WITH_ACTION: "DISPLAY_ON_BOARDING_WITH_ACTION",
  HIDE_ON_BOARDING_WITH_ACTION: "HIDE_ON_BOARDING_WITH_ACTION"
};

export class Actions {
  static onBoardingMessageWithAction(
    messageWithAction,
    linkWithAction,
    isError = false
  ) {
    return {
      type: Types.DISPLAY_ON_BOARDING_WITH_ACTION,
      payload: { messageWithAction, linkWithAction, isError }
    };
  }

  static hideOnBoardingWithAction() {
    return {
      type: Types.HIDE_ON_BOARDING_WITH_ACTION
    };
  }
}
