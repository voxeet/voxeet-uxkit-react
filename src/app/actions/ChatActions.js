export const Types = {
  ADD_MESSAGE_CHAT: "ADD_MESSAGE_CHAT",
  RESET_BADGE_MESSAGE_CHAT: "RESET_BADGE_MESSAGE_CHAT",
  CLEAR_MESSAGES: "CLEAR_MESSAGES",
  NEW_BADGE_MESSAGE_CHAT: "NEW_BADGE_MESSAGE_CHAT"
};

export class Actions {
  static addMessage(chat) {
    return {
      type: Types.ADD_MESSAGE_CHAT,
      payload: { chat }
    };
  }

  static clearMessages() {
    return {
      type: Types.CLEAR_MESSAGES
    };
  }

  static newBadgeMessage() {
    return {
      type: Types.NEW_BADGE_MESSAGE_CHAT
    };
  }

  static resetBadgeMessage() {
    return {
      type: Types.RESET_BADGE_MESSAGE_CHAT
    };
  }
}
