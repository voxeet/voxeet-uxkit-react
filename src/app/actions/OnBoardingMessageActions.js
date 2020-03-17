export const Types = {
  DISPLAY_ON_BOARDING: "DISPLAY_ON_BOARDING",
  HIDE_ON_BOARDING: "HIDE_ON_BOARDING"
};

export class Actions {
  static onBoardingDisplay(message, timer) {
    return {
      type: Types.DISPLAY_ON_BOARDING,
      payload: { message, timer }
    };
  }

  static hideOnBoarding() {
    return {
      type: Types.HIDE_ON_BOARDING
    };
  }
}
