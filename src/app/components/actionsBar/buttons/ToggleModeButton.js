import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";

class ToggleModeButton extends Component {
  constructor(props) {
    super(props);
  }

  getModeIcon(mode) {
    switch (mode) {
      case "tiles":
        return "icon-tile";
      case "list":
        return "icon-bubble";
      case "speaker":
        return "icon-speaker";
    }
  }

  getModeTranslation(mode) {
    switch (mode) {
      case "tiles":
        return strings.tile;
      case "list":
        return strings.list;
      case "speaker":
        return strings.speaker;
    }
  }

  render() {
    const { mode, toggleMode, tooltipPlace } = this.props;
    return (
      <div className="layout-container">
        <a
          data-tip
          data-for="toggle-mode"
          onClick={() => toggleMode()}
          className={"icn-switch-list " + this.getModeIcon(mode)}
          title={strings.displaymode}
        ></a>
        <ReactTooltip
          id="toggle-mode"
          place={tooltipPlace}
          effect="solid"
          className="tooltip"
        >
          {this.getModeTranslation(mode)}
        </ReactTooltip>
      </div>
    );
  }
}

ToggleModeButton.propTypes = {
  mode: PropTypes.string.isRequired,
  toggleMode: PropTypes.func.isRequired,
  tooltipPlace: PropTypes.string.isRequired
};

ToggleModeButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleModeButton;
