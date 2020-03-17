import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { connect } from "@voxeet/react-redux-5.1.1";

import Sdk from "../../../sdk";
import AttendeesParticipantVideo from "../../attendees/AttendeesParticipantVideo";
import ModalJoinSettings from "../../modalJoin/ModalJoinSettings";
import ModalJoinParticipants from "../../modalJoin/ModalJoinParticipants";

@connect(state => {
  return {
    participantStore: state.voxeet.participants
  };
})
class LiveSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSettings: false
    };
  }

  componentDidMount() {}

  openSettings() {
    this.setState({ showSettings: true });
  }

  close() {
    this.setState({ showSettings: false });
  }

  joinConference() {
    const { join } = this.props;
    join();
    this.setState({ showSettings: false });
  }

  render() {
    const { participants } = this.props.participantStore;
    const participantsConnected = participants.filter(p => p.isConnected);
    let className = "icn-status ";
    if (this.props.isLive) {
      className += " live";
    } else {
      className += " offline";
    }

    return (
      <div>
        <div className="vxt-conference-status">
          <a
            onClick={() => this.openSettings()}
            className={className}
            title="Join"
          >
            {!this.props.isLive && <span className="icon-phone"></span>}
          </a>
        </div>

        {this.state.showSettings && (
          <div className="modal-join">
            <div className="content">
              <span className="close">
                <a
                  data-tip
                  data-for="toggle-close"
                  className="icon-close"
                  onClick={() => this.close()}
                  title="Close"
                ></a>
              </span>
              <ReactTooltip
                id="toggle-close"
                place="left"
                effect="solid"
                className="tooltip"
              >
                Close
              </ReactTooltip>
              {<ModalJoinSettings />}

              {participantsConnected.length === 0 ? (
                <div className="empty">
                  <div className="logo" />
                  <p>{strings.hangtight}</p>
                </div>
              ) : (
                <div className="participantsList">
                  <span>In call with :</span>
                  <ModalJoinParticipants participants={participantsConnected} />
                </div>
              )}

              <div className="vxt-modal-join-phone">
                <div className="vxt-conference-status">
                  <a
                    onClick={() => this.joinConference()}
                    className={className}
                    title="Join"
                  >
                    {!this.props.isLive && <span className="icon-phone"></span>}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

LiveSettings.propTypes = {
  join: PropTypes.func.isRequired,
  initialize: PropTypes.bool.isRequired,
  isLive: PropTypes.bool.isRequired
};

export default LiveSettings;
