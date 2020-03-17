import { Actions as TimerActions } from "./TimerActions";

export const Types = {
  START_TIMER: "START_TIMER",
  STOP_TIMER: "STOP_TIMER",
  INCREMENT_TIMER: "INCREMENT_TIMER"
};

export class Actions {
  static startTime() {
    return dispatch => {
      let time = 0;
      this._interval = setInterval(() => {
        time++;
        return dispatch({
          type: Types.INCREMENT_TIMER,
          payload: {
            time
          }
        });
      }, 1000);
    };
  }

  static stopTime() {
    return dispatch => {
      const time = 0;
      clearInterval(this._interval);
      return dispatch({
        type: Types.INCREMENT_TIMER,
        payload: {
          time
        }
      });
    };
  }

  static incrementTime() {
    return {
      type: Types.INCREMENT_TIMER
    };
  }
}
