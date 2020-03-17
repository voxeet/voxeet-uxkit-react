import { Types } from "../actions/TimerActions";

const defaultState = {
  time: 0
};

const TimerReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.INCREMENT_TIMER:
      return {
        time: action.payload.time
      };
    default:
      return state;
  }
};

export default TimerReducer;
