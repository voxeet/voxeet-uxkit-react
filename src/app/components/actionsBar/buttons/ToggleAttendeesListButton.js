import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import ListOn from "../../../../static/images/icons/btn-participant-on.svg";
import ListOff from "../../../../static/images/icons/btn-participant-off.svg";

class ToggleAttendeesListButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
      hover: false
    };
  }

  render() {
    const { isOpen, toggle, tooltipPlace, isBottomBar, nbParticipants } = this.props;
    const { hover, isMobile } = this.state;

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
          data-for="toggle-attendees"
          className={" " + (isOpen ? "on" : "off")}
          title={strings.attendees}
          onClick={() => toggle()}
        >
          <span className={"attendees-number" + (isOpen || hover ? " active" : '')}>{nbParticipants}</span>
          <img src={isOpen || hover ? ListOn : ListOff} />
          {isBottomBar && (
            <div>
              <span>{strings.attendees}</span>
            </div>
          )}
        </a>
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-attendees"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.attendees}
          </ReactTooltip>
        )}
      </li>
    );
  }
}

ToggleAttendeesListButton.propTypes = {
  toggle: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  tooltipPlace: PropTypes.string.isRequired,
  isBottomBar: PropTypes.bool.isRequired
};

ToggleAttendeesListButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleAttendeesListButton;
