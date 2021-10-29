import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import { Types } from "../actions/ParticipantActions";
import { getOrganizedPosition, getRelativePosition } from "../libs/position";
import sounds from "../libs/sounds";
import { STATUS_CONNECTING, STATUS_LEFT } from "../constants/ParticipantStatus";

const defaultState = {
  participants: [],
  replayParticipantTmp: [],
  userStream: {
    stream: null,
  },
  currentUser: null,
  userStreamScreenShare: null,
  userIdStreamScreenShare: null,
  userIdFilePresentation: null,
  invitedUsers: null,
  userIdVideoPresentation: null,
  filePresentationEnabled: false,
  screenShareEnabled: false,
  videoPresentationEnabled: false,
  isSpeaking: false,
  isReplaying: false,
  isAdmin: false,
  isWebinar: false,
  handleOnConnect: null,
  handleOnLeave: null,
  quality: {},
};

const ParticipantReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.PARTICIPANTS_CLEAR: {
      return {
        ...state,
        participants: [],
        currentUser: null,
        userStreamScreenShare: null,
        userIdStreamScreenShare: null,
        userIdFilePresentation: null,
        userIdVideoPresentation: null,
        userStream: {
          stream: null,
        },
        screenShareEnabled: false,
        isSpeaking: false,
        isReplaying: false,
        quality: {},
      };
    }
    case Types.WEBINAR_ACTIVATED: {
      return {
        ...state,
        isWebinar: true,
      };
    }
    case Types.INVITED_USERS: {
      for (var i = 0; i < action.payload.invitedUsers.length; i++) {
        action.payload.invitedUsers[i]["invited"] = false;
      }
      return {
        ...state,
        invitedUsers: action.payload.invitedUsers,
      };
    }
    case Types.USER_INVITED:
      let invitedUsers = [...state.invitedUsers];
      for (let i = 0; i < invitedUsers.length; i++) {
        if (action.payload.externalId == invitedUsers[i]["externalId"]) {
          invitedUsers[i]["invited"] = true;
        }
      }
      return {
        ...state,
        invitedUsers: invitedUsers,
      };
    case Types.PARTICIPANTS_MOVES: {
      let participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );
      participants[index].isMoved = action.payload.moved;
      return {
        participants: [...participants],
        ...state,
      };
    }
    case Types.SAVE_CURRENT_USER: {
      let currentUser = { ...state.currentUser };
      currentUser = {
        name: action.payload.name,
        participant_id: VoxeetSDK.session.participant.id,
        avatarUrl: action.payload.avatarUrl,
        externalId: action.payload.externalId,
        isConnected: true,
        isMuted: false,
        isPresenter: false,
        isListener: action.payload.isListener,
        isMyself: true,
        ...currentUser,
      };
      return {
        ...state,
        currentUser: currentUser,
      };
    }
    case Types.HANDLE_ON_CONNECT:
      return {
        ...state,
        handleOnConnect: action.payload.handleOnConnect,
      };
    case Types.HANDLE_ON_LEAVE:
      return {
        ...state,
        handleOnLeave: action.payload.handleOnLeave,
      };
    case Types.PARTICIPANTS_RESET: {
      const replayParticipantTmp = [...state.replayParticipantTmp];
      return {
        ...state,
        participants: replayParticipantTmp,
        userStream: null,
        screenShareEnabled: false,
        isSpeaking: false,
        isReplaying: false,
      };
    }
    case Types.PARTICIPANT_ADMIN:
      return {
        ...state,
        isAdmin: true,
      };
    case Types.PARTICIPANTS_SAVE: {
      const participants = [...state.participants];
      return {
        ...state,
        replayParticipantTmp: participants,
        isReplaying: true,
      };
    }
    case Types.PARTICIPANT_SPEAK: {
      const userId = action.payload.userId;
      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );
      if (index === -1) return state;
      participants[index].isSpeaking = action.payload.isSpeaking;
      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_ADDED: {
      const userInfo = action.payload.userInfo;
      if (VoxeetSDK.session.participant.id != action.payload.user) {
        let participants = [...state.participants];
        const index = participants.findIndex(
          (p) => p.participant_id === action.payload.userId
        );
        if (index === -1) {
          participants.push({
            participant_id: action.payload.userId,
            name: userInfo.name,
            isMoved: false,
            avatarUrl: userInfo.avatarUrl,
            externalId: userInfo.externalId,
            type: userInfo.type,
            metadata: userInfo.metadata,
            isAdmin: userInfo.metadata.admin === "true",
            isConnected: userInfo.status == "Connected" ? true : false,
            status: userInfo.status,
            isMuted: false,
            x: -1,
            y: -1,
          });
        } else {
          participants[index].name = userInfo.name;
          participants[index].type = userInfo.type;
          participants[index].avatarUrl = userInfo.avatarUrl;
          participants[index].metadata = userInfo.metadata;
        }
        return {
          ...state,
          participants: [...participants],
        };
      }
      return state;
    }
    case Types.PARTICIPANT_JOINED: {
      const { userId } = action.payload;
      if (VoxeetSDK.session.participant.id === action.payload.user.id) {
        if (!action.payload.disableSounds) {
          const audio = new Audio(sounds.conference_join);
          audio.play().catch((e) => {
            console.error("Could not play the sound", e.message);
          });
        }
      }

      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.user.id
      );
      if (index === -1) {
        return state;
      }
      participants[index].isConnected =
        action.payload.user.status == "Connected" ? true : false;
      const size = participants.filter(
        (participant) => participant.isConnected === true
      ).length;
      const participantsConnect = participants.filter(
        (participant) => participant.isConnected === true
      );
      for (var i = 0; i < participantsConnect.length; i++) {
        if (!participantsConnect[i].isMoved) {
          const height = window.innerHeight - 85;
          const width = window.innerWidth;
          const index = i;
          const position = getOrganizedPosition({
            width: width,
            height: height,
            size: size,
            index: index,
          });
          const relativePosition = getRelativePosition(
            width,
            height,
            position.posX,
            position.posY
          );
          /*VoxeetSDK.setUserPosition(
            participantsConnect[i].participant_id,
            relativePosition.x,
            relativePosition.y
          );*/
          participantsConnect[i].x = position.posX;
          participantsConnect[i].y = position.posY;
        }
      }
      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_UPDATED:
      const { user } = action.payload;
      const participants = [...state.participants];
      if (VoxeetSDK.session.participant.id === user.id) {
        let currentUser = { ...state.currentUser };

        if (
          action.payload.stream &&
          action.payload.stream.getTracks().length > 0
        ) {
          currentUser = {
            ...currentUser,
            stream: action.payload.stream,
          };
          return {
            ...state,
            currentUser: currentUser,
            userStream: action.payload.stream,
          };
        }
        if (action.payload.stream && !action.payload.stream.active) {
          currentUser = {
            ...currentUser,
            stream: null,
          };
          return {
            ...state,
            currentUser: currentUser,
            userStream: null,
          };
        }

        if (currentUser != null) {
          currentUser.stream = null;
          return {
            ...state,
          };
        }
        return state;
      }

      const index = participants.findIndex((p) => p.participant_id === user.id);
      if (index === -1) {
        return state;
      }
      participants[index].isConnected =
        user.status == "Connected" ? true : false;
      participants[index].stream = null;
      if (
        action.payload.stream &&
        action.payload.stream.getVideoTracks().length > 0
      ) {
        participants[index] = {...participants[index], stream: action.payload.stream}
      }
      return {
        ...state,
        participants: [...participants],
      };
    case Types.PARTICIPANT_STATUS_UPDATED: {
      const userInfo = action.payload.userInfo;
      const status = action.payload.status;
      if (VoxeetSDK.session.participant.id != action.payload.userId) {
        let participants = [...state.participants];
        const index = participants.findIndex(
          (p) => p.participant_id === action.payload.userId
        );
        if (index === -1) {
          participants.push({
            participant_id: action.payload.userId,
            name: userInfo.name,
            isMoved: false,
            type: userInfo.type,
            avatarUrl: userInfo.avatarUrl,
            externalId: userInfo.externalId,
            metadata: userInfo.metadata,
            isAdmin: userInfo.metadata.admin === "true",
            isConnected: status == "Connected" ? true : false,
            status: status,
            stream: null,
            isMuted: false,
            x: -1,
            y: -1,
          });
        } else {
          participants[index].name = userInfo.name;
          participants[index].type = userInfo.type;
          participants[index].isConnected =
            status == "Connected" ? true : false;
          participants[index].avatarUrl = userInfo.avatarUrl;
          participants[index].metadata = userInfo.metadata;
          participants[index].status = status;
        }
        return {
          ...state,
          participants: [...participants],
        };
      }
      return state;
    }

    case Types.PARTICIPANT_LEFT: {
      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );

      if (VoxeetSDK.session.participant.id === action.payload.userId)
        return { ...state, participants: [] };

      if (index === -1) return state;
      participants[index].isConnected = false;
      participants[index].isMoved = false;
      participants[index].status = STATUS_LEFT;
      participants[index].x = -1;
      participants[index].y = -1;
      participants[index].stream = null;

      /*const size = participants.filter(
        participant => participant.isConnected === true
      ).length;
      const participantsConnect = participants.filter(
        participant => participant.isConnected === true
      );*/

      /*for (var i = 0; i < participantsConnect.length; i++) {
        if (!participantsConnect[i].isMoved) {
          const height = window.innerHeight - 85;
          const width = window.innerWidth;
          const index = i;
          const position = getOrganizedPosition({
            width: width,
            height: height,
            size: size,
            index: index
          });
          const relativePosition = getRelativePosition(
            width,
            height,
            position.posX,
            position.posY
          );
          VoxeetSDK.setUserPosition(
            participantsConnect[i].participant_id,
            relativePosition.x,
            relativePosition.y
          );
          participantsConnect[i].x = position.posX;
          participantsConnect[i].y = position.posY;
        }
      }*/

      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_3D_MOVE: {
      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );
      if (index === -1) return state;
      participants[index].x = action.payload.x;
      participants[index].y = action.payload.y;
      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_TOGGLE_MICROPHONE: {
      const userId = action.payload.userId;
      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.userId
      );
      if (index === -1) return state;
      participants[index].isMuted = !participants[index].isMuted;
      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.FILE_PRESENTATION_STARTED: {
      return {
        ...state,
        filePresentationEnabled: true,
        userIdFilePresentation: action.payload.userId,
      };
    }
    case Types.FILE_PRESENTATION_STOPPED: {
      return {
        ...state,
        filePresentationEnabled: false,
        userIdFilePresentation: null,
      };
    }
    case Types.VIDEO_PRESENTATION_STARTED: {
      return {
        ...state,
        videoPresentationEnabled: true,
        userIdVideoPresentation: action.payload.userId,
      };
    }
    case Types.VIDEO_PRESENTATION_STOPPED: {
      return {
        ...state,
        videoPresentationEnabled: false,
        userIdVideoPresentation: null,
      };
    }
    case Types.SCREENSHARE_STARTED: {
      return {
        ...state,
        screenShareEnabled: true,
        userIdStreamScreenShare: action.payload.userId,
        userStreamScreenShare: action.payload.stream,
      };
    }
    case Types.SCREENSHARE_STOPPED: {
      return {
        ...state,
        screenShareEnabled: false,
        userIdStreamScreenShare: null,
        userStreamScreenShare: null,
      };
    }
    case Types.SAVE_USER_POSITION: {
      const { userId, relativePosition, position } = action.payload;
      const participants = [...state.participants];
      const index = participants.findIndex((p) => p.participant_id === userId);
      if (index !== -1) {
        participants[index].x = position.posX;
        participants[index].y = position.posY;
        participants[index].relativeX = relativePosition.x;
        participants[index].relativeY = relativePosition.y;
      }
      return {
        ...state,
        participants: [...participants],
      };
    }
    case Types.PARTICIPANT_QUALITY_UPDATED: {
      return {
        ...state,
        quality: { ...action.payload.quality },
      };
    }
    case Types.STREAM_ADDED_FOR_PARTICIPANT: {
      if (VoxeetSDK.session.participant.id === action.payload.user.id) {
        let currentUser = { ...state.currentUser };
        if (
          action.payload.stream &&
          action.payload.stream.getTracks().length > 0
        ) {
          currentUser = {
            ...currentUser,
            stream: action.payload.stream,
          };
          return {
            ...state,
            currentUser: currentUser,
            userStream: action.payload.stream,
          };
        }
        if (action.payload.stream && !action.payload.stream.active) {
          currentUser = {
            ...currentUser,
            stream: null,
          };
          return {
            ...state,
            currentUser: currentUser,
            userStream: null,
          };
        }

        if (currentUser != null) {
          currentUser.stream = null;
          return {
            ...state,
          };
        }
        return state;
      }
      const participants = [...state.participants];
      const index = participants.findIndex(
        (p) => p.participant_id === action.payload.user.id
      );
      if (index === -1) {
        return state;
      }
      participants[index].stream = null;
      if (
        action.payload.stream &&
        action.payload.stream.getVideoTracks().length > 0
      ) {
        participants[index] = {...participants[index], stream: action.payload.stream}
        }
      return {
        ...state,
        participants: [...participants],
      };
    }
    default:
      return state;
  }
};

export default ParticipantReducer;
