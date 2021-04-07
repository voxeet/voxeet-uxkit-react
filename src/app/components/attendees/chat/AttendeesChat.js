import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import MessageList from './MessageList';
import attachIcon from '../../../../static/images/icons/icon-attach.svg';
import sendIcon from '../../../../static/images/icons/icon-tag.svg';
import { strings } from "../../../languages/localizedStrings";
import userPlaceholder from "../../../../static/images/user-placeholder.png";
import { Actions as ChatActions } from "../../../actions/ChatActions";
import { Actions as ConferenceActions } from "../../../actions/ConferenceActions";
import { CHAT_MESSAGE } from "../../../constants/BroadcastMessageType";
import Autolinker from "autolinker";

class AttendeesChat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            runningAnimation: false,
            content: ''
        };
        this.sendMessage = this.sendMessage.bind(this);
        this.onContentChange = this.onContentChange.bind(this);
        this.escFunction = this.escFunction.bind(this);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction, false);
    }

    escFunction(event) {
        if (event.keyCode === 13) {
            this.sendMessage(this.state.content);
            this.setState({ content: "" });
            event.preventDefault();
        }
    }

    onContentChange(e) {
        let content = e.target.value;
        this.setState({ content: content });
    }

    componentDidMount() {
        var scrollBar = document.getElementById("chat-scrollbar");
        if (scrollBar) scrollBar.scrollTop = scrollBar.scrollHeight;
        document.addEventListener("keydown", this.escFunction, false);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let stateUpdate = { attendeesChatOpened: nextProps.attendeesChatOpened };
        // Check if it should run animation
        if (
            prevState.attendeesChatOpened == true &&
            nextProps.attendeesChatOpened == false
        ) {
            stateUpdate.runningAnimation = true;
        }
        return stateUpdate;
    }

    componentDidUpdate(prevProps) {
        // console.log('componentDidUpdate', this.props)
        if (
            prevProps.attendeesChatOpened == true &&
            this.props.attendeesChatOpened == false
        ) {
            setTimeout(() => {
                this.setState({ runningAnimation: false });
            }, 250);
        }
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

    sendMessage(content) {
        const { currentUser, chatOptions } = this.props;
        if (content.trim().length > 0) {
            const payload = {
                content: content,
                time: Date.now(),
                type: "text",
                name: currentUser.name,
                avatarUrl: currentUser.avatarUrl || userPlaceholder,
                ownerId: currentUser.participant_id
            };
            this.props.dispatch(ChatActions.addMessage({
                ...payload,
                content: !chatOptions.autoLinker?content:Autolinker.link(content.trim())
            }));
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
        const { participants, currentUser, attendeesChatOpened, chatOptions } = this.props;
        const { runningAnimation, content } = this.state;
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
                    <h1>Chat</h1>
                </div>
                <ul id="chat-scrollbar">
                    <MessageList
                        messages={messages}
                        attendeesChatOpened={attendeesChatOpened}
                        currentUser={currentUser}
                        chatOptions={chatOptions}
                    />
                </ul>
                <div className="container-input-chat">
                    <div className="container-attach">
                        <a
                        // onClick={e => {
                        //   this.setState({ content: "" });
                        //   sendMessage(this.state.content);
                        //   e.preventDefault();
                        // }}
                        >
                            <img src={attachIcon} />
                            {/* {strings.sendMessage} */}
                        </a>
                    </div>
                    <div className="container-input">
                        <input
                            placeholder={strings.placeholderChat}
                            onChange={this.onContentChange}
                            value={content}
                            id="contentInputChat"
                            className="input-message"
                        ></input>
                    </div>
                    <div className="container-send">
                        <a
                            onClick={e => {
                                this.setState({ content: "" });
                                this.sendMessage(this.state.content);
                                e.preventDefault();
                            }}
                        >
                            <img src={sendIcon} />
                            {/* {strings.sendMessage} */}
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        chatStore: state.voxeet.chat
    };
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

const AttendeesChatContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(AttendeesChat);

export default AttendeesChatContainer;