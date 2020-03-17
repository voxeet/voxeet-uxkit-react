import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import liveOff from "../../../../static/images/newicons/icon-broadcast-off.svg";
import liveOn from "../../../../static/images/newicons/icon-broadcast-on.svg";

class ToggleExternalLiveButton extends Component {
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
      attendeesLiveOpened,
      toggle,
      tooltipPlace,
      isExternalLive,
      isHlsLive,
      isBottomBar
    } = this.props;
    const { hover, isMobile } = this.state;
    return (
      <li
        id="external-live"
        className={
          isExternalLive || attendeesLiveOpened || isHlsLive ? "active" : ""
        }
        onMouseEnter={() => {
          !isMobile && this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          !isMobile && this.setState({ hover: false });
        }}
      >
        <a
          data-tip
          data-for="toggle-externalLive"
          className={
            " " +
            (isExternalLive || attendeesLiveOpened || isHlsLive ? "on" : "off")
          }
          title={strings.externalLive}
          onClick={() => toggle()}
        >
          <img
            src={
              isExternalLive || attendeesLiveOpened || hover || isHlsLive
                ? liveOn
                : liveOff
            }
          />
          {isBottomBar && (
            <div>
              <span>{strings.externalLive}</span>
            </div>
          )}
        </a>
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-externalLive"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.externalLive}
          </ReactTooltip>
        )}
      </li>
    );
  }
}

ToggleExternalLiveButton.propTypes = {
  attendeesLiveOpened: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  isExternalLive: PropTypes.bool.isRequired,
  isHlsLive: PropTypes.bool.isRequired,
  isBottomBar: PropTypes.bool.isRequired,
  tooltipPlace: PropTypes.string.isRequired
};

ToggleExternalLiveButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleExternalLiveButton;
