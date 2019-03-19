import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Actions as ChatActions } from '../../actions/ChatActions'
import { Actions as ConferenceActions } from '../../actions/ConferenceActions'
import LocalizedStrings from 'react-localization'
import DOMPurify from "dompurify";
import Autolinker from "autolinker";
import { CHAT_MESSAGE } from './../../constants/BroadcastMessageType'
import userPlaceholder from '../../../static/images/user-placeholder.png'

const LABELS = new LocalizedStrings({
    en: {
        attendees: "Chat",
        placeholderChat: "Type message ...",
        sendMessage: "Send Message"
    },
    fr: {
        attendees: "Conversation",
        placeholderChat: "Entrez votre message ...",
        sendMessage: "Envoyer le message"
    }
});

@connect((store) => {
    return {
        chatStore: store.voxeet.chat
    }
})

class AttendeesChat extends Component {
    constructor(props) {
        super(props)
        this.state = {
            content: ""
        }
        this.onContentChange = this.onContentChange.bind(this)
        this.escFunction = this.escFunction.bind(this)
    }

    componentDidUpdate() {
        var scrollBar = document.getElementById("chat-scrollbar");
        scrollBar.scrollTop = scrollBar.scrollHeight;
    }

    componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false);
        var scrollBar = document.getElementById("chat-scrollbar");
        scrollBar.scrollTop = scrollBar.scrollHeight;
        this.props.dispatch(ChatActions.resetBadgeMessage())
      }
    
      componentWillUnmount(){
        document.removeEventListener("keydown", this.escFunction, false);
      }

    escFunction(event){
        if (event.keyCode === 13) {
            this.sendMessage()
        }
    }

    sendMessage() {
        const { content } = this.state
        const { currentUser } = this.props
        if (content.length > 0) {
            const payload = {
                "content": content,
                "time": Date.now(),
                "type": "text",
                "name": currentUser.name,
                "avatarUrl": currentUser.avatarUrl || userPlaceholder,
                "ownerId": currentUser.participant_id
            }
            this.props.dispatch(ChatActions.addMessage(payload))
            this.props.dispatch(ConferenceActions.sendBroadcastMessage(CHAT_MESSAGE, null, payload))
            this.setState({ content: "" });
        }
    }

    onContentChange(e) {
        let content = e.target.value;
        this.setState({ content: content });
    }

    urlify(text) {
        const message = DOMPurify.sanitize(text)
        .trim()
        .replace(/(?:\r\n|\r|\n)/g, "<br />");
        const autolinker = new Autolinker();
        const matches = autolinker.parse(message);
        const matchedUrls = matches.map(match => match.url);
        const firstUrl = matches.find(match => match.url) || {};
        const autoLinkedMessage = {
          __html: Autolinker.link(message, { twitter: false, truncate: 40 })
        };
        return autoLinkedMessage
    }
    

    render() {
        const { participants, currentUser } = this.props
        const { content } = this.state
        const { messages } = this.props.chatStore
        return (
            <div className="attendees-chat">
                <div className="attendees-chat-header">
                    <h1>{LABELS.attendees}</h1>
                </div>
                <ul id="chat-scrollbar">
                { 
                messages.map((message, i) => {
                    let messageContent = this.urlify(message.content)
                    if (message.ownerId != currentUser.participant_id) {
                        return (
                            <li key={i}>
                                <div className="chat-container">
                                    <div>
                                        <img src={message.avatarUrl} />
                                    </div>
                                    <div>
                                        <span className="chat-name">
                                            {message.name}
                                        </span>
                                        <div dangerouslySetInnerHTML={messageContent} className="chat-content">
                                        </div>
                                    </div>
                                </div>
                            </li>)
                    } else {
                        return (
                            <li key={i}>
                                <div className="chat-container-myself">
                                    <div>
                                        <span className="chat-name-myself">
                                            {message.name}
                                        </span>
                                        <div dangerouslySetInnerHTML={messageContent} className="chat-content-myself">
                                        </div>
                                    </div>
                                    <div>
                                        <img src={message.avatarUrl} />
                                    </div>
                                </div>
                            </li>)
                    }
                })
                }
                </ul>
                <div className="container-input-chat"> 
                    <input autoFocus placeholder={LABELS.placeholderChat} onChange={this.onContentChange} value={content} className="input-message"></input>
                    <a onClick={() => this.sendMessage()}>{LABELS.sendMessage}</a>
                </div>
            </div>
        )
    }
}

AttendeesChat.propTypes = {
    participants: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired
}

export default AttendeesChat
