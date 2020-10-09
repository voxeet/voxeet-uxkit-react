import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import { connect } from "@voxeet/react-redux-5.1.1";
import ChatOn from "../../../../static/images/icons/btn-chat-on.svg";
import ChatOff from "../../../../static/images/icons/btn-chat-off.svg";
import { isMobile } from "../../../libs/browserDetection";

@connect(store => {
  return {
    chatStore: store.voxeet.chat
  };
})
class ToggleAttendeesChatButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: isMobile(),
      hover: false
    };
  }

  render() {
    const { isOpen, toggle, tooltipPlace, isBottomBar } = this.props;
    const { hover, isMobile } = this.state;
    const { newMessage } = this.props.chatStore;
    return (
      <li
        className={isOpen ? "active" : ""}
        onMouseEnter={() => {
          !isMobile && this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          !isMobile && this.setState({ hover: false });
        }}
      >
        <a
          data-tip
          data-for="toggle-chat"
          className={" " + (isOpen ? "on" : "off")}
          title={strings.chat}
          onClick={() => toggle()}
        >
          <img src={isOpen || hover ? ChatOn : ChatOff} />
          {isBottomBar && (
            <div>
              <span>{strings.chat}</span>
            </div>
          )}
          {newMessage && <span className="chat-badge"></span>}
        </a>
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-chat"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.chat}
          </ReactTooltip>
        )}
      </li>
    );
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

export default ToggleAttendeesChatButton;
