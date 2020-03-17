import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import MuteOn from "../../../../static/images/newicons/icon-mute-on.svg";
import MuteOff from "../../../../static/images/newicons/icon-mute-off.svg";

class ToggleMicrophoneButton extends Component {
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
    const { isMuted, toggle, tooltipPlace, isBottomBar } = this.props;
    const { hover, isMobile } = this.state;
    return (
      <li
        className={isMuted ? "active" : ""}
        onMouseEnter={() => {
          !isMobile && this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          !isMobile && this.setState({ hover: false });
        }}
      >
        <a
          data-tip
          data-for="toggle-mute"
          className={" " + (isMuted ? "on" : "off")}
          title={strings.mute}
          onClick={() => toggle()}
        >
          <img src={isMuted || hover ? MuteOn : MuteOff} />
          {isBottomBar && (
            <div>
              <span>{strings.mute}</span>
            </div>
          )}
        </a>
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-mute"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.mute}
          </ReactTooltip>
        )}
      </li>
    );
  }
}

ToggleMicrophoneButton.propTypes = {
  toggle: PropTypes.func.isRequired,
  isMuted: PropTypes.bool.isRequired,
  tooltipPlace: PropTypes.string.isRequired,
  isBottomBar: PropTypes.bool.isRequired
};

ToggleMicrophoneButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleMicrophoneButton;
