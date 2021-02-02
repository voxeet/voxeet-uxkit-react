import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import { Actions as ChatActions } from "../../actions/ChatActions";
import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import { strings } from "../../languages/localizedStrings";
import Autolinker from "autolinker";
import { CHAT_MESSAGE } from "./../../constants/BroadcastMessageType";
import userPlaceholder from "../../../static/images/user-placeholder.png";
import AttendeesChatInputContainer from "./AttendeesChatInputContainer";

@connect(store => {
  return {
    chatStore: store.voxeet.chat
  };
})
class AttendeesChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      runningAnimation: false
    };
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.attendeesChatOpened) {
      var scrollBar = document.getElementById("chat-scrollbar");
      if (scrollBar && (prevProps.chatStore != this.props.chatStore)) scrollBar.scrollTop = scrollBar.scrollHeight;
    }
    if (
      this.props.attendeesChatOpened == true &&
      prevProps.attendeesChatOpened == false
    ) {
      var contentInputChat = document.getElementById("contentInputChat");
      setTimeout(() => {
        contentInputChat.focus();
      }, 250);
    }
  }

  componentDidMount() {
    var scrollBar = document.getElementById("chat-scrollbar");
    if (scrollBar) scrollBar.scrollTop = scrollBar.scrollHeight;
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this.props.attendeesChatOpened == true &&
      nextProps.attendeesChatOpened == false
    ) {
      this.setState({ runningAnimation: true });
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
  }

  sendMessage(content) {
    const { currentUser } = this.props;
    if (content.trim().length > 0) {
      const payload = {
        content: content,
        time: Date.now(),
        type: "text",
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl || userPlaceholder,
        ownerId: currentUser.participant_id
      };
      this.props.dispatch(ChatActions.addMessage(payload));
      this.props.dispatch(
        ConferenceActions.sendBroadcastMessage(CHAT_MESSAGE, null, payload)
      );
    }
  }

  urlify(text) {
    const message = text.trim();
    const autolinker = new Autolinker();
    const matches = autolinker.parse(message);
    const matchedUrls = matches.map(match => match.url);
    const firstUrl = matches.find(match => match.url) || {};
    const autoLinkedMessage = {
      __html: Autolinker.link(message)
    };
    return autoLinkedMessage;
  }

  render() {
    const { participants, currentUser, attendeesChatOpened, conferencePermissions } = this.props;
    const { runningAnimation } = this.state;
    const { messages } = this.props.chatStore;
    return (
      <div
        className={
          runningAnimation
            ? "attendees-chat attendees-chat-out"
            : attendeesChatOpened
            ? "attendees-chat"
            : "attendees-chat-hidden"
        }
      >
        <div className="attendees-chat-header">
          <h1>{strings.chat}</h1>
          {/* <a
              className="icon-close"
              title="Close"
              currentitem="false"
              onClick={() => this.togglePopUp()}
            ></a> */}
        </div>
        {/* <div className="attendees-chat-header name-conversation-heder">
          <h3 className='white'>#</h3>
          <h3 className='name-conversation'>{strings.nameConversation}</h3>
        </div> */}
        <ul id="chat-scrollbar">
          {messages.map((message, i) => {
            let time = new Intl.DateTimeFormat('en-US', {hour: '2-digit', minute: '2-digit'}).format(message.time);
            let messageContent = this.urlify(message.content);
            if (message.ownerId != currentUser.participant_id) {
              return (
                <li key={i}>
                  <div className='chat-time'>{time}</div>
                  <div className="chat-container">
                    <div>
                      <img src={message.avatarUrl} />
                    </div>
                    <div>
                      <span className="chat-name">{message.name}</span>
                      <div
                        dangerouslySetInnerHTML={messageContent}
                        className="chat-content"
                      ></div>
                    </div>
                  </div>
                </li>
              );
            } else {
              return (
                <li key={i}>
                <div className='chat-time'>{time}</div>
                  <div className="chat-container-myself">
                    <div>
                      <span className="chat-name-myself">{message.name}</span>
                      <div
                        dangerouslySetInnerHTML={messageContent}
                        className="chat-content-myself"
                      ></div>
                    </div>
                    <div>
                      <img src={message.avatarUrl} />
                    </div>
                  </div>
                </li>
              );
            }
          })}
        </ul>
        { conferencePermissions.has("SEND_MESSAGE") && (
        <AttendeesChatInputContainer sendMessage={this.sendMessage} /> )}
      </div>
    );
  }
}

AttendeesChat.propTypes = {
  attendeesChatOpened: PropTypes.bool.isRequired,
  participants: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired
};

export default AttendeesChat;