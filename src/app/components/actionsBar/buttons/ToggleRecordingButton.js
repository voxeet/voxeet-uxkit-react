import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import RecordingOn from "../../../../static/images/newicons/icon-record-on.svg";
import RecordingOff from "../../../../static/images/newicons/icon-record-off.svg";

class ToggleRecordingButton extends Component {
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
      isRecording,
      toggle,
      tooltipPlace,
      isBottomBar,
      recordingLocked
    } = this.props;
    const { hover, isMobile } = this.state;
    return (
      <li
        className={isRecording || recordingLocked ? "active" : ""}
        onMouseEnter={() => {
          !isMobile && this.setState({ hover: true });
        }}
        onMouseLeave={() => {
          !isMobile && this.setState({ hover: false });
        }}
      >
        <a
          data-tip
          data-for="toggle-recording"
          className={"" + (isRecording || recordingLocked ? "on" : "off")}
          title={strings.record}
          onClick={() => toggle()}
        >
          <img
            src={
              isRecording || hover || recordingLocked
                ? RecordingOn
                : RecordingOff
            }
          />
          {isBottomBar && (
            <div>
              <span>{strings.record}</span>
            </div>
          )}
        </a>
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-recording"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.record}
          </ReactTooltip>
        )}
      </li>
    );
  }
}

ToggleRecordingButton.propTypes = {
  isRecording: PropTypes.bool.isRequired,
  recordingLocked: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  tooltipPlace: PropTypes.string.isRequired,
  isBottomBar: PropTypes.bool.isRequired
};

ToggleRecordingButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleRecordingButton;
