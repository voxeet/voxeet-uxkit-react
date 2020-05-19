import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import LayoutSpeaker from "../../../../static/images/icons/icon-layout-speaker.svg";
import LayoutTiles from "../../../../static/images/icons/icon-layout-tile.svg";
import Layout3D from "../../../../static/images/icons/icon-layout-3D.svg";
import LayoutArrow from "../../../../static/images/icons/carat-down.svg";

class ToggleModeButton extends Component {
  constructor(props) {
    super(props);
  }

  getModeIcon(mode) {
    switch (mode) {
      case "tiles":
        return LayoutTiles;
      case "list":
        return Layout3D;
      case "speaker":
        return LayoutSpeaker;
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
      <div onClick={() => toggleMode()} className="layout-container">
        <p>{strings.changelayout}</p>
        <a
          data-tip
          data-for="toggle-mode"
          className={"icn-switch-list "}
          title={strings.displaymode}
        >
          <img src={this.getModeIcon(mode)} />
        </a>
        <div className='layout-arrow'>
          <img src={LayoutArrow} />
        </div>
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
