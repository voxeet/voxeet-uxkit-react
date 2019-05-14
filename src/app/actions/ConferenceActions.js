import Sdk from '../sdk'
import bowser from 'bowser'
import Cookies from 'js-cookie'
import { Actions as InputManagerActions } from './InputManagerActions'
import { Actions as ErrorActions } from './ErrorActions'
import { Actions as ControlsActions } from './ControlsActions'
import { Actions as ParticipantActions } from './ParticipantActions'
import { Actions as ConferenceActions } from './ConferenceActions'
import { Actions as FilePresentationActions } from './FilePresentationActions'
import { Actions as ChatActions } from './ChatActions'
import { Actions as ParticipantWaitingActions } from './ParticipantWaitingActions'
import { Actions as OnBoardingMessageActions } from './OnBoardingMessageActions'
import { Actions as OnBoardingMessageWithActionActions } from './OnBoardingMessageWithActionActions'
import { Actions as TimerActions } from './TimerActions'
import { strings } from '../languages/localizedStrings.js'
import { getOrganizedPosition, getRelativePosition } from './../libs/position'
import { STATUS_CONNECTING, STATUS_CONNECTED, STATUS_ON_AIR } from './../constants/ParticipantStatus'
import { BROADCAST_KICK, BROADCAST_KICK_ADMIN_HANG_UP, CHAT_MESSAGE, RECORDING_STATE } from './../constants/BroadcastMessageType'

export const Types = {
    INITIALIZED_SUCCESS: 'INITIALIZED_SUCCESS',
    CONFERENCE_CONNECTING: 'CONFERENCE_CONNECTING',
    CONFERENCE_REPLAYING: 'CONFERENCE_REPLAYING',
    CONFERENCE_JOINED: 'CONFERENCE_JOINED',
    CONFERENCE_DEMO: 'CONFERENCE_DEMO',
    CONFERENCE_ELECTRON: 'CONFERENCE_ELECTRON',
    INCREMENT_TIME: 'INCREMENT_TIME',
    CONFERENCE_LEAVE: 'CONFERENCE_LEAVE',
    REPLAY_ENDED: 'REPLAY_ENDED',
    CONFERENCE_STATUS_UPDATED: 'CONFERENCE_STATUS_UPDATED'
}

export class Actions {

    static initialize(consumerKey, consumerSecret, userInfo) {
        return dispatch => {
            return this._initializeListeners(dispatch)
                .then(() => Sdk.instance.userId || Sdk.instance.initialize(consumerKey, consumerSecret, userInfo).catch(err => { this._throwErrorModal(err) }))
                .then(userId => dispatch(this._sdkInitializedSuccessful(userId)))
                .catch(err => { dispatch(ErrorActions.onError(err)) })
        }
    }

    static initializeWithToken(token, refreshTokenCallback, userInfo) {
        return dispatch => {
            return this._initializeListeners(dispatch)
                .then(() => Sdk.instance.userId || Sdk.instance.initializeToken(token, userInfo, () => { return refreshTokenCallback() }).catch(err => { this._throwErrorModal(err) }))
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
              .then(res => {this._conferenceConnecting()})
              .catch(err => { this._throwErrorModal(err) })
        }
    }

    static startFilePresentation(file) {
      return dispatch => {
        return Sdk.instance.startFilePresentation(file)
          .catch(err => { this._throwErrorModal(err) })
      } 
    }

    static stopFilePresentation() {
      return (dispatch, getState) => {
        const { voxeet: { filePresentation } } = getState()
        return Sdk.instance.stopFilePresentation(filePresentation.filePresentationId)
          .catch(err => { this._throwErrorModal(err) })
      } 
    }

    static updateFilePresentation(filePresentationId, position) {
      return dispatch => {
        return Sdk.instance.updateFilePresentation(filePresentationId, position)
          .catch(err => { this._throwErrorModal(err) })
      } 
    }

    static convertFile(file) {
      return dispatch => {
        dispatch(FilePresentationActions.fileConvertStart())
        return Sdk.instance.convertFile(file)
          .catch(err => { dispatch(FilePresentationActions.fileConvertStop()) })
      } 
    }

