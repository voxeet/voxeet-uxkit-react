import React, { Fragment, Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import bowser from "bowser";
import { strings } from "../languages/localizedStrings";
import Cookies from "js-cookie";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import canAutoPlay from 'can-autoplay';

import { Actions as ConferenceActions } from "../actions/ConferenceActions";
import { Actions as ControlsActions } from "../actions/ControlsActions";
import { Actions as ParticipantActions } from "../actions/ParticipantActions";
import ActionsButtons from "./actionsBar/ActionsButtons";

import Modal from "./attendees/modal/Modal";

import "../../styles/main.less";
import ConferenceRoomContainer from "./ConferenceRoomContainer";
import ConferencePreConfigContainer from "./ConferencePreConfigContainer";
import AttendeesWaiting from "./attendees/AttendeesWaiting";
import AttendeesList from "./attendees/AttendeesList";
import AttendeesChat from "./attendees/AttendeesChat";
import LoadingScreen from "./attendees/LoadingScreen";
import { setPstnNumbers } from "../constants/PinCode";

@connect((state) => {
  return {
    conferenceStore: state.voxeet.conference,
    errorStore: state.voxeet.error,
    participantsStore: state.voxeet.participants,
  };
})
class ConferenceRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      preConfig:
        !props.isListener &&
        !bowser.msie &&
        !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) &&
        (!props.isWebinar || (props.isWebinar && props.isAdmin))
          ? props.preConfig
          : false,
    };
    this.handleJoin = this.handleJoin.bind(this);
    this.startConferenceWithParams = this.startConferenceWithParams.bind(this);
  }

  replayConference(conferenceId) {
    const { isModal } = this.props;
    const { isJoined } = this.props.conferenceStore;
    if (!isJoined) {
      this.props.dispatch(ConferenceActions.replay(conferenceId, 0));
    } else if (isModal) {
      this.props.dispatch(ControlsActions.toggleModal());
    }
  }

  handleJoin(preConfigPayload) {
    this.startConferenceWithParams(preConfigPayload);
    this.setState({ preConfig: false });
  }

  renderLoading() {
    return React.createElement(this.props.loadingScreen, {
      logo: this.props.logo,
    });
  }

  startConferenceWithParams(preConfigPayload = null) {
    const {
      ttl,
      shareActions,
      mode,
      autoHls,
      videoCodec,
      sdk,
      chromeExtensionId,
      autoRecording,
      videoRatio,
      liveRecordingEnabled,
      conferenceAlias,
      pinCode,
      conferenceId,
      isDemo,
      closeSessionAtHangUp,
      constraints,
      displayModes,
      customLocalizedStrings,
      displayActions,
      consumerKey,
      consumerSecret,
      userInfo,
      pstnNumbers,
      autoJoin,
      isWidget,
      isManualKickAllowed,
      kickOnHangUp,
      handleOnConnect,
      isWebinar,
      handleOnLeave,
      conferenceReplayId,
      isAdmin,
      oauthToken,
      disableSounds,
      simulcast,
      invitedUsers,
      refreshTokenCallback,
      isListener,
    } = this.props;
    let initialized = null;
    var pinCodeTmp = pinCode;
    if (oauthToken != null) {
      initialized = this.props.dispatch(
        ConferenceActions.initializeWithToken(oauthToken, refreshTokenCallback)
      );
    } else {
      initialized = this.props.dispatch(
        ConferenceActions.initialize(consumerKey, consumerSecret)
      );
    }

    if (handleOnConnect != null) {
      this.props.dispatch(ParticipantActions.handleOnConnect(handleOnConnect));
    }

    if (pstnNumbers != null) {
      setPstnNumbers(pstnNumbers);
    }

    if (pinCodeTmp != null) {
      if (pinCodeTmp.length != 8 || !/^\d+$/.test(pinCodeTmp)) {
        pinCodeTmp = "";
      }
    }

    if (handleOnLeave != null) {
      this.props.dispatch(ParticipantActions.handleOnLeave(handleOnLeave));
    }

    if (displayModes != null) {
      this.props.dispatch(ControlsActions.displayModesAllowed(displayModes));
    }

    if (shareActions != null) {
      this.props.dispatch(ControlsActions.shareActionsAllowed(shareActions));
    }

    if (isListener) {
      this.props.dispatch(
        ControlsActions.displayActionsAllowed(["attendees", "chat"])
      );
    } else if (displayActions != null) {
      this.props.dispatch(
        ControlsActions.displayActionsAllowed(displayActions)
      );
    }

    if (conferenceReplayId != null) {
      initialized.then(() => {
        this.props.dispatch(
          ConferenceActions.subscribeConference(conferenceAlias)
        );
        this.replayConference(conferenceReplayId);
      });
    } else {
      if (isAdmin) {
        this.props.dispatch(ParticipantActions.onParticipantAdmin());
      }

      if (isDemo) {
        this.props.dispatch(ConferenceActions.demo());
      }

      if (customLocalizedStrings) {
        strings.setContent(customLocalizedStrings);
      }

      if (videoRatio != null) {
        this.props.dispatch(ControlsActions.setVideoRatio(videoRatio));
      }

      if (invitedUsers != null) {
        this.props.dispatch(ParticipantActions.setInvitedUsers(invitedUsers));
      }

      if (chromeExtensionId != null) {
        this.props.dispatch(
          ControlsActions.setChromeExtensionId(chromeExtensionId)
        );
      }

      if (isWebinar) {
        this.props.dispatch(ParticipantActions.webinarActivated());
      }

      if (isManualKickAllowed) {
        // activate admin mode (creator admin)
        this.props.dispatch(ControlsActions.adminActived());
      }

      if (disableSounds) {
        this.props.dispatch(ControlsActions.disableSounds());
      }

      if (kickOnHangUp) {
        // activate kick everybody on hangup
        this.props.dispatch(ControlsActions.isKickOnHangUpActived());
      }

      this.props.dispatch(
        ControlsActions.closeSessionAtHangUp(closeSessionAtHangUp)
      );

      ControlsActions.setSimulcast(simulcast);

      if (isDemo) {
        initialized.then(() =>
          this.props.dispatch(ConferenceActions.joinDemo())
        );
      } /*else if (autoJoin && conferenceId != null) {
        const constraintsUpdated = {
          video: constraints.video,
          audio: constraints.audio,
          params: {
            liveRecording: liveRecordingEnabled
          }
        };
        initialized.then(() =>
          this.props.dispatch(
            ConferenceActions.joinWithConferenceId(
              conferenceId,
              constraintsUpdated,
              userInfo,
              videoRatio,
              isListener,
              preConfigPayload,
              autoRecording,
              autoHls,
              pinCodeTmp
            )
          )
        );
      } */ else if (
        autoJoin &&
        conferenceReplayId == null
      ) {
        // Autojoin when entering in fullscreen mode
        initialized.then(() => {
          this.props.dispatch(
            ConferenceActions.join(
              conferenceAlias,
              isAdmin,
              constraints,
              liveRecordingEnabled,
              ttl,
              mode,
              videoCodec,
              userInfo,
              videoRatio,
              isListener,
              preConfigPayload,
              autoRecording,
              autoHls,
              pinCodeTmp,
              simulcast
            )
          );
        });
      }
      if (conferenceAlias != null) {
        //initialized.then(() => this.props.dispatch(ConferenceActions.subscribeConference(conferenceAlias)))
      }
    }
  }

  async componentDidMount() {
    // Print UXKit Version
    console.log("UXKit Version: " + __VERSION__);
    const shouldStart = await this.preConfigCheck();

    const { preConfig } = this.state;
    const { isWebinar, isAdmin } = this.props;
    if (!preConfig) {
      this.startConferenceWithParams();
    }
  }

  /**
   * Check precofigured devices and is it possible to create audio context
   * @returns {Promise<void>}
   */
  async preConfigCheck() {
    const { preConfig } = this.state;
    const { constraints } = this.props;
    // console.log('preConfigCheck', preConfig, constraints);
    //
    //
    const checkPermissions = async () => {
      //console.log('About to check access to audio/video devices', { audio: constraints.audio, video: constraints.video})
      return await navigator.mediaDevices.getUserMedia({ audio: constraints.audio, video: constraints.video})
          .then((stream) => {
            //console.log('Got stream, about to close it');
            stream.getTracks().forEach(track => {
              track.stop();
            });
            return false;
          })
          .catch((err) => {
            console.error('Got error', err)
            return true;
          });
    }
    if(preConfig) {
      //console.log('Preconfig required, just asking for device permissions');
      return await checkPermissions(); // Just check permitions
    } else {
      return new Promise(async (resolve) => {
        // Request access to audio video devices
        await checkPermissions();
        //console.log('About to check Auto-play', await canAutoPlay.audio({inline:true, muted:false}), await canAutoPlay.video({inline:true, muted:false}), constraints);
        let canAutoPlayAudio = (!constraints || !constraints.audio)? {result: true} : await canAutoPlay.audio({inline:true, muted:false});
        let canAutoPlayVideo = (!constraints || !constraints.video)? {result: true} : await canAutoPlay.video({inline:true, muted:false});
        if(!canAutoPlayAudio.result || !canAutoPlayVideo.result) {
          console.log('Auto-play check failed... will force preconfig', canAutoPlayAudio, canAutoPlayVideo);
          return this.setState({preConfig: true}, () => {
            resolve(true)
          });
        } else if(constraints && (constraints.audio || constraints.video)) {
          //console.log('About to check preconfigured audio input / camera', Cookies.get("input"), Cookies.get("camera"));
          // Check cookies
          if(constraints.audio && !Cookies.get("input")) {
            console.log('Audio input not configured... will force preconfig');
            return this.setState({preConfig: true}, () => {
              resolve(true)
            });
          }
          if(constraints.video && !Cookies.get("camera")) {
            console.log('Camera input not configured... will force preconfig');
            return this.setState({preConfig: true}, () => {
              resolve(true)
            });
          }
          // console.log('About to check availability of preconfigured audio input / camera', Cookies.get("input"), Cookies.get("camera"));
          // Check if exists device with Id set in cookies
          let foundAudio = !constraints.audio?
              true :
              await VoxeetSDK.mediaDevice.enumerateAudioDevices().then((devices) => {
                return devices.find( (source) => (Cookies.get("input") == source.deviceId) );
              });
          let foundVideo = !constraints.video?
              true :
              await VoxeetSDK.mediaDevice.enumerateVideoDevices().then((devices) => {
                return devices.find( (source) => (Cookies.get("camera") == source.deviceId) );
              });
          // TODO: prevent read errors
          // let gotAudioStream = true;
          // if(foundAudio) {
          //   gotAudioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: Cookies.get("input") } } })
          //       .then((stream) => {
          //         return true;
          //       })
          //       .catch((err) => {
          //         return false;
          //       });
          // }
          // let gotVideoStream = true;
          // if(foundVideo) {
          //   gotVideoStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: Cookies.get("input") } } })
          //       .then((stream) => {
          //         return true;
          //       })
          //       .catch((err) => {
          //         return false;
          //       });
          // }
          if(!foundAudio || !foundVideo /*|| !gotAudioStream || !gotVideoStream*/) {
            console.log('Failed to find preconfigured audio input / camera', foundAudio, foundVideo);
            return this.setState({preConfig: true}, () => {
              resolve(true)
            });
          }
          // console.log('No need for preconfig');
          return resolve(false);
        } else {
          // console.log('No need for preconfig');
          return resolve(false);
        }
      });
    }
  }

  render() {
    const {
      isListener,
      dispatch,
      options,
      isWidget,
      isModal,
      conferenceAlias,
      constraints,
      actionsButtons,
      attendeesList,
      attendeesChat,
      handleOnLeave,
      attendeesWaiting,
      isWebinar,
      isAdmin,
      logo,
    } = this.props;
    const {
      screenShareEnabled,
      filePresentationEnabled,
      videoPresentationEnabled,
    } = this.props.participantsStore;
    const { preConfig } = this.state;
    const {
      isJoined,
      conferenceId,
      initialized,
      isReplaying,
      conferenceReplayId,
      isDemo,
      conferencePincode,
      hasLeft,
    } = this.props.conferenceStore;
    const { errorMessage, isError } = this.props.errorStore;
    if (bowser.ios && bowser.chrome) {
      return (
        <div className="voxeet-loading-message-container">
          <div className="voxeet-loading-center-container">
            <div className="voxeet-loading-logo-container">
              {logo != null ? <img src={logo} /> : <div className="ddloader" />}
            </div>
            <div className="voxeet-loading-info-container">
              {strings.browerNotSupported}
            </div>
          </div>
        </div>
      );
    } else if (initialized && !isJoined && isError) {
      return (
        <div className="voxeet-loading-message-container">
          <div className="voxeet-loading-center-container">
            <div className="voxeet-loading-logo-container">
              {logo != null ? <img src={logo} /> : <div className="ddloader" />}
            </div>
            <div className="voxeet-loading-info-container">
              {errorMessage == "NotAllowedError: Permission denied" &&
                strings.errorPermissionDeniedMicrophone}
              {bowser.msie && (
                <Fragment>
                  {strings.errorIE11}
                  <div>
                    <a
                      download
                      href="https://s3.amazonaws.com/voxeet-cdn/ie11/WebRTC+ActiveX+Setup.exe"
                    >
                      Download
                    </a>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
          <div className="voxeet-loading-info-container">
            {errorMessage == "NotAllowedError: Permission denied" &&
              strings.errorPermissionDenied}
            {bowser.msie && (
              <Fragment>
                {strings.errorIE11}
                <div>
                  <a
                    download
                    href="https://s3.amazonaws.com/voxeet-cdn/ie11/WebRTC+ActiveX+Setup.exe"
                  >
                    Download
                  </a>
                </div>
              </Fragment>
            )}
          </div>
        </div>
      );
    } else if (preConfig) {
      return (
        <ConferencePreConfigContainer
          constraints={constraints}
          loadingScreen={this.props.loadingScreen}
          logo={this.props.logo}
          handleJoin={this.handleJoin}
        />
      );
    } else if (isJoined || !isWidget || conferenceReplayId != null) {
      if (!preConfig && !isJoined && !hasLeft) {
        return this.renderLoading();
      }
      return (
        <ConferenceRoomContainer
          forceFullscreen={!isWidget || isModal}
          isJoined={isJoined}
          conferencePincode={conferencePincode}
          isAdmin={isAdmin}
          isDemo={isDemo}
          isModal={isModal}
          isWebinar={isWebinar}
          actionsButtons={actionsButtons}
          attendeesChat={attendeesChat}
          attendeesList={attendeesList}
          screenShareEnabled={screenShareEnabled}
          filePresentationEnabled={filePresentationEnabled}
          videoPresentationEnabled={videoPresentationEnabled}
          handleOnLeave={handleOnLeave}
          conferenceId={conferenceId}
          attendeesWaiting={attendeesWaiting}
        />
      );
    }
    return null;
  }
}

ConferenceRoom.propTypes = {
  sdk: PropTypes.object,
  isListener: PropTypes.bool,
  isManualKickAllowed: PropTypes.bool,
  kickOnHangUp: PropTypes.bool,
  consumerKey: PropTypes.string,
  consumerSecret: PropTypes.string,
  oauthToken: PropTypes.string,
  conferenceAlias: PropTypes.string,
  conferenceId: PropTypes.string,
  conferenceReplayId: PropTypes.string,
  displayModes: PropTypes.array,
  pstnNumbers: PropTypes.array,
  displayActions: PropTypes.array,
  shareActions: PropTypes.array,
  isWidget: PropTypes.bool,
  isAdmin: PropTypes.bool,
  ttl: PropTypes.number,
  simulcast: PropTypes.bool,
  mode: PropTypes.string,
  videoCodec: PropTypes.string,
  closeSessionAtHangUp: PropTypes.bool,
  isModal: PropTypes.bool,
  isWebinar: PropTypes.bool,
  preConfig: PropTypes.bool,
  chromeExtensionId: PropTypes.string,
  autoRecording: PropTypes.bool,
  autoHls: PropTypes.bool,
  userInfo: PropTypes.object,
  invitedUsers: PropTypes.array,
  constraints: PropTypes.object,
  videoRatio: PropTypes.object,
  autoJoin: PropTypes.bool,
  pinCode: PropTypes.string,
  actionsButtons: PropTypes.func,
  attendeesList: PropTypes.func,
  attendeesChat: PropTypes.func,
  loadingScreen: PropTypes.func,
  handleOnLeave: PropTypes.func,
  refreshTokenCallback: PropTypes.func,
  liveRecordingEnabled: PropTypes.bool,
  isDemo: PropTypes.bool,
  disableSounds: PropTypes.bool,
  customLocalizedStrings: PropTypes.object,
  handleOnConnect: PropTypes.func,
  attendeesWaiting: PropTypes.func,
};

ConferenceRoom.defaultProps = {
  isWidget: true,
  kickOnHangUp: false,
  autoHls: false,
  autoRecording: false,
  disableSounds: false,
  invitedUsers: null,
  videoRatio: null,
  pstnNumbers: null,
  handleOnConnect: null,
  chromeExtensionId: null,
  closeSessionAtHangUp: true,
  handleOnLeave: null,
  isDemo: false,
  pinCode: "",
  isManualKickAllowed: false,
  liveRecordingEnabled: false,
  ttl: 0,
  simulcast: false,
  mode: "standard",
  videoCodec: "H264",
  preConfig: false,
  conferenceId: null,
  isListener: false,
  isAdmin: false,
  displayModes: null,
  displayActions: null,
  logo: null,
  conferenceReplayId: null,
  isModal: false,
  isWebinar: false,
  autoJoin: false,
  userInfo: {
    name: "Guest " + Math.floor(Math.random() * 100 + 1),
    externalId: "",
    avatarUrl: "",
  },
  customLocalizedStrings: null,
  constraints: {
    audio: true,
    video: false,
  },
  actionsButtons: ActionsButtons,
  attendeesList: AttendeesList,
  attendeesChat: AttendeesChat,
  loadingScreen: LoadingScreen,
  attendeesWaiting: AttendeesWaiting,
};

export default ConferenceRoom;
