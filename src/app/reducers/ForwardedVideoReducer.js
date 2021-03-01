import { Types } from "../actions/ForwardedVideoActions";

const defaultState = {
  participantIds: []
};

const ForwardedVideoReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.UPDATE_FORWARDED_VIDEOS:

      let array = Array.from(state.participantIds, ([participant_id, value]) => (participant_id));
      //console.log('About to update FV participantIds', array || []);
      return {
        ...state,
        participantIds: array || []
      };
    default:
      return state;
  }
};

export default ForwardedVideoReducer;
