import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import Sdk from "../../sdk";

import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import { Actions as ControlsActions } from "../../actions/ControlsActions";
import { Actions as ErrorActions } from "../../actions/ErrorActions";
import { Actions as ParticipantActions } from "../../actions/ParticipantActions";
import ActionsButtons from "../actionsBar/ActionsButtons";

import Modal from "../attendees/modal/Modal";

import "../../../styles/main.less";
import ConferenceRoomContainer from "../ConferenceRoomContainer";
import AttendeesWaiting from "../attendees/AttendeesWaiting";
import AttendeesList from "../attendees/AttendeesList";
import AttendeesChat from "../attendees/AttendeesChat";

import { Connecting, Live, Replay, LiveSettings, Offline } from "./status";

@connect(state => {
  return {
    conferenceStore: state.voxeet.conference,
    errorStore: state.voxeet.error,
    controlsStore: state.voxeet.controls
  };
})
class StatusButton extends Component {
  constructor(props) {
    super(props);
    this.joinConference = this.joinConference.bind(this);
    this.toggleErrorModal = this.toggleErrorModal.bind(this);
  }

  joinConference() {
    const {
      isListener,
      ttl,
      rtcpmode,
      mode,
      isElectron,
      videoRatio,
      videoCodec,
      sdk,
      liveRecordingEnabled,
      conferenceAlias,
      isDemo,
      constraints,
      consumerKey,
      consumerSecret,
      userInfo,
      isManualKickAllowed,
      kickOnHangUp,
      isAdmin,
      oauthToken,
      refreshTokenCallback
    } = this.props;
    if (sdk) {
      // Sdk must be already initialized
      Sdk.setSdk(sdk);
    } else {
      Sdk.create();
    }
    let initialized = null;
    if (oauthToken != null) {
      initialized = this.props.dispatch(
        ConferenceActions.initializeWithToken(
          oauthToken,
          refreshTokenCallback,
          userInfo
        )
      );
    } else {
      initialized = this.props.dispatch(
        ConferenceActions.initialize(consumerKey, consumerSecret, userInfo)
      );
    }
    initialized.then(() =>
      this.props.dispatch(
        ConferenceActions.join(
          conferenceAlias,
          isAdmin,
          constraints,
          liveRecordingEnabled,
          ttl,
          rtcpmode,
          mode,
          videoCodec,
          userInfo,
          videoRatio,
          isElectron,
          isListener
        )
      )
    );
  }

  toggleErrorModal() {
    this.props.dispatch(ControlsActions.toggleModal());
    this.props.dispatch(ErrorActions.onClearError());
  }

  render() {
    const {
      isLive,
      initialized,
      isConnecting,
      isJoined
    } = this.props.conferenceStore;
    const { errorMessage, isError } = this.props.errorStore;

    if (isConnecting) {
      return <Connecting />;
    } else if (initialized && this.props.openSettingsOnJoin) {
      return (
        <LiveSettings
          isLive={isLive}
          initialize={initialized}
          join={() => this.joinConference()}
        />
      );
    } else if (isLive) {
      return <Live join={() => this.joinConference()} />;
    } else if (initialized) {
      const { displayModal } = this.props.controlsStore;
      if (displayModal && isError) {
        return (
          <div>
            <Offline join={() => this.joinConference()} />
            <Modal
              error={JSON.stringify(errorMessage)}
              isModalError={true}
              toggle={this.toggleErrorModal}
            />
          </div>
        );
      }
      return <Offline join={() => this.joinConference()} />;
    }
    return null;
  }
}

StatusButton.propTypes = {
  sdk: PropTypes.object,
  isListener: PropTypes.bool,
  isManualKickAllowed: PropTypes.bool,
  kickOnHangUp: PropTypes.bool,
  isElectron: PropTypes.bool,
  consumerKey: PropTypes.string,
  consumerSecret: PropTypes.string,
  oauthToken: PropTypes.string,
  conferenceAlias: PropTypes.string,
  conferenceId: PropTypes.string,
  displayModes: PropTypes.array,
  displayActions: PropTypes.array,
  isAdmin: PropTypes.bool,
  ttl: PropTypes.number,
  rtcpmode: PropTypes.string,
  mode: PropTypes.string,
  videoCodec: PropTypes.string,
  userInfo: PropTypes.object,
  constraints: PropTypes.object,
  videoRatio: PropTypes.object,
  refreshTokenCallback: PropTypes.func,
  liveRecordingEnabled: PropTypes.bool,
  isDemo: PropTypes.bool
};

StatusButton.defaultProps = {
  videoRatio: null,
  isDemo: false,
  liveRecordingEnabled: false,
  isElectron: false,
  rtcpmode: "worst",
  mode: "standard",
  ttl: 0,
  videoCodec: "VP8",
  isListener: false,
  isAdmin: false,
  displayModes: null,
  displayActions: null,
  userInfo: {
    name: "Guest " + Math.floor(Math.random() * 100 + 1),
    externalId: "",
    avatarUrl: ""
  },
  constraints: {
    audio: true,
    video: false
  }
};

export default StatusButton;
