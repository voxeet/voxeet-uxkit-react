import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import settings from "../../../../static/images/newicons/settings.svg";
import SettingsOn from "../../../../static/images/newicons/icon-settings-on.svg";
import SettingsOff from "../../../../static/images/newicons/icon-settings-off.svg";

class ToggleSettingsButton extends Component {
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
