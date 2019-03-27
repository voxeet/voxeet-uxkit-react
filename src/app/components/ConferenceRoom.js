import React, { Fragment, Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import bowser from 'bowser'
import LocalizedStrings from 'react-localization';

import Sdk from '../sdk'

import { Actions as ConferenceActions } from '../actions/ConferenceActions'
import { Actions as ControlsActions } from '../actions/ControlsActions'
import { Actions as ParticipantActions } from '../actions/ParticipantActions'

import Logo from '../../static/images/logo.svg'
import StatusButton from './statusButton/StatusButton'
import ActionsButtons from './actionsBar/ActionsButtons'

import Modal from './attendees/modal/Modal'

import '../../styles/main.less'
import ConferenceRoomContainer from './ConferenceRoomContainer'
import AttendeesWaiting from './attendees/AttendeesWaiting';
import AttendeesList from './attendees/AttendeesList';
import AttendeesChat from './attendees/AttendeesChat';


let strings = new LocalizedStrings({
  en: {
    electronloading: "Voxeet is loading, please wait",
    errorPermissionDenied: "An error occured when joining the conference. Please make sure to allow access to your microphone.",
    errorIE11: "A plugin is mandatory for IE11, please download and install the plugin. When the installation is complete, please refresh this page.",
    browerNotSupported: "This browser is currently not supported."
  },
  fr: {
    electronloading: "Le client Voxeet va démarrer, veuillez patienter",
    errorPermissionDenied: "Une erreur est survenue lors de la connexion à la conference. Veuillez vérifier l'accès à votre microphone.",
    errorIE11: "Une extension est nécéssaire pour utiliser IE11. Téléchargez et installez l'extension suivante. Lorsque l'installation est terminée, actualisez cette page.",
    browerNotSupported: "Ce navigateur n'est pas pris en charge."
  }
});

@connect((state) => {
  return {
    conferenceStore: state.voxeet.conference,
    errorStore: state.voxeet.error,
    participantsStore: state.voxeet.participants
  }
})
class ConferenceRoom extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isElectron: false
    }  }

  replayConference(conferenceId) {
    const { isModal } = this.props
    const { isJoined } = this.props.conferenceStore
    if (!isJoined) {
      this.props.dispatch(ConferenceActions.replay(conferenceId, 0))
    } else if (isModal) {
      this.props.dispatch(ControlsActions.toggleModal())
    }
  }

  componentDidMount() {
    const { isListener, ttl, rtcpmode, mode, videoCodec, sdk, chromeExtensionId, videoRatio, broadcasterModeWebinar, liveRecordingEnabled, conferenceAlias, conferenceId, isDemo, constraints, displayModes, displayActions, consumerKey, consumerSecret, userInfo, autoJoin, isWidget, isManualKickAllowed, kickOnHangUp, handleOnConnect, isWebinar, handleOnLeave, conferenceReplayId, isAdmin, oauthToken, refreshTokenCallback, isElectron } = this.props
    if (sdk) { // Sdk must be already initialized
      Sdk.setSdk(sdk)
    } else {
      Sdk.create()
    }
    let initialized = null
    if (oauthToken != null) {
      initialized = this.props.dispatch(ConferenceActions.initializeWithToken(oauthToken, refreshTokenCallback, userInfo))
    } else {
      initialized = this.props.dispatch(ConferenceActions.initialize(consumerKey, consumerSecret, userInfo))
    }

    if (handleOnConnect != null) {
      this.props.dispatch(ParticipantActions.handleOnConnect(handleOnConnect))
    }

    if (handleOnLeave != null) {
      this.props.dispatch(ParticipantActions.handleOnLeave(handleOnLeave))
    }

    if (displayModes != null && !isWebinar)  {
      this.props.dispatch(ControlsActions.displayModesAllowed(displayModes))
    }

    if (isListener) {
      this.props.dispatch(ControlsActions.displayActionsAllowed(["attendees", "chat"]))
    } else if (displayActions != null)  {
      this.props.dispatch(ControlsActions.displayActionsAllowed(displayActions))
    }
    
    if (conferenceReplayId != null) {
      initialized.then(() => {
        this.props.dispatch(ConferenceActions.subscribeConference(conferenceAlias))
        this.replayConference(conferenceReplayId)
      })
    } else {

      if (isAdmin) {
        this.props.dispatch(ParticipantActions.onParticipantAdmin())
      }

      if (isDemo) {
        this.props.dispatch(ConferenceActions.demo())
      }

      if (videoRatio != null) {
        this.props.dispatch(ControlsActions.setVideoRatio(videoRatio))
      }

      if (chromeExtensionId != null) {
        this.props.dispatch(ControlsActions.setChromeExtensionId(chromeExtensionId))
      }

      if (isWebinar) {
        this.props.dispatch(ParticipantActions.webinarActivated())
      }

      if (isManualKickAllowed) { // activate admin mode (creator admin)
        this.props.dispatch(ControlsActions.adminActived())
      }

      if (isElectron) { // Launch widget in Electron mode
        this.props.dispatch(ControlsActions.electronModeActivated())
      }

      if (kickOnHangUp) { // activate kick everybody on hangup
        this.props.dispatch(ControlsActions.isKickOnHangUpActived())
      }
      if (isDemo) {
        initialized.then(() => this.props.dispatch(ConferenceActions.joinDemo()))
      } else if (autoJoin && conferenceId != null) {
        const constraintsUpdated = {
          video: constraints.video,
          audio: constraints.audio,
          params: {
            liveRecording: liveRecordingEnabled
          }
        }
        initialized.then(() => this.props.dispatch(ConferenceActions.joinWithConferenceId(conferenceId, constraintsUpdated, userInfo, videoRatio, isElectron, isListener)))
      } else if (autoJoin && conferenceReplayId == null) { // Autojoin when entering in fullscreen mode
        initialized.then(() => {
          this.props.dispatch(ConferenceActions.join(conferenceAlias, isAdmin, constraints, liveRecordingEnabled, ttl, rtcpmode, mode, videoCodec, userInfo, videoRatio, isElectron, isListener))
        })
      }
      if (conferenceAlias != null) {
        initialized.then(() => this.props.dispatch(ConferenceActions.subscribeConference(conferenceAlias)))
      }
    }
  }

  render() {
    const { dispatch, options, isWidget, isModal, conferenceAlias, constraints, actionsButtons, attendeesList, attendeesChat, handleOnLeave, attendeesWaiting, broadcasterModeWebinar, isWebinar, isAdmin } = this.props
    const { screenShareEnabled } = this.props.participantsStore
    const { errorMessage, isError } = this.props.errorStore
    const { isJoined, conferenceId, initialized, isReplaying, conferenceReplayId, isElectron, webinarLive, isDemo, conferencePincode } = this.props.conferenceStore
    if (bowser.ios && bowser.chrome) {
        return (
          <div className="electron-message-container">
            <div className="electron-center-container">
              <div className="electron-logo-container">
                <img src={Logo} />
              </div>
              <div className="electron-info-container">
                {strings.browerNotSupported}
              </div>
            </div>
          </div>
        )
    } else if (initialized && !isJoined && isError) {
      return(
          <div className="electron-message-container">
            <div className="electron-center-container">
              <div className="electron-logo-container">
                <img src={Logo} />
              </div>
              <div className="electron-info-container">
                { errorMessage == "NotAllowedError: Permission denied" &&
                  strings.errorPermissionDenied
                }
                { bowser.msie &&
                  <Fragment>
                    {strings.errorIE11} 
                    <div>
                      <a download href="https://s3.amazonaws.com/voxeet-cdn/ie11/WebRTC+ActiveX+Setup.exe">Download</a>
                    </div>
                  </Fragment>
                }
              </div>
            </div>
          </div>
      )
    } else if ((isJoined || !isWidget ||  conferenceReplayId != null) && !isElectron) {
      return (
        <ConferenceRoomContainer
          forceFullscreen={(!isWidget || isModal)}
          isJoined={isJoined}
          conferencePincode={conferencePincode}
          webinarLive={webinarLive}
          isAdmin={isAdmin}
          isDemo={isDemo}
          broadcasterModeWebinar={broadcasterModeWebinar}
          isModal={isModal}
          isWebinar={isWebinar}
          actionsButtons={actionsButtons}
          attendeesChat={attendeesChat}
          attendeesList={attendeesList}
          screenShareEnabled={screenShareEnabled}
          handleOnLeave={handleOnLeave}
          conferenceId={conferenceId}
          attendeesWaiting={attendeesWaiting}
        />
      )
    } else if (isElectron) {
      return (
        <div className="electron-message-container">
          <div className="electron-center-container">
            <div className="electron-logo-container">
              <img src={Logo} />
            </div>
            <div id="loader-container"><div className="loader"></div></div>
            <div className="electron-info-container">
              {strings.electronloading}<span className="one">.</span><span className="two">.</span><span className="three">.</span>
            </div>
          </div>
        </div>
      )
    }
    return (null)
  }
}

