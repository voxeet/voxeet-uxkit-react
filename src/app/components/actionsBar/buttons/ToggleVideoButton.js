import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";
import CameraOn from "../../../../static/images/icons/btn-camera-on.svg";
import CameraOff from "../../../../static/images/icons/btn-camera-off.svg";
import { isMobile } from "../../../libs/browserDetection";
const TIMEOUT = 1500; // Should be a bit longer than API response

class ToggleVideoButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: isMobile(),
      hover: false,
      local:null  // local video state, if set contains video state on last click
    };
    this.handleClick = this.handleClick.bind(this);
    this.clickTimer = null; // Allow some time for api call to return next state
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.videoEnabled !== prevProps.videoEnabled) {
      // Video state changed => reset local state
      console.log('video state changed to', this.props.videoEnabled);
      if(this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
      }
      this.setState({local:null});
    }
  }

  handleClick(e) {
    const { toggle, videoEnabled } = this.props;
    const { local } = this.state;
    console.log('video clicked', local, videoEnabled)
    e.preventDefault();
    // Prevent sending toggle if no response on previous click received ot timeout expires
    if(local!==videoEnabled) {
      // About to perform toggle
      if(this.clickTimer)
        clearTimeout(this.clickTimer);
      this.clickTimer=setTimeout(() => {
        this.setState({local:null}, () => {
          this.clickTimer = null;
        });
      }, 1000)
      this.setState({local:videoEnabled}, toggle); // Set current video state
    }
  }

  render() {
    const { videoEnabled, tooltipPlace, isBottomBar } = this.props;
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
          onClick={this.handleClick}
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
