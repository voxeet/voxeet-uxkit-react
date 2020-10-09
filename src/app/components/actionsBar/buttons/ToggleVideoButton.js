import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import CameraOn from "../../../../static/images/icons/btn-camera-on.svg";
import CameraOff from "../../../../static/images/icons/btn-camera-off.svg";
import { isMobile } from "../../../libs/browserDetection";

class ToggleVideoButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: isMobile(),
      hover: false
    };
  }

  render() {
    const { videoEnabled, toggle, tooltipPlace, isBottomBar } = this.props;
    const { hover, isMobile } = this.state;

    return (
      <li
        className={videoEnabled ? "active" : ""}
        onMouseEnter={() => {
          !isMobile && this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          !isMobile && this.setState({ hover: false });
        }}
      >
        <a
          data-tip
          data-for="toggle-video"
          title={strings.video}
          onClick={() => toggle()}
        >
          <img src={videoEnabled || hover ? CameraOn : CameraOff} />
          {isBottomBar && (
            <div>
              <span>{strings.video}</span>
            </div>
          )}
        </a>
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-video"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.video}
          </ReactTooltip>
        )}
      </li>
    );
  }
}

ToggleVideoButton.propTypes = {
  videoEnabled: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  tooltipPlace: PropTypes.string.isRequired,
  isBottomBar: PropTypes.bool.isRequired
};

ToggleVideoButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleVideoButton;