    static joinExternalLive(url) {
        return (dispatch, getState) => {
            return Sdk.instance.liveStreaming.start({uri: url})
              .then(res => {})
              .catch(err => { this._throwErrorModal(err) })
        }
    }

    static stopExternalLive(url) {
        return (dispatch, getState) => {
            return Sdk.instance.liveStreaming.stop()
              .then(res => { })
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

    static join(conferenceAlias, isAdmin, constraints, liveRecordingEnabled, ttl, rtcpmode, mode, videoCodec, userInfoRaw, videoRatio, isElectron, isListener, preConfigPayload) {
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

            if (isListener || (participants.isWebinar && !isAdmin)) {
              return Sdk.instance.listenConference(conferenceAlias)
              .then(function(res) {
                if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
                  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                }
                dispatch(ParticipantActions.saveCurrentUser(userInfo.name, userInfo.avatarUrl, userInfo.externalId));
                dispatch(ConferenceActions._conferenceJoined(res.conferenceId, res.conferencePincode));
                dispatch(ControlsActions.toggleWidget())
                dispatch(ParticipantActions.triggerHandleOnConnect());
              })
            }

            if (preConfigPayload == null && !bowser.msie && !participants.isWebinar) {
                let videoCookieExist = false
                Sdk.instance.enumerateVideoDevices()
                  .then((devices) => {
                    devices.forEach(source => {
                      if (Cookies.get('camera') == source.deviceId) videoCookieExist = true
                    })
                    if (devices.length == 0) {
                      constraints.video = false
                    } else {
                      if (!videoCookieExist) {
                          var date = new Date();
                          date.setDate(date.getDate() + 365);
                          Cookies.set('camera', devices[0].deviceId, { path: '/', expires: date });
                          dispatch(InputManagerActions.inputVideoChange(devices[0].deviceId))
                          if (constraints.video) {
                            if (videoRatio != null) {
                              constraints.video = { height: videoRatio.height, width: videoRatio.width, deviceId :{ exact:  devices[0].deviceId} }
                            } else {
                              constraints.video = { deviceId :{ exact:  devices[0].deviceId} }
                            }
                          }
                      } else {
                          if (constraints.video) {
                            if (videoRatio != null) {
                              constraints.video = { height: videoRatio.height, width: videoRatio.width, deviceId :{ exact: Cookies.get('camera')} }
                            } else {
                              constraints.video = { deviceId :{ exact: Cookies.get('camera')} }
                            }
                          }
                          dispatch(InputManagerActions.inputVideoChange(Cookies.get('camera')))
                      }
                    }


                });
                if (constraints.audio) {
                  let inputCookieExist = false
                  Sdk.instance.enumerateAudioDevices()
                    .then((devices) => {
                      devices.forEach(source => {
                        if (Cookies.get('input') == source.deviceId) inputCookieExist = true
                      })
                      if (devices.length == 0) {
                        constraints.audio = false
                      } else {
                        if (!inputCookieExist) {
                          constraints.audio = true
                          dispatch(InputManagerActions.inputAudioChange(devices[0].deviceId))
                        } else {
                          constraints.audio = { deviceId :{ exact: Cookies.get('input')} }
                          dispatch(InputManagerActions.inputAudioChange(Cookies.get('input')))
                        }
                      }
                  });
                }
            } else {
              if (preConfigPayload && preConfigPayload.videoEnabled) {
                if (videoRatio != null) {
                  constraints.video = { height: videoRatio.height, width: videoRatio.width, deviceId :{ exact:  preConfigPayload.videoDeviceSelected} }
                } else {
                  constraints.video = { deviceId :{ exact:  preConfigPayload.videoDeviceSelected} }
                }
              } else if (preConfigPayload) {
                constraints.video = false
              }
              if (preConfigPayload && preConfigPayload.audioDeviceSelected && constraints.audio) constraints.audio = { deviceId :{ exact:  preConfigPayload.audioDeviceSelected} }
            }

            if (constraints.video && videoRatio != null && preConfigPayload == null) {
              constraints.video = videoRatio
            }
            return Sdk.instance.createConference({alias: conferenceAlias, params : { liveRecording: liveRecordingEnabled, ttl: ttl, stats: 'true', rtcpmode: rtcpmode, mode: mode, videoCodec: videoCodec }})
              .then((data) => {
                    return Sdk.instance.joinConference(data.conferenceId, {
                        constraints,
                        audio3D: (isElectron ? true : false),
                        user : userInfo,
                    })
                    .then((res) => {
                        if (Sdk.instance.extensions.hasElectron()) {
                          dispatch(ConferenceActions.hasElectron())
                        } else {
                          dispatch(ParticipantActions.saveCurrentUser(userInfo.name, userInfo.avatarUrl, userInfo.externalId));
                          dispatch(ConferenceActions._conferenceJoined(res.conferenceId, res.conferencePincode));
                          dispatch(ControlsActions.toggleWidget())
                          dispatch(ControlsActions.saveConstraints(constraints))
                          dispatch(ParticipantActions.triggerHandleOnConnect());
                          if (res.recordingStatus == "RECORDING") {
                            dispatch(ControlsActions.lockRecording())
                            dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.recordConferenceStart, 1000))
                          }
                          if (constraints.video) {
                            dispatch(ControlsActions.toggleVideo(true))
                          }
                          if (!constraints.audio) dispatch(ControlsActions.toggleAudio(false))
                          if (bowser.chrome) {
                            if (preConfigPayload != null) {
                              if (preConfigPayload.outputDeviceSelected) Sdk.instance.selectAudioOutput(preConfigPayload.outputDeviceSelected).catch(err => {console.log(err)})
                            } else {
                              let outputCookieExist = false
                              Sdk.instance.enumerateAudioDevices("output").then((devices) => {
                                  devices.map((source, i) => {
                                    if (Cookies.get('output') == source.deviceId) outputCookieExist = true
                                  })
                                  if (!outputCookieExist) {
                                    var date = new Date();
                                    date.setDate(date.getDate() + 365);
                                    Cookies.set('output', devices[0].deviceId, { path: '/', expires: date });
                                    dispatch(InputManagerActions.outputAudioChange(devices[0].deviceId))
                                  } else {
                                    dispatch(InputManagerActions.outputAudioChange(Cookies.get('output')))
                                  }
                              })
                            }
                          }
                        }
                    }).catch(err => { console.log(err);dispatch(ErrorActions.onError(err)) })
            })
            .catch(err => { console.log(err);dispatch(ErrorActions.onError(err)) })
        }
    }


    static joinWithConferenceId(conferenceId, constraints, userInfo, videoRatio, isElectron, isListener, preConfigPayload) {
        return (dispatch, getState) => {
            dispatch(ParticipantActions.clearParticipantsList())
            dispatch(this._conferenceConnecting())
            const { voxeet: { participants } } = getState()
            userInfo.params = {
                admin: participants.participants.length == 0 ? true : false
            }

            if (participants.isWebinar && !isAdmin) {
                constraints.video = false
                constraints.audio = false
            }

            if (isListener) {
              return Sdk.instance.listenConference(conferenceId)
              .then(function(res) {
                dispatch(ParticipantActions.saveCurrentUser(userInfo.name, userInfo.avatarUrl, userInfo.externalId));
                dispatch(ConferenceActions._conferenceJoined(res.conferenceId, res.conferencePincode));
                dispatch(ControlsActions.toggleWidget())
                dispatch(ParticipantActions.triggerHandleOnConnect());
              })
            }
  
            if (preConfigPayload == null && !bowser.msie) {
              let videoCookieExist = false
              Sdk.instance.enumerateVideoDevices()
                .then((devices) => {
                  devices.forEach(source => {
                    if (Cookies.get('camera') == source.deviceId) videoCookieExist = true
                  })
                  if (devices.length == 0) {
                    constraints.video = false
                  } else {
                    if (!videoCookieExist) {
                        var date = new Date();
                        date.setDate(date.getDate() + 365);
                        Cookies.set('camera', devices[0].deviceId, { path: '/', expires: date });
                        dispatch(InputManagerActions.inputVideoChange(devices[0].deviceId))
                        if (constraints.video) {
                          if (videoRatio != null) {
                            constraints.video = { height: videoRatio.height, width: videoRatio.width, deviceId :{ exact:  devices[0].deviceId} }
                          } else {
                            constraints.video = { deviceId :{ exact:  devices[0].deviceId} }
                          }
                        }
                    } else {
                        if (constraints.video) {
                          if (videoRatio != null) {
                            constraints.video = { height: videoRatio.height, width: videoRatio.width, deviceId :{ exact: Cookies.get('camera')} }
                          } else {
                            constraints.video = { deviceId :{ exact: Cookies.get('camera')} }
                          }
                        }
                        dispatch(InputManagerActions.inputVideoChange(Cookies.get('camera')))
                    }
                  }


              });
              if (constraints.audio) {
                let inputCookieExist = false
                Sdk.instance.enumerateAudioDevices()
                  .then((devices) => {
                    devices.forEach(source => {
                      if (Cookies.get('input') == source.deviceId) inputCookieExist = true
                    })
                    if (devices.length == 0) {
                      constraints.audio = false
                    } else {
                      if (!inputCookieExist) {
                        constraints.audio = true
                        dispatch(InputManagerActions.inputAudioChange(devices[0].deviceId))
                      } else {
                        constraints.audio = { deviceId :{ exact: Cookies.get('input')} }
                        dispatch(InputManagerActions.inputAudioChange(Cookies.get('input')))
                      }
                    }
                });
              }
            } else {
              if (preConfigPayload.videoEnabled) {
                if (videoRatio != null) {
                  constraints.video = { height: videoRatio.height, width: videoRatio.width, deviceId :{ exact:  preConfigPayload.videoDeviceSelected} }
                } else {
                  constraints.video = { deviceId :{ exact:  preConfigPayload.videoDeviceSelected} }
                }
              }
              if (preConfigPayload.audioDeviceSelected) constraints.audio = { deviceId :{ exact:  preConfigPayload.audioDeviceSelected} }
            }

            if (constraints.video && videoRatio != null && preConfigPayload == null) {
              constraints.video = videoRatio
            }

            return Sdk.instance.joinConference(conferenceId, {
                constraints,
                'audio3D': (isElectron ? true : false),
                user : userInfo,
            }).then(function(res) {
                  dispatch(ParticipantActions.saveCurrentUser(userInfo.name, userInfo.avatarUrl, userInfo.externalId));
                  dispatch(ConferenceActions._conferenceJoined(res.conferenceId, res.conferencePinCode))
                  dispatch(ControlsActions.toggleWidget())
                  dispatch(ControlsActions.saveConstraints(constraints))
                  dispatch(ParticipantActions.triggerHandleOnConnect());
                  if (res.recordingStatus == "RECORDING") {
                    dispatch(ControlsActions.lockRecording())
                    dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.recordConferenceStart, 1000))
                  }
                  if (bowser.chrome) {
                    if (preConfigPayload != null) {
                      if (preConfigPayload.outputDeviceSelected) Sdk.instance.selectAudioOutput(preConfigPayload.outputDeviceSelected).catch(err => {console.log(err)})
                    } else {
                      let outputCookieExist = false
                      Sdk.instance.enumerateAudioDevices("output").then((devices) => {
                          devices.map((source, i) => {
                            if (Cookies.get('output') == source.deviceId) outputCookieExist = true
                          })
                          if (!outputCookieExist) {
                            var date = new Date();
                            date.setDate(date.getDate() + 365);
                            Cookies.set('output', devices[0].deviceId, { path: '/', expires: date });
                            dispatch(InputManagerActions.outputAudioChange(devices[0].deviceId))
                          } else {
                            dispatch(InputManagerActions.outputAudioChange(Cookies.get('output')))
                          }
                      })
                    }
                  }
                  if (constraints.video) {
                    dispatch(ControlsActions.toggleVideo())
                  }
                  if (!constraints.audio) dispatch(ControlsActions.toggleAudio(false))
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
                  Sdk.instance.closeSession().then(() => {
                    Sdk.destroy()
                    dispatch(TimerActions.stopTime());
                    dispatch({
                        type: Types.CONFERENCE_LEAVE
                    })
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
            const {
                voxeet: {
                    controls
                }
            } = getState()

            let status = false
            if (!controls.audioEnabled) {
              let inputCookieExist = false
              let constraints = { audio: true }
              if (!bowser.msie) {
                Sdk.instance.enumerateAudioDevices()
                  .then((devices) => {
                    devices.forEach(source => {
                      if (Cookies.get('input') == source.deviceId) inputCookieExist = true
                    })
                    if (!inputCookieExist) {
                      constraints.audio = true
                      dispatch(InputManagerActions.inputAudioChange(devices[0].deviceId))
                    } else {
                      constraints.audio = { deviceId :{ exact: Cookies.get('input')} }
                      dispatch(InputManagerActions.inputAudioChange(Cookies.get('input')))
                    }
                    status = Sdk.instance.startAudioForUser(Sdk.instance.userId, constraints).then(() => {
                      dispatch(ControlsActions.toggleAudio(true))
                    })
                })
              } else {
                status = Sdk.instance.startAudioForUser(Sdk.instance.userId, constraints).then(() => {
                  dispatch(ControlsActions.toggleAudio(true))
                })
              }
            } else {
              status = Sdk.instance.toggleMute(userId)
            }

            if (userId === Sdk.instance.userId) {
                dispatch(OnBoardingMessageActions.onBoardingDisplay(controls.isMuted ? strings.microphoneOn : strings.microphoneOff, 1000))
                if (controls.audioEnabled) {
                  return dispatch(ControlsActions.toggleMicrophone())
                }
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
                    controls,
                    inputManager
                }
            } = getState()
            if (!videoStarted) {
                if (controls.videoRatio) {
                    const payloadConstraints = {
                        width: controls.videoRatio.width,
                        height: controls.videoRatio.height,
                        deviceId: inputManager.currentVideoDevice
                    }
                    dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.cameraOn, 1000))
                    return Sdk.instance.startVideoForUser(Sdk.instance.userId, payloadConstraints)
                        .then (() => { dispatch(ControlsActions.toggleVideo(true)) })
                        .catch(err => { this._throwErrorModal(err) })
                } else {
                    const payloadConstraints = {
                        deviceId: inputManager.currentVideoDevice
                    }
                    dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.cameraOn, 1000))
                    return Sdk.instance.startVideoForUser(Sdk.instance.userId, payloadConstraints)
                        .then (() => { dispatch(ControlsActions.toggleVideo(true)) })
                        .catch(err => { this._throwErrorModal(err) })
                }
            } else {
                dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.cameraOff, 1000))
                return Sdk.instance.stopVideoForUser(Sdk.instance.userId)
                    .then (() => { dispatch(ControlsActions.toggleVideo(false)) })
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
                  if (err.message == "Chrome Web Extension is not installed" && controls.chromeExtensionId != null) {
                    dispatch(OnBoardingMessageWithActionActions.onBoardingMessageWithAction(strings.installExtension , "https://chrome.google.com/webstore/detail/" + controls.chromeExtensionId + "."))
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

    static sendBroadcastMessage(messageType, participant_id, chat_payload) {
      return (dispatch, getState) => {
        let broadcastMessage = {}
        switch (messageType) {
            case BROADCAST_KICK:
            broadcastMessage = {
                    "title": "Kick_Event",
                    "userId": participant_id
                }
                return Sdk.instance.sendConferenceMessage(broadcastMessage).then(() => {}).catch(err => { this._throwErrorModal(err) })
                break;
            case RECORDING_STATE: 
                broadcastMessage = {
                    "title": "Recording_State",
                    "recordingRunning": chat_payload.recordingRunning,
                    "name": chat_payload.name,
                    "userId": chat_payload.userId
                }
                return Sdk.instance.sendConferenceMessage(broadcastMessage).then(() => {
                    dispatch()
                }).catch(err => { this._throwErrorModal(err) })
                break;
            case CHAT_MESSAGE:
            broadcastMessage = {
                    "title": "Chat_Message",
                    "content": chat_payload.content,
                    "type": chat_payload.type,
                    "avatarUrl": chat_payload.avatarUrl,
                    "time": chat_payload.time,
                    "name": chat_payload.name,
                    "ownerId": chat_payload.ownerId
                }
                return Sdk.instance.sendConferenceMessage(broadcastMessage).then(() => {
                    dispatch()
                }).catch(err => { this._throwErrorModal(err) })
                break;
            case BROADCAST_KICK_ADMIN_HANG_UP:
            broadcastMessage = {
                    "title": "Kick_Admin_Hang_up",
                    "ownerId": Sdk.instance.userId
                }
                return Sdk.instance.sendConferenceMessage(broadcastMessage).then(() => {
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

            Sdk.instance.on('fileConverted', (file) => {
              if (file.imageCount > 0) {
                dispatch(FilePresentationActions.fileConvertStop(file.fileId))
                dispatch(this.startFilePresentation(file))

                for (var i = 0; i < file.imageCount; i++) {
                  Sdk.instance.getThumbnail(file.fileId, i).then((thumbUrl) => {
                    dispatch(FilePresentationActions.addThumbnail(thumbUrl))
                  })
                }

              } else {
                dispatch(FilePresentationActions.fileConvertStop(null))
                dispatch(OnBoardingMessageWithActionActions.onBoardingMessageWithAction(strings.errorFilePresentation, null, true))
              }
            });

            Sdk.instance.on('filePresentationStarted', function(data) {
              dispatch(ControlsActions.forceMode('speaker'))
              if (Sdk.instance.userId === data.userId) {
                dispatch(ControlsActions.toggleFilePresentationMode(true))
              }
              dispatch(ParticipantActions.onFilePresentationStarted(data.userId))
              Sdk.instance.getImage(data.fileId, data.position).then((res) => {
                dispatch(FilePresentationActions.startFilePresentation(data.fileId, res, data.position, data.imageCount))
              })
            });
            
            Sdk.instance.on('filePresentationUpdated', function(data) {
              Sdk.instance.getImage(data.fileId, data.position).then((res) => {
                dispatch(FilePresentationActions.updateFilePresentation(data.position, res))
              })
            }); 
            
            Sdk.instance.on('filePresentationStopped', function() {
              dispatch(ParticipantActions.onFilePresentationStopped())
              dispatch(ControlsActions.toggleFilePresentationMode(false))
              dispatch(FilePresentationActions.stopFilePresentation())
            });

            Sdk.instance.on('participantJoined', (userId, stream) => {
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
                    case RECORDING_STATE: 
                      if (dataParsed.recordingRunning) {
                        dispatch(ControlsActions.lockRecording())
                        dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.recordConferenceStartBy + dataParsed.name + ".", 1000))
                      } else {
                        dispatch(ControlsActions.unlockRecording())
                        dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.recordConferenceStopBy + dataParsed.name + ".", 1000))
                      }
                      break;
                    case CHAT_MESSAGE:
                      dispatch(this._newBadgeMessage())
                      dispatch(ChatActions.addMessage(dataParsed))
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

    static _newBadgeMessage() {
        return (dispatch, getState) => {
            const {
                voxeet: {
                    controls
                }
            } = getState()
            if (!controls.displayAttendeesChat) dispatch(ChatActions.newBadgeMessage())
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

    static _conferenceJoined(conferenceId, conferencePincode) {
        return {
            type: Types.CONFERENCE_JOINED,
            payload: {
                conferenceId,
                conferencePincode
            }
        }
    }
}
