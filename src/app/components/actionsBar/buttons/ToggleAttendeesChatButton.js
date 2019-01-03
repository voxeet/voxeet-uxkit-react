import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import { connect } from 'react-redux'
import ChatOn from '../../../../static/images/newicons/icon-chat-on.svg'
import ChatOff from '../../../../static/images/newicons/icon-chat-off.svg'

const LABELS = new LocalizedStrings({
 en:{
   chat: "Chat"
 },
 fr: {
    chat: "Conversation"
 }
});

@connect((store) => {
    return {
        chatStore: store.voxeet.chat
    }
})

class ToggleAttendeesChatButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          hover: false
        }
    }

    render() {
        const { isOpen, toggle, tooltipPlace, isBottomBar } = this.props
        const { hover } = this.state
        const { newMessage } = this.props.chatStore
        return (
            <li className={isOpen ? 'active' : ''}
                onMouseEnter={() => this.setState({hover: true})}
                onMouseLeave={() => this.setState({hover: false})}>

                <a data-tip data-for="toggle-mute"
                    className={' ' + (isOpen ? 'on' : 'off')}
                    title={LABELS.chat}
                    onClick={() => toggle()}>
                    <img src={(isOpen || hover) ? ChatOn : ChatOff} />
                    { isBottomBar &&
                      <div><span>{LABELS.chat}</span></div>
                    }
                    { newMessage &&
                        <span className="chat-badge"></span>
                    }
                </a>
                { !isBottomBar &&
                  <ReactTooltip id="toggle-mute" place={tooltipPlace} effect="solid" className="tooltip">{LABELS.attendees}</ReactTooltip>
                }
            </li>
        )
    }
}

ToggleAttendeesChatButton.propTypes = {
    toggle: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
    isBottomBar: PropTypes.bool.isRequired
};

ToggleAttendeesChatButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleAttendeesChatButton
