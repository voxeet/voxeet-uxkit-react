import Sdk from '../sdk'
import bowser from 'bowser'
import { Actions as ErrorActions } from './ErrorActions'
import { Actions as ControlsActions } from './ControlsActions'
import { Actions as ParticipantActions } from './ParticipantActions'
import { Actions as ConferenceActions } from './ConferenceActions'
import { Actions as ParticipantWaitingActions } from './ParticipantWaitingActions'
import { Actions as OnBoardingMessageActions } from './OnBoardingMessageActions'
import { Actions as OnBoardingMessageWithActionActions } from './OnBoardingMessageWithActionActions'
import { Actions as TimerActions } from './TimerActions'
import LocalizedStrings from 'react-localization';
import { getOrganizedPosition, getRelativePosition } from './../libs/position';
import { STATUS_CONNECTING, STATUS_CONNECTED, STATUS_ON_AIR } from './../constants/ParticipantStatus'
import { BROADCAST_KICK, BROADCAST_KICK_ADMIN_HANG_UP, WEBINAR_LIVE } from './../constants/BroadcastMessageType'

export const Types = {
    INITIALIZED_SUCCESS: 'INITIALIZED_SUCCESS',
    CONFERENCE_CONNECTING: 'CONFERENCE_CONNECTING',
    CONFERENCE_REPLAYING: 'CONFERENCE_REPLAYING',
    CONFERENCE_JOINED: 'CONFERENCE_JOINED',
    CONFERENCE_DEMO: 'CONFERENCE_DEMO',
    CONFERENCE_ELECTRON: 'CONFERENCE_ELECTRON',
    CONFERENCE_WEBINAR_LIVE: 'CONFERENCE_WEBINAR_LIVE',
    INCREMENT_TIME: 'INCREMENT_TIME',
    CONFERENCE_LEAVE: 'CONFERENCE_LEAVE',
    REPLAY_ENDED: 'REPLAY_ENDED',
    CONFERENCE_STATUS_UPDATED: 'CONFERENCE_STATUS_UPDATED'
}

let strings = new LocalizedStrings({
 en:{
   installExtension: "Please install the screen share extension with this ",
   noExtensionAvailable: "No Chrome Web Extension configure for screen share.",
   microphoneOff: "Your microphone is muted.",
   microphoneOn: "Your microphone is on.",
   cameraOn: "Your camera is on.",
   cameraOff: "Your camera is off.",
   recordConferenceStart: "Your conference is being recorded.",
   recordConferenceStop: "Your conference is no longer recorded.",
   screenshareInProgress: "A screen share is already in progress."
 },
 fr: {
   installExtension: "Veuillez installer cette extension ",
   noExtensionAvailable: "Pas d'extension Chrome disponible pour le screenshare.",
   microphoneOff: "Votre microphone est muet.",
   microphoneOn: "Votre microphone est activé.",
   cameraOn: "Votre caméra est activée.",
   cameraOff: "Votre caméra est désactivée.",
   recordConferenceStart: "Votre conference est enregistrée.",
   recordConferenceStop: "Votre conference n'est plus enregistrée.",
   screenshareInProgress: "Un partage d'écran est déjà en cours."
 }
});

export class Actions {

    static initialize(consumerKey, consumerSecret, userInfo) {
        return dispatch => {
            return this._initializeListeners(dispatch)
                .then(() => Sdk.instance.userId || Sdk.instance.initialize(consumerKey, consumerSecret, userInfo))
                .then(userId => dispatch(this._sdkInitializedSuccessful(userId)))
                .catch(err => { this._throwErrorModal(err) })
        }
    }

    static initializeWithToken(token, userInfo, refreshTokenCallback) {
        return dispatch => {
            return this._initializeListeners(dispatch)
                .then(() => Sdk.instance.userId || Sdk.instance.initializeToken(token, userInfo, () => {
                   return refreshTokenCallback();
                }))
                .then(userId => dispatch(this._sdkInitializedSuccessful(userId)))
                .catch(err => { this._throwErrorModal(err) })
        }
    }



    static _throwErrorModal(err) {
      return dispatch => {
        dispatch(ErrorActions.onError(err))
        dispatch(ControlsActions.toggleModal())
      }
    }


    static subscribeConference(conferenceAlias) {
        return dispatch => {
            return Sdk.instance.subscribeConferenceStatus(conferenceAlias)
                .then(res => {
                  this._conferenceConnecting()
                })
                .catch(err => { this._throwErrorModal(err) })
        }
    }

