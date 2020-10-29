import { Types } from "../actions/ParticipantWaitingActions";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import {
  STATUS_CONNECTING,
  STATUS_LEFT,
  STATUS_INACTIVE,
  STATUS_CONNECTED,
} from "../constants/ParticipantStatus";

const defaultState = {
  participants: [],
};

const ParticipantsWaitingReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.PARTICIPANT_WAITING_ADDED: {
      const userInfo = action.payload.userInfo;
      if (VoxeetSDK.session.participant.id != action.payload.userId) {
        let participants = [...state.participants];
        const index = participants.findIndex(
          (p) => p.participant_id === action.payload.userId
        );
        if (index === -1) {
          participants.push({
            participant_id: action.payload.userId,
            name: userInfo.info.name,
            avatarUrl: userInfo.info.avatarUrl,
            externalId: userInfo.info.externalId,
            stream: null,
            type: userInfo.type,
            metadata: userInfo.metadata,
            isAdmin: userInfo.metadata.admin === "true",
            isConnected: false,
            status: "Connecting",
            isMuted: false,
            x: -1,
            y: -1,
          });
        }
        return {
          ...state,
          participants: [...participants],
        };
      }
      return state;
    }
    case Types.PARTICIPANT_WAITING_STATUS_UPDATED: {
      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );

      if (VoxeetSDK.session.participant.id === action.payload.userId)
        return { ...state };

      if (index === -1) return state;
      participants[index].status = action.payload.status;
      participants[index].type = action.payload.type;
      participants[index].isConnected =
        action.payload.status == "Connected" ? true : false;
      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_WAITING_UPDATED: {
      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );

      if (VoxeetSDK.session.participant.id === action.payload.userId)
        return { ...state };

      if (index === -1) return state;
      if (action.payload.stream != null)
        participants[index].stream = action.payload.stream;
      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_WAITING_JOINED: {
      const participants = [...state.participants];

      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );

      if (VoxeetSDK.session.participant.id === action.payload.userId)
        return { ...state };

      if (index === -1) return state;
      if (action.payload.stream != null)
        participants[index].stream = action.payload.stream;
      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_WAITING_LEFT: {
      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );

      if (VoxeetSDK.session.participant.id === action.payload.userId)
        return { ...state, participants: [] };

      if (index === -1) return state;
      participants[index].stream = null;
      participants[index].isConnected = false;
      participants[index].status = STATUS_LEFT;

      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_WAITING_RESET: {
      return {
        participants: [],
      };
    }
    default:
      return state;
  }
};

export default ParticipantsWaitingReducer;
