import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import SettingsOn from "../../../../static/images/icons/btn-settings-on.svg";
import SettingsOff from "../../../../static/images/icons/btn-settings-off.svg";
import { isMobile } from "../../../libs/browserDetection";

class ToggleSettingsButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: isMobile(),
      hover: false
    };
  }

  render() {
    const {
      attendeesSettingsOpened,
      toggle,
      tooltipPlace,
      isBottomBar
    } = this.props;
    const { hover, isMobile } = this.state;
    return (
      <li
        id="settings-container"
        className={attendeesSettingsOpened ? "active" : ""}
        onMouseEnter={() => {
          !isMobile && this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          !isMobile && this.setState({ hover: false });
        }}
      >
        <a
          data-tip
          data-for="toggle-settings"
          className={" " + (attendeesSettingsOpened ? "on" : "off")}
          onClick={() => toggle()}
          title={strings.settings}
        >
          <img
            src={attendeesSettingsOpened || hover ? SettingsOn : SettingsOff}
          />
          {isBottomBar && (
            <div>
              <span>{strings.settings}</span>
            </div>
          )}
        </a>
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-settings"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.settings}
          </ReactTooltip>
        )}
      </li>
    );
  }
}

ToggleSettingsButton.propTypes = {
  attendeesSettingsOpened: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  tooltipPlace: PropTypes.string.isRequired,
  isBottomBar: PropTypes.bool.isRequired
};

ToggleSettingsButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleSettingsButton;