    static joinExternalLive(url) {
        return (dispatch, getState) => {
            return Sdk.instance.liveStreaming.start({uri: url})
            .then(res => {
              // CAN SET "IS LIVE" TO WIDGET, ICON ?
            })
            .catch(err => { this._throwErrorModal(err) })
        }
    }

    static stopExternalLive(url) {
        return (dispatch, getState) => {
            return Sdk.instance.liveStreaming.stop()
            .then(res => {
              // CAN SET "IS LIVE" TO WIDGET, ICON ?
            })
            .catch(err => { this._throwErrorModal(err) })
        }
    }

    static joinDemo() {
        return (dispatch, getState) => {
            dispatch(ParticipantActions.clearParticipantsList())
            dispatch(this._conferenceConnecting())
            const { voxeet: { participants } } = getState()
            return Sdk.instance.createDemoConference()
            .then(function(res) {
                if (Sdk.instance.extensions.hasElectron()) {
                  dispatch(ConferenceActions.hasElectron())
                } else {
                  dispatch(ConferenceActions._conferenceJoined());
                  dispatch(ParticipantActions.saveCurrentUser("Me", "https://gravatar.com/avatar/" + Math.floor(Math.random() * 1000000) + "?s=200&d=identicon", "123456"));
                  dispatch(ControlsActions.toggleWidget())
                  dispatch(ParticipantActions.triggerHandleOnConnect());
                }
            })
        }
    }

    static join(conferenceAlias, isAdmin, constraints, liveRecordingEnabled, ttl, rtcpmode, mode, videoCodec, userInfoRaw, videoRatio, isElectron) {
        return (dispatch, getState) => {
            dispatch(ParticipantActions.clearParticipantsList())
            dispatch(this._conferenceConnecting())
            const { voxeet: { participants } } = getState()
            let userInfo = {
              name: userInfoRaw.name,
              externalId: userInfoRaw.externalId,
              avatarUrl: userInfoRaw.avatarUrl,
              params : {
                admin: isAdmin
              }
            }

            if (participants.isWebinar && !isAdmin) {
              constraints.video = false
              constraints.audio = false
            }

              Sdk.instance.enumerateVideoDevices()
                .then((devices) => {
                   if (devices.length == 0) {
                     constraints.video = false
                   }
              });
              Sdk.instance.enumerateAudioDevices()
                .then((devices) => {
                   if (devices.length == 0) {
                     constraints.audio = false
                   }
              });

              if (constraints.video && videoRatio != null) {
                constraints.video = videoRatio
              }

            return Sdk.instance.createConference({alias: conferenceAlias, params : { liveRecording: liveRecordingEnabled, ttl: ttl, stats: 'true', rtcpmode: rtcpmode, mode: mode, videoCodec: videoCodec }})
              .then(function(data) {
                    return Sdk.instance.joinConference(data.conferenceId, {
                        constraints,
                        'audio3D': (isElectron ? true : false),
                        user : userInfo,
                    }).then(function(res) {
                        if (Sdk.instance.extensions.hasElectron()) {
                          dispatch(ConferenceActions.hasElectron())
                        } else {
                          dispatch(ConferenceActions._conferenceJoined(res.conferenceId));
                          dispatch(ParticipantActions.saveCurrentUser(userInfo.name, userInfo.avatarUrl, userInfo.externalId));
                          dispatch(ControlsActions.toggleWidget())
                          dispatch(ControlsActions.saveConstraints(constraints))
                          dispatch(ParticipantActions.triggerHandleOnConnect());
                          if (constraints.video) {
                            dispatch(ControlsActions.toggleVideo(true))
                          }
                        }
                    })
            })
            .catch(err => { this._throwErrorModal(err) })
        }
    }


    static joinWithConferenceId(conferenceId, constraints, userInfo, videoRatio, isElectron) {
        return (dispatch, getState) => {
            dispatch(ParticipantActions.clearParticipantsList())
            dispatch(this._conferenceConnecting())
            const { voxeet: { participants } } = getState()
            userInfo.params = {
                admin: participants.participants.length == 0 ? true : false
            }

            if (participants.participants.length > 0 && participants.isWebinar) {
              userInfo.type = 'listener';
            }

            if (constraints.video && videoRatio != null) {
              constraints.video = videoRatio
            }

            return Sdk.instance.joinConference(conferenceId, {
                constraints,
                'audio3D': (isElectron ? true : false),
                user : userInfo,
            }).then(function(res) {
                  dispatch(ConferenceActions._conferenceJoined(res.conferenceId))
                  dispatch(ParticipantActions.saveCurrentUser(userInfo.name, userInfo.avatarUrl, userInfo.externalId));
                  dispatch(ControlsActions.toggleWidget())
                  dispatch(ControlsActions.saveConstraints(constraints))
                  dispatch(ParticipantActions.triggerHandleOnConnect());
                  if (constraints.video) {
                    dispatch(ControlsActions.toggleVideo())
                  }
            })
            .catch(err => { this._throwErrorModal(err) })
          }
    }

