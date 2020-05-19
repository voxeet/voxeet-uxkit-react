import { Types } from "../actions/ChatActions";

const defaultState = {
  newMessage: false,
  messages: []
};

const ChatReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.ADD_MESSAGE_CHAT: {
      let messages = [...state.messages];
      messages.push({
        content: action.payload.chat.content,
        type: action.payload.chat.type,
        time: action.payload.chat.time,
        name: action.payload.chat.name,
        avatarUrl: action.payload.chat.avatarUrl,
        ownerId: action.payload.chat.ownerId
      });
      return {
        ...state,
        messages: [...messages]
      };
    }
    case Types.CLEAR_MESSAGES: {
      return {
        messages: [],
        newMessage: false
      };
    }
    case Types.NEW_BADGE_MESSAGE_CHAT: {
      return {
        ...state,
        newMessage: true
      };
    }
    case Types.RESET_BADGE_MESSAGE_CHAT: {
      return {
        ...state,
        newMessage: false
      };
    }
    default: {
      return state;
    }
  }
};

export default ChatReducer;