ConferenceRoom.propTypes = {
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
  conferenceReplayId: PropTypes.string,
  displayModes: PropTypes.array,
  displayActions: PropTypes.array,
  isWidget: PropTypes.bool,
  isAdmin: PropTypes.bool,
  ttl: PropTypes.number,
  rtcpmode: PropTypes.string,
  mode: PropTypes.string,
  videoCodec: PropTypes.string,
  isModal: PropTypes.bool,
  isWebinar: PropTypes.bool,
  chromeExtensionId: PropTypes.string,
  userInfo: PropTypes.object,
  constraints: PropTypes.object,
  videoRatio: PropTypes.object,
  autoJoin: PropTypes.bool,
  actionsButtons: PropTypes.func,
  attendeesList: PropTypes.func,
  attendeesChat: PropTypes.func,
  broadcasterModeWebinar: PropTypes.bool,
  handleOnLeave: PropTypes.func,
  refreshTokenCallback: PropTypes.func,
  liveRecordingEnabled: PropTypes.bool,
  isDemo: PropTypes.bool,
  handleOnConnect: PropTypes.func,
  attendeesWaiting: PropTypes.func
}

ConferenceRoom.defaultProps = {
  isWidget: true,
  kickOnHangUp: false,
  videoRatio: null,
  handleOnConnect: null,
  chromeExtensionId: null,
  handleOnLeave: null,
  broadcasterModeWebinar: true,
  isDemo: false,
  isManualKickAllowed: false,
  liveRecordingEnabled: false,
  ttl: 0,
  isElectron: false,
  rtcpmode: 'worst',
  mode: 'standard',
  videoCodec: 'VP8',
  conferenceId: null,
  isListener: false,
  isAdmin: false,
  displayModes: null,
  displayActions: null,
  conferenceReplayId: null,
  isModal: false,
  isWebinar: false,
  autoJoin: false,
  userInfo: {
    name: 'Guest ' + Math.floor((Math.random() * 100) + 1),
    externalId: '',
    avatarUrl: '',
  },
  constraints: {
    audio: true,
    video: false
  },
  actionsButtons: ActionsButtons,
  attendeesList: AttendeesList,
  attendeesChat: AttendeesChat,
  attendeesWaiting: AttendeesWaiting
}

export default ConferenceRoom
