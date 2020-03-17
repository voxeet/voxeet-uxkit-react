import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import Sdk from "../../sdk";
import { connect } from "@voxeet/react-redux-5.1.1";
import LiveIndicator from "../../../static/images/newicons/LiveIndicator.png";
import { strings } from "../../languages/localizedStrings";

@connect(store => {
  return {
    controlsStore: store.voxeet.controls
  };
})
class AttendeesLive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      runningAnimation: false,
      thirdPartyUrl: null,
      thirdPartyPassword: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this.props.attendeesLiveOpened == true &&
      nextProps.attendeesLiveOpened == false
    ) {
      this.setState({ runningAnimation: true });
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
  }

  handleChange(e) {
    this.setState({ thirdPartyUrl: e.target.value });
  }

  handleChangePassword(e) {
    this.setState({ thirdPartyPassword: e.target.value });
  }

  toggleLive() {
    const { thirdPartyUrl, thirdPartyPassword } = this.state;
    this.props.toggleLive(thirdPartyUrl, thirdPartyPassword);
  }

  toggleLiveHls() {
    this.props.toggleLiveHls();
  }

  render() {
    const { attendeesLiveOpened, conferenceId } = this.props;
    const { isExternalLive, isHlsLive } = this.props.controlsStore;
    return (
      <div
        className={
          this.state.runningAnimation
            ? "attendees-live attendees-live-out"
            : attendeesLiveOpened
            ? "attendees-live"
            : "attendees-live-hidden"
        }
      >
        <div className="attendees-live-header">
          <h1>{strings.externalUrl}</h1>
        </div>
        <div>
          <h2>Facebook / Youtube Live</h2>
          {!isExternalLive ? (
            <div className="modal-thirdparty">
              <ul className="ul-external-live">
                <li>1. {strings.geturl}</li>
                <li>2. {strings.getpwd}</li>
                <li>3. {strings.enterhere}</li>
                <li>
                  <div>
                    <input
                      onChange={this.handleChange}
                      placeholder={strings.externalUrl}
                      name="thirdPartyUrl"
                    />
                  </div>
                  <div>
                    <input
                      onChange={this.handleChangePassword}
                      type="password"
                      placeholder={strings.externalPassword}
                      name="thirdPartyPassword"
                    />
                  </div>
                </li>
              </ul>
              <button onClick={this.toggleLive.bind(this)} type="submit">
                {strings.launchLive}
              </button>
            </div>
          ) : (
            <div className="live-running">
              <div>
                <div className="live-indicator">
                  <img src={LiveIndicator} />
                  {strings.broadcastLive} <span className="one">.</span>
                  <span className="two">.</span>
                  <span className="three">.</span>
                </div>
              </div>
              <button onClick={this.toggleLive.bind(this)} type="submit">
                {strings.stopLive}
              </button>
            </div>
          )}
        </div>
        <hr />
        <div>
          <h2>HLS Live</h2>
          {isHlsLive ? (
            <div className="live-running">
              <div>
                <div className="live-indicator">
                  <img src={LiveIndicator} />
                  {strings.broadcastLive} <span className="one">.</span>
                  <span className="two">.</span>
                  <span className="three">.</span>
                  <div className="hls-link">
                    {strings.linkHls}{" "}
                    <a
                      target="_blank"
                      href={
                        "https://hls-player.voxeet.com?confId=" +
                        conferenceId +
                        ""
                      }
                    >
                      {strings.here}
                    </a>
                  </div>
                </div>
              </div>
              <button onClick={this.toggleLiveHls.bind(this)} type="submit">
                {strings.stopLive}
              </button>
            </div>
          ) : (
            <div className="modal-thirdparty">
              <button onClick={this.toggleLiveHls.bind(this)} type="submit">
                {strings.launchLive}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

AttendeesLive.propTypes = {
  attendeesLiveOpened: PropTypes.bool.isRequired,
  toggleLive: PropTypes.func,
  toggleLiveHls: PropTypes.func,
  conferenceId: PropTypes.string
};

export default AttendeesLive;
