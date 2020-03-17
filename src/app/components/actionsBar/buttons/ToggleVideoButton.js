import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import CameraOn from "../../../../static/images/newicons/icon-camera-on.svg";
import CameraOff from "../../../../static/images/newicons/icon-camera-off.svg";

class ToggleVideoButton extends Component {
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
