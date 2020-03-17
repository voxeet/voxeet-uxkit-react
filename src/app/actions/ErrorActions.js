import { Actions as ControlsActions } from "./ControlsActions";

export const Types = {
  ERROR: "ERROR",
  CLEAR_ERROR: "CLEAR_ERROR"
};

export class Actions {
  static onError(error) {
    return {
      type: Types.ERROR,
      payload: { error }
    };
  }

  static onClearError() {
    return {
      type: Types.CLEAR_ERROR
    };
  }
}
