import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";

class ToggleFullScreenButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { toggleFullScreen, isWidgetFullScreenOn, tooltipPlace } = this.props;
    return (
      <li>
        <a
          data-tip
          data-for="toggle-fullscreen"
          onClick={() => toggleFullScreen()}
          className="icn-toggle-sidebar"
          title={isWidgetFullScreenOn ? strings.minimize : strings.fullscreen}
        >
          <span
            className={
              isWidgetFullScreenOn
                ? "icon-fullscreen-off"
                : "icon-fullscreen-on"
            }
          ></span>
        </a>
        <ReactTooltip
          id="toggle-fullscreen"
          place={tooltipPlace}
          effect="solid"
          className="tooltip"
        >
          {isWidgetFullScreenOn ? strings.minimize : strings.fullscreen}
        </ReactTooltip>
      </li>
    );
  }
}

ToggleFullScreenButton.propTypes = {
  toggleFullScreen: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  tooltipPlace: PropTypes.string.isRequired
};

ToggleFullScreenButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleFullScreenButton;