    static replay(conferenceId, offset) {
        return dispatch => {

            dispatch(this._conferenceReplaying(conferenceId))
            dispatch(ParticipantActions.onParticipantSave())
            dispatch(ParticipantActions.clearParticipantsList())
            return Sdk.instance.replayConference(conferenceId, 0)
                .then(res => {
                    dispatch(ControlsActions.toggleWidget())
                    dispatch(ParticipantActions.triggerHandleOnConnect());
                    dispatch(this._conferenceJoined(res.conferenceId))
                })
                .catch(err => { this._throwErrorModal(err) })
        }
    }

    static hasElectron() {
      return {
          type: Types.CONFERENCE_ELECTRON
      }
    }


    static demo() {
      return {
          type: Types.CONFERENCE_DEMO
      }
    }

    static leave() {
        return dispatch => {
            return Sdk.instance.leaveConference()
                .then(() => {
                    dispatch(TimerActions.stopTime());
                    dispatch({
                        type: Types.CONFERENCE_LEAVE
                    })
                })
        }
    }

    static conferenceEnded() {
      return dispatch => {
        dispatch(TimerActions.stopTime());
        dispatch({
            type: Types.REPLAY_ENDED
        })
      }
    }

    static toggleMicrophone(userId) {
        return (dispatch, getState) => {
            if (!userId) userId = Sdk.instance.userId
            const status = Sdk.instance.toggleMute(userId)
            const {
                voxeet: {
                    controls
                }
            } = getState()
            if (userId === Sdk.instance.userId) {
                dispatch(OnBoardingMessageActions.onBoardingDisplay(controls.isMuted ? strings.microphoneOn : strings.microphoneOff, 1000))
                return dispatch(ControlsActions.toggleMicrophone())
            }
            return dispatch(ParticipantActions.onToogleMicrophone(userId, status))
        }
    }

    static toggleAudio3D(audio3DEnabled) {
        return dispatch => {
          return Sdk.instance.conference.rtc.enable3DAudio(audio3DEnabled)
              .then(() => { dispatch(ControlsActions.toggleAudio3D())})
        }
    }

