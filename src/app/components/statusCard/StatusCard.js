import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";

import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import { Actions as ControlsActions } from "../../actions/ControlsActions";
import { Actions as ErrorActions } from "../../actions/ErrorActions";

import AttendeesHeaderTimer from "../attendees/AttendeesHeaderTimer";
import AttendeesWaiting from "../attendees/AttendeesWaiting";
import StatusCardParticipants from "./StatusCardParticipants";
import Modal from "../attendees/modal/Modal";
import { strings } from "../../languages/localizedStrings";

@connect(state => {
  return {
    controlsStore: state.voxeet.controls,
    conferenceStore: state.voxeet.conference,
    participantStore: state.voxeet.participants,
    errorStore: state.voxeet.error
  };
})
class StatusCard extends Component {
  constructor(props) {
    super(props);
    this.joinConference = this.joinConference.bind(this);
    this.leaveConference = this.leaveConference.bind(this);
    this.toggleErrorModal = this.toggleErrorModal.bind(this);
    this.toggleModalWidget = this.toggleModalWidget.bind(this);
  }

  joinConference() {
    const {
      conferenceAlias,
      constraints,
      isJoined,
      liveRecordingEnabled,
      conferenceId,
      ttl,
      rtcpmode,
      mode,
      videoCodec,
      userInfo
    } = this.props;
    if (!isJoined) {
      this.props
        .dispatch(ConferenceActions.subscribeConference(conferenceAlias))
        .then(() => {
          if (conferenceId != null) {
            const constraintsUpdated = {
              video: constraints.video ? true : false,
              audio: constraints.audio ? true : false,
              params: {
                liveRecording: liveRecordingEnabled
              }
            };
            this.props.dispatch(
              ConferenceActions.joinWithConferenceId(
                conferenceId,
                constraintsUpdated
              )
            );
          } else {
            this.props.dispatch(
              ConferenceActions.join(
                conferenceAlias,
                constraints,
                liveRecordingEnabled,
                ttl,
                rtcpmode,
                mode,
                videoCodec,
                userInfo
              )
            );
          }
        });
    }
  }

  toggleErrorModal() {
    this.props.dispatch(ControlsActions.toggleModal());
    this.props.dispatch(ErrorActions.onClearError());
  }

  leaveConference() {
    const { isWidgetOpened, videoEnabled } = this.props.controlsStore;
    const { handleOnLeave } = this.props;
    if (isWidgetOpened) this.props.dispatch(ControlsActions.toggleWidget());
    if (videoEnabled) this.props.dispatch(ControlsActions.toggleVideo());
    this.props.dispatch(ConferenceActions.leave());
    if (handleOnLeave) handleOnLeave();
  }

  toggleModalWidget() {
    this.props.dispatch(ControlsActions.toggleModalWidget());
  }

  render() {
    const { isModal } = this.props;
    const { modalOpened, displayModal } = this.props.controlsStore;
    const {
      isLive,
      initialized,
      isConnecting,
      isJoined
    } = this.props.conferenceStore;
    const { participants } = this.props.participantStore;
    const { errorMessage, isError } = this.props.errorStore;
    const participantsConnected = participants.filter(p => p.isConnected);
    return (
      <div className="vxt-conference-card-status">
        <div className="status">
          {isLive ? (
            <div>
              <span className="icn-status live"></span>
              {strings.activecall}
              {isJoined && <AttendeesHeaderTimer initialize={true} />}
            </div>
          ) : (
            <div>
              <span className="icn-status icon-phone"></span>
              {strings.joincall}
            </div>
          )}
        </div>
        <div className="participants">
          {participantsConnected.length === 0 ? (
            <AttendeesWaiting />
          ) : (
            <div className="participantsList">
              <span>{strings.incall}</span>
              <StatusCardParticipants participants={participantsConnected} />
            </div>
          )}
        </div>
        {!isJoined && (
          <div className="expand" onClick={this.joinConference}>
            <i className="icon-phone">
              {" "}
              <span>{strings.join}</span>
            </i>
          </div>
        )}
        {isJoined && isModal && (
          <div className="expand" onClick={this.toggleModalWidget}>
            {modalOpened ? (
              <i className="icon-fullscreen-off">
                {" "}
                <span>{strings.close}</span>
              </i>
            ) : (
              <i className="icon-fullscreen-on">
                {" "}
                <span>{strings.expand}</span>
              </i>
            )}
          </div>
        )}
        {isJoined && (
          <div className="leave" onClick={this.leaveConference}>
            <i className="icon-phone-end-call">
              {" "}
              <span>{strings.leavecall}</span>
            </i>
          </div>
        )}

        {displayModal && isError && (
          <Modal
            error={JSON.stringify(errorMessage)}
            isModalError={true}
            toggle={this.toggleErrorModal}
          />
        )}
      </div>
    );
  }
}

StatusCard.propTypes = {
  liveRecordingEnabled: PropTypes.bool,
  conferenceAlias: PropTypes.string,
  ttl: PropTypes.number,
  rtcpmode: PropTypes.string,
  mode: PropTypes.string,
  videoCodec: PropTypes.string,
  userInfo: PropTypes.object,
  conferenceId: PropTypes.string,
  constraints: PropTypes.object,
  isModal: PropTypes.bool,
  handleOnLeave: PropTypes.func
};

StatusCard.defaultProps = {
  isModal: false,
  conferenceId: null,
  ttl: 0,
  userInfo: {
    name: "Guest " + Math.floor(Math.random() * 100 + 1),
    externalId: "",
    avatarUrl: ""
  },
  rtcpmode: "worst",
  mode: "standard",
  videoCodec: "VP8",
  liveRecordingEnabled: false,
  constraints: {
    audio: true,
    video: false
  }
};

export default StatusCard;
