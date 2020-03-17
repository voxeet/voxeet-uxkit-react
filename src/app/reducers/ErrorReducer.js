import { Types } from "../actions/ErrorActions";

const defaultState = {
  errorMessage: null,
  isError: false
};

const ErrorReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.ERROR:
      return {
        ...state,
        isError: true,
        errorMessage: action.payload.error
      };
    case Types.CLEAR_ERROR:
      return defaultState;
    default:
      return state;
  }
};

export default ErrorReducer;