    static toggleVideo(videoStarted) {
        return (dispatch, getState) => {
            const {
                voxeet: {
                    controls
                }
            } = getState()
            if (!videoStarted) {
                dispatch(ControlsActions.toggleVideo(true))
                if (controls.videoRatio) {
                  dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.cameraOn, 1000))
                  return Sdk.instance.startVideoForUser(Sdk.instance.userId, controls.videoRatio)
                    .catch(err => { this._throwErrorModal(err) })
                } else {
                  dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.cameraOn, 1000))
                  return Sdk.instance.startVideoForUser(Sdk.instance.userId)
                    .catch(err => { this._throwErrorModal(err) })
                }

            } else {
                dispatch(ControlsActions.toggleVideo(false))
                dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.cameraOff, 1000))
                return Sdk.instance.stopVideoForUser(Sdk.instance.userId)
                    .catch(err => { this._throwErrorModal(err) })
            }
        }
    }

    static handleLeave() {
        return (dipatch, getState) => {
            const {
                voxeet: {
                    participants
                }
            } = getState()
            if (participants.handleOnLeave != null) participants.handleOnLeave()
        }
    }

    static toggleScreenShare(type) {
        return (dispatch, getState) => {
            const {
                voxeet: {
                    participants,
                    controls
                }
            } = getState()
            const enableScreenShare = !participants.screenShareEnabled
            if (!enableScreenShare && !controls.isScreenshare) {
              dispatch(OnBoardingMessageWithActionActions.onBoardingMessageWithAction(strings.screenshareInProgress, null, true))
            }
            if (enableScreenShare)
                return Sdk.instance.startScreenShare(type)
                .catch(err => {
                  console.log(err)
                  if (err.message == "Chrome Web Extension is not installed" && controls.chromeExtensionId != null) {
                    dispatch(OnBoardingMessageWithActionActions.onBoardingMessageWithAction(strings.installExtension , "https://chrome.google.com/webstore/detail/" + controls.chromeExtensionId))
                  } else if (err.message == "Chrome Web Extension is not installed" && controls.chromeExtensionId == null) {
                    dispatch(OnBoardingMessageWithActionActions.onBoardingMessageWithAction(strings.noExtensionAvailable, null, true))
                  } else if (err) {
                    dispatch(OnBoardingMessageWithActionActions.onBoardingMessageWithAction(err.message, null, true))
                  }
                })
            else
                return Sdk.instance.stopScreenShare()
        }
    }

    static sendBroadcastMessage(messageType, participant_id) {
      return (dispatch, getState) => {
        let userToKick = {}
        switch (messageType) {
            case BROADCAST_KICK:
                userToKick = {
                  "title": "Kick_Event",
                  "userId": participant_id
                }
                return Sdk.instance.sendConferenceMessage(userToKick).then(() => {}).catch(err => { this._throwErrorModal(err) })
                break;
            case WEBINAR_LIVE:
                userToKick = {
                  "title": "Webinar_Live",
                  "state": 1
                }
                const { voxeet: { conference } } = getState()
                if (conference.webinarLive) return Sdk.instance.sendConferenceMessage(userToKick).then(() => {console.log("BROADCAST MESSAGE SEND")}).catch(err => { this._throwErrorModal(err) })
                break;
            case BROADCAST_KICK_ADMIN_HANG_UP:
                userToKick = {
                  "title": "Kick_Admin_Hang_up",
                  "ownerId": Sdk.instance.userId
                }
                return Sdk.instance.sendConferenceMessage(userToKick).then(() => {
                }).catch(err => { this._throwErrorModal(err) })
                break;
            default:
                break;
          }
        }
    }

    static toggleRecording(conferenceId, isRecording) {
        return dispatch => {
            if (!isRecording) {
                return Sdk.instance.startRecording()
                    .then(() => {
                    sessionStorage.setItem('conferenceId', conferenceId);
                    window.dispatchEvent( new Event('storage') );
                    dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.recordConferenceStart, 1000))
                    dispatch(ControlsActions.toggleRecording())
                    })
                    .catch(err => { this._throwErrorModal(err) })
            } else {
                return Sdk.instance.stopRecording()
                    .then(() => {
                      dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.recordConferenceStop, 1000))
                      dispatch(ControlsActions.toggleRecording())
                    })
                    .catch(err => { this._throwErrorModal(err) })
            }
        }
    }


        static checkIfUpdateStatusUser(userId, status) {
          return (dispatch, getState) => {
              const { voxeet: { participants } } = getState()
              const index = participants.participants.findIndex(p => p.participant_id === userId)
              if (index != -1) {
                  const { voxeet: { participantsWaiting } } = getState()
                  const index = participantsWaiting.participants.findIndex(p => p.participant_id === userId)
                  dispatch(ParticipantActions.onParticipantStatusUpdated(userId, participantsWaiting.participants[index], status))
              }
              dispatch(ParticipantWaitingActions.onParticipantWaitingUpdated(userId, status))
          }
        }

        static checkIfUpdateUser(userId, stream) {
          return (dispatch, getState) => {
              const { voxeet: { participants } } = getState()
              const index = participants.participants.findIndex(p => p.participant_id === userId)
              if (index == -1) {
                const { voxeet: { participantsWaiting } } = getState()
                const index = participantsWaiting.participants.findIndex(p => p.participant_id === userId)
                dispatch(ParticipantActions.onParticipantStatusUpdated(userId, participantsWaiting.participants[index], "Connecting"))
              }
              dispatch(ParticipantActions.onParticipantUpdated(userId, stream))
          }
        }

        static checkIfUserJoined(userId, stream) {
          return (dispatch, getState) => {
              const { voxeet: { participants } } = getState()
              const index = participants.participants.findIndex(p => p.participant_id === userId)
              if (index == -1) {
                const { voxeet: { participantsWaiting } } = getState()
                const index = participantsWaiting.participants.findIndex(p => p.participant_id === userId)
                dispatch(ParticipantActions.onParticipantStatusUpdated(userId, participantsWaiting.participants[index], "Connecting"))
              }
              dispatch(ParticipantActions.onParticipantJoined(userId, stream))
          }
        }

        static _isWebinarMuted(userId) {
            return (dispatch, getState) => {
                const {
                    voxeet: {
                        conference,
                        participants
                    }
                } = getState()
                if (participants.isWebinar && !conference.webinarLive) Sdk.instance.muteUser(userId, true)
            }
        }

        static _isWebinarUnmuted() {
            return (dispatch, getState) => {
                const {
                    voxeet: {
                        participants
                    }
                } = getState()
                participants.participants.map((participant, i) => {
                  Sdk.instance.muteUser(participant.participant_id, false)
                })
            }
        }

    static _initializeListeners(dispatch) {
        return new Promise((resolve, reject) => {
              Sdk.instance.on('conferenceStatusUpdated', (status) => {
                  if (status.participants !== null) {
                    status.participants.map((el, i) => {
                          const participantInfo = {
                            userId: el.userId,
                            status: el.status,
                            avatarUrl: el.metadata.externalPhotoUrl,
                            isAdmin: (el.metadata.admin === 'true'),
                            name: el.metadata.externalName
                          }
                    })
                  }
                dispatch(this._conferenceStatusUpdated(status))
              })

            Sdk.instance.on('participantAdded', (userId, userInfo) => {
                dispatch(ParticipantWaitingActions.onParticipantWaitingAdded(userId, userInfo))
                dispatch(this.sendBroadcastMessage(WEBINAR_LIVE));
            })

            Sdk.instance.on('conferenceLeft', () => {
                dispatch(this.handleLeave())
                dispatch(ControlsActions.resetWidgetControls())
                dispatch(this.conferenceEnded())
                dispatch(ParticipantActions.clearParticipantsList())
                dispatch(ParticipantActions.onParticipantReset())
            })

            Sdk.instance.on('conferenceEnded', () => {
                dispatch(this.handleLeave())
                dispatch(this.conferenceEnded())
                dispatch(ControlsActions.resetWidgetControls())
                dispatch(ParticipantActions.clearParticipantsList())
                dispatch(ParticipantActions.onParticipantReset())
            })

            Sdk.instance.on('qualityIndicators', function(ind) {
              //console.log("MOS: ", ind.mos);
            });

            Sdk.instance.on('participantJoined', (userId, stream) => {
                dispatch(this._isWebinarMuted(userId))
                dispatch(this.checkIfUserJoined(userId, stream))
            })

            Sdk.instance.on('participantUpdated', (userId, stream) => {
                dispatch(this.checkIfUpdateUser(userId, stream))
            })

            Sdk.instance.on('participantLeft', (userId) => {
                dispatch(ParticipantWaitingActions.onParticipantWaitingLeft(userId))
                dispatch(ParticipantActions.onParticipantLeft(userId))
            })

            Sdk.instance.on('participantStatusUpdated', (userId, status) => {
                dispatch(this.checkIfUpdateStatusUser(userId, status))
            })

            Sdk.instance.on('screenShareStarted', (userId, stream) => {
                dispatch(ControlsActions.forceMode('speaker'))
                if (Sdk.instance.userId === userId) {
                  dispatch(ControlsActions.toggleScreenShareMode(true))
                }
                dispatch(ParticipantActions.onScreenShareStarted(userId, stream))
            })

            Sdk.instance.on('screenShareStopped', () => {
                dispatch(ParticipantActions.onScreenShareStopped())
                dispatch(ControlsActions.toggleScreenShareMode(false))
            })

            Sdk.instance.on('messageReceived', (data) => {
                const dataParsed = JSON.parse(data)
                switch (dataParsed.title) {
                    case BROADCAST_KICK:
                      if (Sdk.instance.userId === dataParsed.userId) {
                        dispatch(this.leave()).then(() => {
                          dispatch(ControlsActions.resetWidgetControls())
                        })
                      }
                      break;
                    case WEBINAR_LIVE:
                      dispatch(this._webinarIsLive())
                      dispatch(this._isWebinarUnmuted())
                      break;
                    case BROADCAST_KICK_ADMIN_HANG_UP:
                      if (Sdk.instance.userId != dataParsed.ownerId) {
                        dispatch(this.leave()).then(() => {
                          dispatch(ControlsActions.resetWidgetControls())
                        })
                      }
                      break;
                    default:
                      break;
                }
            })

            resolve();
        })
    }

    static _sdkInitializedSuccessful(userId) {
        return {
            type: Types.INITIALIZED_SUCCESS,
            payload: {
                userId
            }
        }
    }

    static _webinarIsLive() {
      return {
          type: Types.CONFERENCE_WEBINAR_LIVE
      }
    }

    static _conferenceStatusUpdated(status) {
        return {
            type: Types.CONFERENCE_STATUS_UPDATED,
            payload: {
                status
            }
        }
    }

    static _conferenceReplaying(conferenceReplayId) {
        return {
            type: Types.CONFERENCE_REPLAYING,
            payload: {
                conferenceReplayId
            }
        }
    }

    static _conferenceConnecting() {
        return {
            type: Types.CONFERENCE_CONNECTING
        }
    }

    static _conferenceJoined(conferenceId) {
        return {
            type: Types.CONFERENCE_JOINED,
            payload: {
                conferenceId
            }
        }
    }
}
