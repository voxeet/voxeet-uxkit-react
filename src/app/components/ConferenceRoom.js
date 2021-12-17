import React, { Fragment, Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import bowser from "bowser";
import { strings } from "../languages/localizedStrings";
import Cookies from "./../libs/Storage";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import canAutoPlay from 'can-autoplay';
import { Actions as ConferenceActions } from "../actions/ConferenceActions";
import { Actions as ControlsActions } from "../actions/ControlsActions";
import { Actions as ParticipantActions } from "../actions/ParticipantActions";
import { Actions as ErrorActions } from "../actions/ErrorActions";
import ActionsButtons from "./actionsBar/ActionsButtons";
import "../../styles/main.less";
import ConferenceRoomContainer from "./ConferenceRoomContainer";
import ConferencePreConfigContainer from "./ConferencePreConfigContainer";
import AttendeesWaiting from "./attendees/AttendeesWaiting";
import AttendeesList from "./attendees/AttendeesList";
import AttendeesChat from "./attendees/chat/AttendeesChat";
import LoadingScreen from "./attendees/LoadingScreen";
import { setPstnNumbers } from "../constants/PinCode";
import {isMobile} from "../libs/browserDetection";
import {getUxKitContext} from "../context";

@connect((state) => {
  return {
    conferenceStore: state.voxeet.conference,
    errorStore: state.voxeet.error,
    participantsStore: state.voxeet.participants,
  };
}, null, null, { context: getUxKitContext() })
class ConferenceRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      preConfig: false, // Will decide later
      loading: true,    // Start with loader
    };
    this.handleJoin = this.handleJoin.bind(this);
    this.initializeControlsStore();
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
      videoCodec,
      sdk,
      dolbyVoice,
      chromeExtensionId,
      autoRecording,
      videoRatio,
      liveRecordingEnabled,
      conferenceAlias,
      pinCode,
      conferenceId,
      isDemo,
      closeSessionAtHangUp,
      // constraints,
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
      chatOptions,
      spatialAudio
    } = this.props;
    let { constraints } = this.props;
    if(preConfigPayload && preConfigPayload.maxVideoForwarding!==undefined) {
      this.props.dispatch(ControlsActions.setMaxVideoForwarding(preConfigPayload.maxVideoForwarding));
      this.maxVideoForwarding = preConfigPayload.maxVideoForwarding;
    }
    let maxVideoForwarding = this.maxVideoForwarding;
    if(preConfigPayload && preConfigPayload.videoEnabled!==undefined) {
      this.props.dispatch(ControlsActions.toggleVideo(preConfigPayload.videoEnabled));
      this.videoEnabled = preConfigPayload.videoEnabled;
    }
    constraints.video = this.videoEnabled;
    if(preConfigPayload && preConfigPayload.audioTransparentMode!==undefined) {
      this.props.dispatch(ControlsActions.setAudioTransparentMode(preConfigPayload.audioTransparentMode));
      this.audioTransparentMode = preConfigPayload.audioTransparentMode;
    }
    let audioTransparentMode = this.audioTransparentMode;
    if(preConfigPayload && preConfigPayload.virtualBackgroundMode!==undefined) {
      this.props.dispatch(ControlsActions.setVirtualBackgroundMode(preConfigPayload.virtualBackgroundMode));
      this.virtualBackgroundMode = preConfigPayload.virtualBackgroundMode;
    }
    if(preConfigPayload && preConfigPayload.videoDenoise!==undefined) {
      this.props.dispatch(ControlsActions.setVideoDenoise(preConfigPayload.videoDenoise));
      this.videoDenoise = preConfigPayload.videoDenoise;
    }
    let initialized;
    let pinCodeTmp = pinCode;
    if (oauthToken != null) {
      initialized = this.props.dispatch(
        ConferenceActions.initializeWithToken(oauthToken, refreshTokenCallback, {chatOptions})
      );
    } else {
      initialized = this.props.dispatch(
        ConferenceActions.initialize(consumerKey, consumerSecret, {chatOptions})
      );
    }

    if (handleOnConnect != null) {
      this.props.dispatch(ParticipantActions.handleOnConnect(handleOnConnect));
    }

    if (pstnNumbers != null) {
      setPstnNumbers(pstnNumbers);
    }

    if (pinCodeTmp != null) {
      if (pinCodeTmp.length !== 8 || !/^\d+$/.test(pinCodeTmp)) {
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

    if (spatialAudio) {
      this.props.dispatch(ParticipantActions.spatialAudioActivated());
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
          this.props.dispatch(ConferenceActions.joinDemo(userInfo, spatialAudio))
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
              pinCodeTmp,
              simulcast,
              dolbyVoice,
              maxVideoForwarding,
              chatOptions,
              spatialAudio
            )
          );
        });
      }
      if (conferenceAlias != null) {
        //initialized.then(() => this.props.dispatch(ConferenceActions.subscribeConference(conferenceAlias)))
      }
    }
  }

  /**
   * Set remembered from cookies or default values in controls store
   * Cookies should contain last value user set in preconf form or AttendeesSettings
   * Default values are set as Component param
   */
  initializeControlsStore() {
    let date = new Date();
    date.setDate(date.getDate() + 365);
    const default_cookie_params = {
      path: "/",
      expires: date,
      secure: true,
      sameSite: 'none'
    };
    // maxVideoForwarding
    let maxVideoForwarding = Cookies.get("maxVideoForwarding");
    maxVideoForwarding = parseInt(maxVideoForwarding);
    if( maxVideoForwarding===undefined || isNaN(maxVideoForwarding) ){
      maxVideoForwarding = this.props.maxVideoForwarding;
      //console.log('Setting default value for maxVideoForwarding to app default', maxVideoForwarding);
    }
    if( maxVideoForwarding===undefined || isNaN(maxVideoForwarding) ){
      maxVideoForwarding = isMobile()?4:9;
      //console.log('Setting default value for maxVideoForwarding to system default', maxVideoForwarding);
    }
    this.props.dispatch(ControlsActions.setMaxVideoForwarding(maxVideoForwarding));
    Cookies.set("maxVideoForwarding", maxVideoForwarding, default_cookie_params);
    this.maxVideoForwarding = maxVideoForwarding;
    // videoEnabled
    let videoEnabled = Cookies.get("videoEnabled");
    if( videoEnabled!==undefined ) {
      if (typeof videoEnabled === 'string' || videoEnabled instanceof String)
        videoEnabled = videoEnabled.toLowerCase() !== 'false';
      else
        videoEnabled = Boolean(videoEnabled);
      //console.log('Setting default value for videoEnabled to user default', videoEnabled);
    } else {
      videoEnabled = this.props.constraints?this.props.constraints.video:false;
      //console.log('Setting default value for videoEnabled to app default', videoEnabled);
    }
    if( videoEnabled!==undefined ) {
      if (typeof videoEnabled === 'string' || videoEnabled instanceof String)
        videoEnabled = videoEnabled.toLowerCase() !== 'false';
      else
        videoEnabled = Boolean(videoEnabled);
    } else {
      videoEnabled = false;
      //console.log('Setting default value for videoEnabled to system default', videoEnabled);
    }
    this.props.dispatch(ControlsActions.toggleVideo(videoEnabled));
    Cookies.set("videoEnabled", videoEnabled, default_cookie_params);
    this.videoEnabled = videoEnabled;
    // audioTransparentMode
    let audioTransparentMode = Cookies.get("audioTransparentMode");
    if( audioTransparentMode!==undefined ) {
      if (typeof audioTransparentMode === 'string' || audioTransparentMode instanceof String)
        audioTransparentMode = audioTransparentMode.toLowerCase() !== 'false';
      else
        audioTransparentMode = Boolean(audioTransparentMode);
      //console.log('Setting default value for audioTransparentMode to user default', audioTransparentMode);
    } else {
      audioTransparentMode = this.props.audioTransparentMode;
      //console.log('Setting default value for audioTransparentMode to app default', audioTransparentMode);
    }
    if( audioTransparentMode!==undefined ) {
      if (typeof audioTransparentMode === 'string' || audioTransparentMode instanceof String)
        audioTransparentMode = audioTransparentMode.toLowerCase() !== 'false';
      else
        audioTransparentMode = Boolean(audioTransparentMode);
    } else {
      audioTransparentMode = false;
      //console.log('Setting default value for audioTransparentMode to system default', audioTransparentMode);
    }
    this.props.dispatch(ControlsActions.setAudioTransparentMode(audioTransparentMode));
    Cookies.set("audioTransparentMode", audioTransparentMode, default_cookie_params);
    this.audioTransparentMode = audioTransparentMode;

    let virtualBackgroundMode = Cookies.get("virtualBackgroundMode");
    if(virtualBackgroundMode=='null')
      virtualBackgroundMode = null;
    this.props.dispatch(ControlsActions.setVirtualBackgroundMode(virtualBackgroundMode));
    this.virtualBackgroundMode = virtualBackgroundMode;
    console.log('initializeControlsStore virtualBackgroundMode', this.virtualBackgroundMode);

    let videoDenoise = Cookies.get("videoDenoise");
    if( videoDenoise!==undefined ) {
      if (typeof videoDenoise === 'string' || videoDenoise instanceof String)
        videoDenoise = videoDenoise.toLowerCase() !== 'false';
      else
        videoDenoise = Boolean(videoDenoise);
      //console.log('Setting default value for videoDenoise to user default', videoDenoise);
    } else {
      videoDenoise = this.props.videoDenoise?this.props.videoDenoise:false;
      //console.log('Setting default value for videoDenoise to app default', videoDenoise);
    }
    if( videoDenoise!==undefined ) {
      if (typeof videoDenoise === 'string' || videoDenoise instanceof String)
        videoDenoise = videoDenoise.toLowerCase() !== 'false';
      else
        videoDenoise = Boolean(videoDenoise);
    } else {
      videoDenoise = false;
      //console.log('Setting default value for videoDenoise to system default', videoDenoise);
    }
    this.props.dispatch(ControlsActions.setVideoDenoise(videoDenoise));
    Cookies.set("videoDenoise", videoDenoise, default_cookie_params);
    this.videoDenoise = videoDenoise;
  }

  async componentDidMount() {
    // Print UXKit Version
    console.log("UXKit Version: " + __VERSION__);
    let props = this.props;
    const { isWebinar, isAdmin, isListener, preConfig } = this.props;
    let doPreConfigCheck =
        (!isListener &&
        // !isMobile() &&
        (!isWebinar || (isWebinar && isAdmin)));
    let doPreConfig =
        !isListener &&
        !bowser.msie &&
        !isMobile() &&
        (!isWebinar || (isWebinar && isAdmin))
            ? (preConfig)
            : false;

    const shouldStartPreConfig = doPreConfigCheck? await this.preConfigCheck(doPreConfig): doPreConfig;

    this.setState({loading:false, preConfig: shouldStartPreConfig}, () => {
      if (!this.state.preConfig) {
        this.startConferenceWithParams();
      }
    })
  }

  /**
   * Check precofigured devices and is it possible to create audio context
   * @returns {Promise<void>}
   */
  async preConfigCheck(preConfig) {
    const { constraints } = this.props;
    // console.log('preConfigCheck', preConfig, constraints);

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
            console.error('Could not get access to required media', err)
            //this.props.dispatch(ErrorActions.onError(err));
            return true;
          });
    }

    if(preConfig) {
      console.log('Preconfig required, just asking for device permissions');
      await checkPermissions();
      return true;
    } else {
      return new Promise(async (resolve) => {
        // Request access to audio video devices
        await checkPermissions();
        //console.log('About to check Auto-play', await canAutoPlay.audio({inline:true, muted:false}), await canAutoPlay.video({inline:true, muted:false}), constraints);
        /*let canAutoPlayAudio = (!constraints || !constraints.audio)? {result: true} : await canAutoPlay.audio({inline:true, muted:false});
        let canAutoPlayVideo = (!constraints || !constraints.video)? {result: true} : await canAutoPlay.video({inline:true, muted:false});
        if(!canAutoPlayAudio.result || !canAutoPlayVideo.result) {
          console.log('Auto-play check failed... will force preconfig', canAutoPlayAudio, canAutoPlayVideo);
          return this.setState({preConfig: true}, () => {
            resolve(true)
          });
        } else*/ if(constraints && (constraints.audio || constraints.video)) {
          //console.log('About to check preconfigured audio input / camera', Cookies.get("input"), Cookies.get("camera"));
          // Check selected devices stored in cookies
          if(constraints.audio && !Cookies.get("input") && !isMobile()) {
            console.log('Audio input not configured... will force preconfig');
            return this.setState({preConfig: true}, () => {
              resolve(true)
            });
          }
          if(constraints.video && !Cookies.get("camera") && !isMobile()) {
            console.log('Camera input not configured... will force preconfig');
            return this.setState({preConfig: true}, () => {
              resolve(true)
            });
          }
          let selectedAudio = Cookies.get("input") || "default",
              selectedVideo = Cookies.get("camera") || "default";
          // console.log('About to check availability of preconfigured audio input / camera', Cookies.get("input"), Cookies.get("camera"));
          // Check if exists device with Id set in cookies
          let foundAudio = !constraints.audio?
              true :
              await VoxeetSDK.mediaDevice.enumerateAudioDevices().then((devices) => {
                return devices.find( (source) => (selectedAudio == source.deviceId) );
              });
          let foundVideo = !constraints.video?
              true :
              await VoxeetSDK.mediaDevice.enumerateVideoDevices().then((devices) => {
                return devices.find( (source) => (selectedVideo == source.deviceId) );
              });
          // TODO: prevent read errors
          console.log('About to check availability of preconfigured audio input / camera streams', selectedAudio, selectedVideo);
          let gotAudioStream = true;
          if(constraints.audio) {
            gotAudioStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: selectedAudio } } })
                .then((stream) => {
                  stream.getTracks().forEach(track => {
                    track.stop();
                  });
                  return true;
                })
                .catch((err) => {
                  console.error('error getting audio stream', err)
                  return false;
                });
          }
          let gotVideoStream = true;
          if(constraints.video) {
            gotVideoStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: selectedVideo } } })
                .then((stream) => {
                  stream.getTracks().forEach(track => {
                    track.stop();
                  });
                  return true;
                })
                .catch((err) => {
                  console.error('error getting video stream', err)
                  return false;
                });
          }
          if(!foundAudio || !foundVideo || !gotAudioStream || !gotVideoStream) {
            console.log('Failed to find preconfigured audio input / camera', foundAudio, foundVideo, gotAudioStream, gotVideoStream);
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
      dolbyVoice,
      chatOptions,
      spatialAudio
    } = this.props;
    const {
      screenShareEnabled,
      filePresentationEnabled,
      videoPresentationEnabled,
    } = this.props.participantsStore;
    const { preConfig, loading } = this.state;
    const {
      isJoined,
      conferenceId,
      initialized,
      isReplaying,
      conferenceReplayId,
      isDemo,
      conferencePincode,
      hasLeft,
      dolbyVoiceEnabled,
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
              {errorMessage === "NotAllowedError: Permission denied" &&
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
            {errorMessage === "NotAllowedError: Permission denied" &&
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
    } else if (!initialized && !isJoined && isError) {
      return (
        <div className="voxeet-loading-message-container">
          <div className="voxeet-loading-center-container">
            <div className="voxeet-loading-logo-container">
              {logo != null ? <img src={logo} /> : <div className="ddloader" />}
            </div>
            <div className="voxeet-loading-info-container">
              {errorMessage === "MaxCapacityError: Conference is at maximum capacity." && (
                <Fragment>
                  {strings.titleConferenceCapacityError}
                    <div>
                      {strings.descConferenceCapacityError}
                    </div>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      );
    } else if (loading) {
      return this.renderLoading();
    } else if (preConfig) {
      return (
        <ConferencePreConfigContainer
          constraints={constraints}
          loadingScreen={this.props.loadingScreen}
          logo={this.props.logo}
          handleJoin={this.handleJoin}
          dolbyVoiceEnabled={dolbyVoice}
          spatialAudioEnabled={spatialAudio}
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
          dolbyVoiceEnabled={dolbyVoiceEnabled}
          chatOptions={chatOptions}
          spatialAudioEnabled={spatialAudio}
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
  dolbyVoice: PropTypes.bool,
  spatialAudio: PropTypes.bool,
  maxVideoForwarding: PropTypes.number,
  simulcast: PropTypes.bool,
  mode: PropTypes.string,
  videoCodec: PropTypes.string,
  closeSessionAtHangUp: PropTypes.bool,
  isModal: PropTypes.bool,
  isWebinar: PropTypes.bool,
  preConfig: PropTypes.bool,
  chromeExtensionId: PropTypes.string,
  autoRecording: PropTypes.bool,
  userInfo: PropTypes.object,
  chatOptions: PropTypes.object,
  invitedUsers: PropTypes.array,
  constraints: PropTypes.object,
  videoRatio: PropTypes.object,
  autoJoin: PropTypes.bool,
  pinCode: PropTypes.string,
  actionsButtons: PropTypes.func,
  attendeesList: PropTypes.object,
  attendeesChat: PropTypes.object,
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
  dolbyVoice: true,
  maxVideoForwarding: isMobile()?4:9,
  kickOnHangUp: false,
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
  spatialAudio: false,
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
  chatOptions: {
    autoLinker: true
  },
  actionsButtons: ActionsButtons,
  attendeesList: AttendeesList,
  attendeesChat: AttendeesChat,
  loadingScreen: LoadingScreen,
  attendeesWaiting: AttendeesWaiting,
};

export default ConferenceRoom;
