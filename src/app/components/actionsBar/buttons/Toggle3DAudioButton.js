import React, { Component } from "react";
import PropTypes from "prop-types";
import { strings } from "../../../languages/localizedStrings";
import Audio3DOn from "../../../../static/images/icons/icon-layout-3D.svg";

class Toggle3DAudioButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      audio3DEnabled,
      toggleAudio3D,
      tooltipPlace,
      isBottomBar
    } = this.props;
    return (
      <li className={audio3DEnabled ? "active" : ""}>
        <a
          data-tip
          data-for="toggle-audio"
          className={"audio3d " + (audio3DEnabled ? "on" : "off")}
          title={strings.audio}
          onClick={() => toggleAudio3D()}
        >
          <img src={Audio3DOn} />
          {isBottomBar && (
            <div>
              <span>{strings.audio}</span>
            </div>
          )}
        </a>
      </li>
    );
  }
}

Toggle3DAudioButton.propTypes = {
  toggleAudio3D: PropTypes.func.isRequired,
  audio3DEnabled: PropTypes.bool.isRequired,
  tooltipPlace: PropTypes.string.isRequired,
  isBottomBar: PropTypes.bool.isRequired
};

Toggle3DAudioButton.defaultProps = {
  tooltipPlace: "right"
};

export default Toggle3DAudioButton;
