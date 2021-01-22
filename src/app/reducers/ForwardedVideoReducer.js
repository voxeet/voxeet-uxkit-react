import { Types } from "../actions/ForwardedVideoActions";

const defaultState = {
  participantIds: []
};

const ForwardedVideoReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.UPDATE_FORWARDED_VIDEOS:
      //console.log('About to update FV participantIds', action.payload.participantIds || []);
      return {
        ...state,
        participantIds: action.payload.participantIds || []
      };
    default:
      return state;
  }
};

export default ForwardedVideoReducer;
