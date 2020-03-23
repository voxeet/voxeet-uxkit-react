import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import bowser from "bowser";
import Cookies from "js-cookie";
import { Actions as InputManagerActions } from "./InputManagerActions";
import { Actions as ErrorActions } from "./ErrorActions";
import { Actions as ControlsActions } from "./ControlsActions";
import { Actions as ParticipantActions } from "./ParticipantActions";
import { Actions as ConferenceActions } from "./ConferenceActions";
import { Actions as FilePresentationActions } from "./FilePresentationActions";
import { Actions as VideoPresentationActions } from "./VideoPresentationActions";
import { Actions as ChatActions } from "./ChatActions";
import { Actions as ParticipantWaitingActions } from "./ParticipantWaitingActions";
import { Actions as OnBoardingMessageActions } from "./OnBoardingMessageActions";
import { Actions as OnBoardingMessageWithActionActions } from "./OnBoardingMessageWithActionActions";
import { Actions as TimerActions } from "./TimerActions";
import { strings } from "../languages/localizedStrings.js";
import { getOrganizedPosition, getRelativePosition } from "./../libs/position";
import {
  STATUS_CONNECTING,
  STATUS_CONNECTED,
  STATUS_ON_AIR
} from "./../constants/ParticipantStatus";
import {
  BROADCAST_KICK,
  BROADCAST_KICK_ADMIN_HANG_UP,
  CHAT_MESSAGE,
  RECORDING_STATE
} from "./../constants/BroadcastMessageType";

export const Types = {
  INITIALIZED_SUCCESS: "INITIALIZED_SUCCESS",
  CONFERENCE_CONNECTING: "CONFERENCE_CONNECTING",
  CONFERENCE_REPLAYING: "CONFERENCE_REPLAYING",
  CONFERENCE_JOINED: "CONFERENCE_JOINED",
  CONFERENCE_DEMO: "CONFERENCE_DEMO",
  INCREMENT_TIME: "INCREMENT_TIME",
  CONFERENCE_LEAVE: "CONFERENCE_LEAVE",
  REPLAY_ENDED: "REPLAY_ENDED"
};

export class Actions {
  static initialize(consumerKey, consumerSecret) {
    return dispatch => {
      return this._initializeListeners(dispatch)
        .then(() => {
          VoxeetSDK.initialize(consumerKey, consumerSecret).catch(err => {
            this._throwErrorModal(err);
          });
        })
        .then(userId => {
          dispatch(this._sdkInitializedSuccessful(userId));
        })
        .catch(err => {
          dispatch(ErrorActions.onError(err));
        });
    };
  }

  static initializeWithToken(token, refreshTokenCallback, userInfo) {
    return dispatch => {
      return this._initializeListeners(dispatch)
        .then(() =>
          VoxeetSDK.initializeToken(token, userInfo, () => {
            return refreshTokenCallback();
          }).catch(err => {
            this._throwErrorModal(err);
          })
        )
        .then(userId => dispatch(this._sdkInitializedSuccessful(userId)))
        .catch(err => {
          this._throwErrorModal(err);
        });
    };
  }

  static _throwErrorModal(err) {
    return dispatch => {
      dispatch(ErrorActions.onError(err));
      dispatch(ControlsActions.toggleModal());
    };
  }

  static subscribeConference(conferenceAlias) {
    return dispatch => {
      return VoxeetSDK.subscribeConferenceStatus(conferenceAlias)
        .then(res => {
          this._conferenceConnecting();
        })
        .catch(err => {
          this._throwErrorModal(err);
        });
    };
  }

  static startFilePresentation(file) {
    return dispatch => {
      return VoxeetSDK.filePresentation.start(file).catch(err => {
        this._throwErrorModal(err);
      });
    };
  }

  static stopFilePresentation() {
    return (dispatch, getState) => {
      const {
        voxeet: { filePresentation }
      } = getState();
      return VoxeetSDK.filePresentation
        .stop(filePresentation.filePresentationId)
        .catch(err => {
          this._throwErrorModal(err);
        });
    };
  }

  static updateFilePresentation(filePresentationId, position) {
    return dispatch => {
      return VoxeetSDK.filePresentation.update(position).catch(err => {
        this._throwErrorModal(err);
      });
    };
  }

  static convertFile(file) {
    return dispatch => {
      dispatch(FilePresentationActions.fileConvertStart());
      return VoxeetSDK.filePresentation.convert(file).catch(err => {
        dispatch(FilePresentationActions.fileConvertStop());
      });
    };
  }

  static joinDemo() {
    return (dispatch, getState) => {
      dispatch(ParticipantActions.clearParticipantsList());
      dispatch(this._conferenceConnecting());
      const {
        voxeet: { participants }
      } = getState();
      return VoxeetSDK.createDemoConference().then(function(res) {
        if (VoxeetSDK.extensions.hasElectron()) {
          dispatch(ConferenceActions.hasElectron());
        } else {
          dispatch(
            ParticipantActions.saveCurrentUser(
              "Me",
              "https://gravatar.com/avatar/" +
                Math.floor(Math.random() * 1000000) +
                "?s=200&d=identicon",
              "123456"
            )
          );
          dispatch(ConferenceActions._conferenceJoined());
          dispatch(ControlsActions.toggleWidget());
          dispatch(ParticipantActions.triggerHandleOnConnect());
        }
      });
    };
  }

  static join(
    conferenceAlias,
    isAdmin,
    constraints,
    liveRecordingEnabled,
    ttl,
    rtcpmode,
    mode,
    videoCodec,
    userInfoRaw,
    videoRatio,
    isListener,
    preConfigPayload,
    autoRecording,
    autoHls,
    pinCode,
    simulcast
  ) {
    return (dispatch, getState) => {
      dispatch(ChatActions.clearMessages());
      dispatch(ParticipantActions.clearParticipantsList());
      dispatch(this._conferenceConnecting());
      const {
        voxeet: { participants }
      } = getState();
      let userInfo = {
        name: userInfoRaw.name,
        externalId: userInfoRaw.externalId,
        avatarUrl: userInfoRaw.avatarUrl
      };

      if (isListener || (participants.isWebinar && !isAdmin)) {
        return VoxeetSDK.session.open(userInfo).then(() => {
          return VoxeetSDK.conference
            .create({
              alias: conferenceAlias,
              params: {
                liveRecording: liveRecordingEnabled,
                ttl: ttl,
                stats: "true",
                rtcpMode: rtcpmode,
                mode: mode,
                videoCodec: videoCodec
              },
              pinCode: pinCode
            })
            .then(conference => {
              if ((participants.isWebinar && !isAdmin) || isListener) {
                return VoxeetSDK.conference
                  .listen(conference)
                  .then(function(res) {
                    dispatch(
                      ParticipantActions.saveCurrentUser(
                        userInfo.name,
                        userInfo.avatarUrl,
                        userInfo.externalId,
                        true
                      )
                    );
                    dispatch(
                      ConferenceActions._conferenceJoined(res.id, pinCode)
                    );
                    dispatch(ControlsActions.toggleWidget());
                    dispatch(ParticipantActions.triggerHandleOnConnect());
                  });
              } else {
                return VoxeetSDK.conference
                  .join(conference, {
                    constraints: { audio: false, video: false },
                    simulcast: simulcast
                  })
                  .then(function(res) {
                    if (
                      navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
                      navigator.userAgent.match(/AppleWebKit/)
                    ) {
                      navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: false
                      });
                    }
                    dispatch(
                      ParticipantActions.saveCurrentUser(
                        userInfo.name,
                        userInfo.avatarUrl,
                        userInfo.externalId,
                        true
                      )
                    );
                    dispatch(
                      ConferenceActions._conferenceJoined(res.id, pinCode)
                    );
                    dispatch(ControlsActions.toggleWidget());
                    dispatch(ParticipantActions.triggerHandleOnConnect());
                  });
              }
            });
        });
      }

      if (preConfigPayload == null && !bowser.msie && !participants.isWebinar) {
        let videoCookieExist = false;
        VoxeetSDK.mediaDevice.enumerateVideoDevices().then(devices => {
          devices.forEach(source => {
            if (Cookies.get("camera") == source.deviceId)
              videoCookieExist = true;
          });
          if (devices.length == 0) {
            constraints.video = false;
          } else {
            if (!videoCookieExist) {
              var date = new Date();
              date.setDate(date.getDate() + 365);
              Cookies.set("camera", devices[0].deviceId, {
                path: "/",
                expires: date
              });
              dispatch(
                InputManagerActions.inputVideoChange(devices[0].deviceId)
              );
              if (constraints.video) {
                if (videoRatio != null) {
                  constraints.video = {
                    height: videoRatio.height,
                    width: videoRatio.width,
                    deviceId: { exact: devices[0].deviceId }
                  };
                } else {
                  constraints.video = {
                    deviceId: { exact: devices[0].deviceId }
                  };
                }
              }
            } else {
              if (constraints.video) {
                if (videoRatio != null) {
                  constraints.video = {
                    height: videoRatio.height,
                    width: videoRatio.width,
                    deviceId: { exact: Cookies.get("camera") }
                  };
                } else {
                  constraints.video = {
                    deviceId: { exact: Cookies.get("camera") }
                  };
                }
              }
              dispatch(
                InputManagerActions.inputVideoChange(Cookies.get("camera"))
              );
            }
          }
        });
        if (constraints.audio) {
          let inputCookieExist = false;
          VoxeetSDK.mediaDevice.enumerateAudioDevices().then(devices => {
            devices.forEach(source => {
              if (Cookies.get("input") == source.deviceId)
                inputCookieExist = true;
            });
            if (devices.length == 0) {
              constraints.audio = false;
            } else {
              if (!inputCookieExist) {
                constraints.audio = true;
                dispatch(
                  InputManagerActions.inputAudioChange(devices[0].deviceId)
                );
              } else {
                constraints.audio = {
                  deviceId: { exact: Cookies.get("input") }
                };
                dispatch(
                  InputManagerActions.inputAudioChange(Cookies.get("input"))
                );
              }
            }
          });

          return VoxeetSDK.session.open(userInfo).then(() => {
            return VoxeetSDK.conference
              .create({
                alias: conferenceAlias,
                params: {
                  liveRecording: liveRecordingEnabled,
                  ttl: ttl,
                  stats: "true",
                  rtcpMode: rtcpmode,
                  mode: mode,
                  videoCodec: videoCodec
                },
                pinCode: pinCode
              })
              .then(conference => {
                return VoxeetSDK.conference
                  .join(conference, {
                    constraints,
                    simulcast: simulcast,
                    audio3D: false
                  })
                  .then(res => {
                    if (conference.isNew && autoHls) {
                      dispatch(ConferenceActions.startLiveHls());
                      dispatch(ControlsActions.toggleLiveHls());
                    }

                    dispatch(
                      ParticipantActions.saveCurrentUser(
                        userInfo.name,
                        userInfo.avatarUrl,
                        userInfo.externalId
                      )
                    );
                    dispatch(
                      ConferenceActions._conferenceJoined(res.id, pinCode)
                    );
                    dispatch(ControlsActions.toggleWidget());
                    dispatch(ControlsActions.saveConstraints(constraints));
                    dispatch(ParticipantActions.triggerHandleOnConnect());
                    if (res.recordingStatus == "RECORDING") {
                      dispatch(ControlsActions.lockRecording());
                      dispatch(
                        OnBoardingMessageActions.onBoardingDisplay(
                          strings.recordConferenceStart,
                          1000
                        )
                      );
                    } else if (autoRecording) {
                      dispatch(
                        ConferenceActions.toggleRecording(res.id, false)
                      );
                      dispatch(
                        ConferenceActions.sendBroadcastMessage(
                          RECORDING_STATE,
                          null,
                          {
                            name: userInfo.name,
                            userId: userInfo.participant_id,
                            recordingRunning: true
                          }
                        )
                      );
                    }
                    if (constraints.video) {
                      dispatch(ControlsActions.toggleVideo(true));
                    }
                    if (!constraints.audio)
                      dispatch(ControlsActions.toggleAudio(false));
                    if (bowser.chrome) {
                      if (preConfigPayload != null) {
                        if (preConfigPayload.outputDeviceSelected)
                          VoxeetSDK.mediaDevice
                            .selectAudioOutput(
                              preConfigPayload.outputDeviceSelected
                            )
                            .catch(err => {
                              console.log(err);
                            });
                      } else {
                        let outputCookieExist = false;
                        VoxeetSDK.mediaDevice
                          .enumerateAudioDevices("output")
                          .then(devices => {
                            devices.map((source, i) => {
                              if (Cookies.get("output") == source.deviceId)
                                outputCookieExist = true;
                            });
                            if (!outputCookieExist) {
                              var date = new Date();
                              date.setDate(date.getDate() + 365);
                              Cookies.set("output", devices[0].deviceId, {
                                path: "/",
                                expires: date
                              });
                              dispatch(
                                InputManagerActions.outputAudioChange(
                                  devices[0].deviceId
                                )
                              );
                            } else {
                              dispatch(
                                InputManagerActions.outputAudioChange(
                                  Cookies.get("output")
                                )
                              );
                            }
                          });
                      }
                    }
                    //}
                  })
                  .catch(err => {
                    console.log(err);
                    dispatch(ErrorActions.onError(err));
                  });
              })
              .catch(err => {
                console.log(err);
                dispatch(ErrorActions.onError(err));
              });
          });
        }
      } else {
        if (preConfigPayload && preConfigPayload.videoEnabled && !bowser.msie) {
          if (videoRatio != null) {
            constraints.video = {
              height: videoRatio.height,
              width: videoRatio.width,
              deviceId: { exact: preConfigPayload.videoDeviceSelected }
            };
          } else {
            constraints.video = {
              deviceId: { exact: preConfigPayload.videoDeviceSelected }
            };
          }
        } else if (preConfigPayload) {
          constraints.video = false;
        }
        if (
          preConfigPayload &&
          preConfigPayload.audioDeviceSelected &&
          constraints.audio
        )
          constraints.audio = {
            deviceId: { exact: preConfigPayload.audioDeviceSelected }
          };
      }

      if (constraints.video && videoRatio != null && preConfigPayload == null) {
        constraints.video = videoRatio;
      }
      if (bowser.msie) constraints.video = false;
      return VoxeetSDK.session.open(userInfo).then(() => {
        return VoxeetSDK.conference
          .create({
            alias: conferenceAlias,
            params: {
              liveRecording: liveRecordingEnabled,
              ttl: ttl,
              stats: "true",
              rtcpMode: rtcpmode,
              mode: mode,
              videoCodec: videoCodec
            },
            pinCode: pinCode
          })
          .then(conference => {
            return VoxeetSDK.conference
              .join(conference, {
                constraints,
                simulcast: simulcast,
                audio3D: false
              })
              .then(res => {
                if (conference.isNew && autoHls) {
                  dispatch(ConferenceActions.startLiveHls());
                  dispatch(ControlsActions.toggleLiveHls());
                }
                if (VoxeetSDK.extensions.hasElectron()) {
                  dispatch(ConferenceActions.hasElectron());
                } else {
                  dispatch(
                    ParticipantActions.saveCurrentUser(
                      userInfo.name,
                      userInfo.avatarUrl,
                      userInfo.externalId
                    )
                  );
                  dispatch(
                    ConferenceActions._conferenceJoined(res.id, pinCode)
                  );
                  dispatch(ControlsActions.toggleWidget());
                  dispatch(ControlsActions.saveConstraints(constraints));
                  dispatch(ParticipantActions.triggerHandleOnConnect());
                  if (res.recordingStatus == "RECORDING") {
                    dispatch(ControlsActions.lockRecording());
                    dispatch(
                      OnBoardingMessageActions.onBoardingDisplay(
                        strings.recordConferenceStart,
                        1000
                      )
                    );
                  } else if (autoRecording) {
                    dispatch(ConferenceActions.toggleRecording(res.id, false));
                    dispatch(
                      ConferenceActions.sendBroadcastMessage(
                        RECORDING_STATE,
                        null,
                        {
                          name: userInfo.name,
                          userId: userInfo.participant_id,
                          recordingRunning: true
                        }
                      )
                    );
                  }
                  if (constraints.video) {
                    dispatch(ControlsActions.toggleVideo(true));
                  }
                  if (!constraints.audio)
                    dispatch(ControlsActions.toggleAudio(false));
                  if (bowser.chrome) {
                    if (preConfigPayload != null) {
                      if (preConfigPayload.outputDeviceSelected)
                        VoxeetSDK.selectAudioOutput(
                          preConfigPayload.outputDeviceSelected
                        ).catch(err => {
                          console.log(err);
                        });
                    } else {
                      let outputCookieExist = false;
                      VoxeetSDK.mediaDevice
                        .enumerateAudioDevices("output")
                        .then(devices => {
                          devices.map((source, i) => {
                            if (Cookies.get("output") == source.deviceId)
                              outputCookieExist = true;
                          });
                          if (!outputCookieExist) {
                            var date = new Date();
                            date.setDate(date.getDate() + 365);
                            Cookies.set("output", devices[0].deviceId, {
                              path: "/",
                              expires: date
                            });
                            dispatch(
                              InputManagerActions.outputAudioChange(
                                devices[0].deviceId
                              )
                            );
                          } else {
                            dispatch(
                              InputManagerActions.outputAudioChange(
                                Cookies.get("output")
                              )
                            );
                          }
                        });
                    }
                  }
                }
              })
              .catch(err => {
                console.log(err);
                dispatch(ErrorActions.onError(err));
              });
          })
          .catch(err => {
            console.log(err);
            dispatch(ErrorActions.onError(err));
          });
      });
    };
  }

  static replay(conferenceId, offset) {
    return dispatch => {
      dispatch(this._conferenceReplaying(conferenceId));
      dispatch(ParticipantActions.onParticipantSave());
      dispatch(ParticipantActions.clearParticipantsList());
      return VoxeetSDK.replayConference(conferenceId, 0)
        .then(res => {
          dispatch(ControlsActions.toggleWidget());
          dispatch(ParticipantActions.triggerHandleOnConnect());
          dispatch(this._conferenceJoined(res.conferenceId));
        })
        .catch(err => {
          this._throwErrorModal(err);
        });
    };
  }

  static demo() {
    return {
      type: Types.CONFERENCE_DEMO
    };
  }

  static leave() {
    return (dispatch, getState) => {
      const {
        voxeet: { controls }
      } = getState();
      return VoxeetSDK.conference.leave().then(() => {
        dispatch(TimerActions.stopTime());
        dispatch(ConferenceActions._conferenceLeave());
        dispatch(ConferenceActions._conferenceLeave(controls.disableSounds));
        if (controls.closeSessionAtHangUp) {
          this._removeListeners().then(() => {
            VoxeetSDK.session.close().then(() => {
              Sdk.destroy();
            });
          });
        }
      });
    };
  }

  static conferenceEnded() {
    return dispatch => {
      dispatch(TimerActions.stopTime());
      dispatch({
        type: Types.REPLAY_ENDED
      });
    };
  }

  static toggleMicrophone(userId, isMuted) {
    return (dispatch, getState) => {
      const {
        voxeet: { controls }
      } = getState();
      let user = VoxeetSDK.session.participant;
      if (!userId) {
        userId = VoxeetSDK.session.participant.id;
        isMuted = controls.isMuted;
      } else {
        user = VoxeetSDK.conference.participants.get(userId);
      }
      if (!controls.audioEnabled) {
        let inputCookieExist = false;
        let constraints = { audio: true };
        if (!bowser.msie) {
          VoxeetSDK.mediaDevice.enumerateAudioDevices().then(devices => {
            devices.forEach(source => {
              if (Cookies.get("input") == source.deviceId)
                inputCookieExist = true;
            });
            if (!inputCookieExist) {
              constraints.audio = true;
              dispatch(
                InputManagerActions.inputAudioChange(devices[0].deviceId)
              );
            } else {
              constraints.audio = { deviceId: { exact: Cookies.get("input") } };
              dispatch(
                InputManagerActions.inputAudioChange(Cookies.get("input"))
              );
            }
            VoxeetSDK.startAudioForUser(
              VoxeetSDK.session.participant,
              constraints
            ).then(() => {
              dispatch(ControlsActions.toggleAudio(true));
            });
          });
        } else {
          VoxeetSDK.startAudioForUser(
            VoxeetSDK.session.participant,
            constraints
          ).then(() => {
            dispatch(ControlsActions.toggleAudio(true));
          });
        }
      } else {
        VoxeetSDK.conference.mute(user, isMuted ? false : true);
      }

      if (userId === VoxeetSDK.session.participant.id) {
        dispatch(
          OnBoardingMessageActions.onBoardingDisplay(
            controls.isMuted ? strings.microphoneOn : strings.microphoneOff,
            1000
          )
        );
        if (controls.audioEnabled) {
          return dispatch(ControlsActions.toggleMicrophone());
        }
      }
      return dispatch(ParticipantActions.onToogleMicrophone(userId));
    };
  }

  static toggleAudio3D(audio3DEnabled) {
    return dispatch => {
      return VoxeetSDK.conference.rtc.enable3DAudio(audio3DEnabled).then(() => {
        dispatch(ControlsActions.toggleAudio3D());
      });
    };
  }

  static toggleVideo(videoStarted) {
    return (dispatch, getState) => {
      const {
        voxeet: { controls, inputManager }
      } = getState();
      if (!videoStarted) {
        if (controls.videoRatio) {
          const payloadConstraints = {
            width: controls.videoRatio.width,
            height: controls.videoRatio.height,
            deviceId: inputManager.currentVideoDevice
          };
          return VoxeetSDK.conference
            .startVideo(VoxeetSDK.session.participant, payloadConstraints)
            .then(() => {
              dispatch(
                OnBoardingMessageActions.onBoardingDisplay(
                  strings.cameraOn,
                  1000
                )
              );
              dispatch(ControlsActions.toggleVideo(true));
            })
            .catch(err => {
              this._throwErrorModal(err);
            });
        } else {
          const payloadConstraints = {
            deviceId: inputManager.currentVideoDevice
          };
          return VoxeetSDK.conference
            .startVideo(VoxeetSDK.session.participant, payloadConstraints)
            .then(() => {
              dispatch(
                OnBoardingMessageActions.onBoardingDisplay(
                  strings.cameraOn,
                  1000
                )
              );
              dispatch(ControlsActions.toggleVideo(true));
            })
            .catch(err => {
              this._throwErrorModal(err);
            });
        }
      } else {
        return VoxeetSDK.conference
          .stopVideo(VoxeetSDK.session.participant)
          .then(() => {
            dispatch(ControlsActions.toggleVideo(false));
            dispatch(
              OnBoardingMessageActions.onBoardingDisplay(
                strings.cameraOff,
                1000
              )
            );
          })
          .catch(err => {
            this._throwErrorModal(err);
          });
      }
    };
  }

  static handleLeave() {
    return (dipatch, getState) => {
      const {
        voxeet: { participants }
      } = getState();
      if (participants.handleOnLeave != null) participants.handleOnLeave();
    };
  }

  static toggleVideoPresentation(url) {
    return (dispatch, getState) => {
      const {
        voxeet: { participants, controls }
      } = getState();
      const videoPresentationEnabled = !participants.videoPresentationEnabled;
      if (videoPresentationEnabled) {
        return VoxeetSDK.videoPresentation.start(url);
      } else {
        return VoxeetSDK.videoPresentation.stop();
      }
    };
  }

  static toggleScreenShare() {
    return (dispatch, getState) => {
      const {
        voxeet: { participants, controls }
      } = getState();
      const enableScreenShare = !participants.screenShareEnabled;
      if (!enableScreenShare && !controls.isScreenshare) {
        dispatch(
          OnBoardingMessageWithActionActions.onBoardingMessageWithAction(
            strings.screenshareInProgress,
            null,
            true
          )
        );
      }
      if (enableScreenShare)
        return VoxeetSDK.conference.startScreenShare().catch(err => {
          if (
            err.message == "Chrome Web Extension is not installed" &&
            controls.chromeExtensionId != null
          ) {
            dispatch(
              OnBoardingMessageWithActionActions.onBoardingMessageWithAction(
                strings.installExtension,
                "https://chrome.google.com/webstore/detail/" +
                  controls.chromeExtensionId +
                  "."
              )
            );
          } else if (
            err.message == "Chrome Web Extension is not installed" &&
            controls.chromeExtensionId == null
          ) {
            dispatch(
              OnBoardingMessageWithActionActions.onBoardingMessageWithAction(
                strings.noExtensionAvailable,
                null,
                true
              )
            );
          } else if (err) {
            dispatch(
              OnBoardingMessageWithActionActions.onBoardingMessageWithAction(
                err.message,
                null,
                true
              )
            );
          }
        });
      else return VoxeetSDK.conference.stopScreenShare();
    };
  }

  static sendBroadcastMessage(messageType, participant_id, chat_payload) {
    return (dispatch, getState) => {
      let broadcastMessage = {};
      switch (messageType) {
        case BROADCAST_KICK:
          broadcastMessage = {
            title: "Kick_Event",
            userId: participant_id
          };
          return VoxeetSDK.command
            .send(broadcastMessage)
            .then(() => {})
            .catch(err => {
              this._throwErrorModal(err);
            });
          break;
        case RECORDING_STATE:
          broadcastMessage = {
            title: "Recording_State",
            recordingRunning: chat_payload.recordingRunning,
            name: chat_payload.name,
            userId: chat_payload.userId
          };
          return VoxeetSDK.command
            .send(broadcastMessage)
            .then(() => {
              dispatch();
            })
            .catch(err => {
              this._throwErrorModal(err);
            });
          break;
        case CHAT_MESSAGE:
          broadcastMessage = {
            title: "Chat_Message",
            content: chat_payload.content,
            type: chat_payload.type,
            avatarUrl: chat_payload.avatarUrl,
            time: chat_payload.time,
            name: chat_payload.name,
            ownerId: chat_payload.ownerId
          };
          return VoxeetSDK.command
            .send(broadcastMessage)
            .then(() => {
              dispatch();
            })
            .catch(err => {
              this._throwErrorModal(err);
            });
          break;
        case BROADCAST_KICK_ADMIN_HANG_UP:
          broadcastMessage = {
            title: "Kick_Admin_Hang_up",
            ownerId: VoxeetSDK.session.participant.id
          };
          return VoxeetSDK.command
            .send(broadcastMessage)
            .then(() => {})
            .catch(err => {
              this._throwErrorModal(err);
            });
          break;
        default:
          break;
      }
    };
  }

  static toggleRecording(conferenceId, isRecording) {
    return dispatch => {
      if (!isRecording) {
        return VoxeetSDK.recording
          .start()
          .then(() => {
            sessionStorage.setItem("conferenceId", conferenceId);
            window.dispatchEvent(new Event("storage"));
            dispatch(
              OnBoardingMessageActions.onBoardingDisplay(
                strings.recordConferenceStart,
                1000
              )
            );
            dispatch(ControlsActions.toggleRecording());
          })
          .catch(err => {
            this._throwErrorModal(err);
          });
      } else {
        return VoxeetSDK.recording
          .stop()
          .then(() => {
            dispatch(
              OnBoardingMessageActions.onBoardingDisplay(
                strings.recordConferenceStop,
                1000
              )
            );
            dispatch(ControlsActions.toggleRecording());
          })
          .catch(err => {
            this._throwErrorModal(err);
          });
      }
    };
  }

  static checkIfUpdateStatusUser(userId, status) {
    return (dispatch, getState) => {
      const {
        voxeet: { participants }
      } = getState();
      const index = participants.participants.findIndex(
        p => p.participant_id === userId
      );
      if (index != -1) {
        const {
          voxeet: { participantsWaiting }
        } = getState();
        const index = participantsWaiting.participants.findIndex(
          p => p.participant_id === userId
        );
        dispatch(
          ParticipantActions.onParticipantStatusUpdated(
            userId,
            participantsWaiting.participants[index],
            status
          )
        );
      }
      dispatch(
        ParticipantWaitingActions.onParticipantWaitingStatusUpdated(
          userId,
          status
        )
      );
    };
  }

  static checkIfUpdateUser(userId, stream) {
    return (dispatch, getState) => {
      const {
        voxeet: { participants }
      } = getState();
      const index = participants.participants.findIndex(
        p => p.participant_id === userId
      );
      if (index != -1 || VoxeetSDK.session.participant.id == userId)
        dispatch(ParticipantActions.onParticipantUpdated(userId, stream));
    };
  }

  static checkIfUserJoined(userId, stream) {
    return (dispatch, getState) => {
      const {
        voxeet: { participants, controls }
      } = getState();
      const index = participants.participants.findIndex(
        p => p.participant_id === userId
      );
      if (index == -1) {
        const {
          voxeet: { participantsWaiting }
        } = getState();
        const index = participantsWaiting.participants.findIndex(
          p => p.participant_id === userId
        );
        dispatch(
          ParticipantActions.onParticipantStatusUpdated(
            userId,
            participantsWaiting.participants[index],
            "Connecting"
          )
        );
      }
      dispatch(
        ParticipantActions.onParticipantJoined(
          userId,
          stream,
          controls.disableSounds
        )
      );
    };
  }

  static _removeListeners(dispatch) {
    return new Promise((resolve, reject) => {
      VoxeetSDK.conference.removeAllListeners();
      VoxeetSDK.session.removeAllListeners();
      VoxeetSDK.videoPresentation.removeAllListeners();
      VoxeetSDK.filePresentation.removeAllListeners();
      VoxeetSDK.command.removeAllListeners();
    });
  }

  static _initializeListeners(dispatch) {
    return new Promise((resolve, reject) => {
      VoxeetSDK.conference.on("left", () => {
        dispatch(this.handleLeave());
        dispatch(ControlsActions.resetWidgetControls());
        dispatch(this.conferenceEnded());
        dispatch(ParticipantActions.clearParticipantsList());
        dispatch(ParticipantActions.onParticipantReset());
        dispatch(ParticipantWaitingActions.onParticipantWaitingReset());
      });

      VoxeetSDK.conference.on("ended", () => {
        dispatch(this.handleLeave());
        dispatch(this.conferenceEnded());
        dispatch(ControlsActions.resetWidgetControls());
        dispatch(ParticipantActions.clearParticipantsList());
        dispatch(ParticipantActions.onParticipantReset());
      });

      VoxeetSDK.filePresentation.on("converted", filePresentation => {
        if (filePresentation.imageCount > 0) {
          dispatch(
            FilePresentationActions.fileConvertStop(filePresentation.id)
          );
          dispatch(this.startFilePresentation(filePresentation));
        } else {
          dispatch(FilePresentationActions.fileConvertStop(null));
          dispatch(
            OnBoardingMessageWithActionActions.onBoardingMessageWithAction(
              strings.errorFilePresentation,
              null,
              true
            )
          );
        }
      });

      VoxeetSDK.filePresentation.on("started", filePresentation => {
        dispatch(ControlsActions.forceMode("speaker"));
        if (VoxeetSDK.session.participant.id === filePresentation.owner.id) {
          dispatch(ControlsActions.toggleFilePresentationMode(true));
        }

        for (var i = 0; i < filePresentation.imageCount; i++) {
          VoxeetSDK.filePresentation.thumbnail(i).then(thumbUrl => {
            dispatch(FilePresentationActions.addThumbnail(thumbUrl));
          });
        }
        dispatch(
          ParticipantActions.onFilePresentationStarted(
            filePresentation.owner.id
          )
        );
        VoxeetSDK.filePresentation
          .image(filePresentation.position)
          .then(res => {
            dispatch(
              FilePresentationActions.startFilePresentation(
                filePresentation.id,
                res,
                filePresentation.position,
                filePresentation.imageCount
              )
            );
          });
      });

      VoxeetSDK.filePresentation.on("updated", filePresentation => {
        VoxeetSDK.filePresentation
          .image(filePresentation.position)
          .then(res => {
            dispatch(
              FilePresentationActions.updateFilePresentation(
                filePresentation.position,
                res
              )
            );
          });
      });

      VoxeetSDK.filePresentation.on("stopped", () => {
        dispatch(ParticipantActions.onFilePresentationStopped());
        dispatch(ControlsActions.toggleFilePresentationMode(false));
        dispatch(FilePresentationActions.stopFilePresentation());
      });

      VoxeetSDK.conference.on("participantAdded", userInfo => {
        dispatch(
          ParticipantWaitingActions.onParticipantWaitingAdded(
            userInfo.id,
            userInfo
          )
        );
      });

      VoxeetSDK.conference.on("streamAdded", (user, stream) => {
        if (stream.type === "ScreenShare") {
          dispatch(ControlsActions.forceMode("speaker"));
          if (VoxeetSDK.session.participant.id === user.id) {
            dispatch(ControlsActions.toggleScreenShareMode(true));
          }
          dispatch(ParticipantActions.onScreenShareStarted(user.id, stream));
        } else {
          dispatch(
            ParticipantWaitingActions.onParticipantWaitingJoined(
              user.id,
              stream
            )
          );
          dispatch(this.checkIfUserJoined(user.id, stream));
        }
      });

      VoxeetSDK.conference.on("streamUpdated", (user, stream) => {
        dispatch(
          ParticipantWaitingActions.onParticipantWaitingUpdated(user.id, stream)
        );
        dispatch(this.checkIfUpdateUser(user.id, stream));
      });

      VoxeetSDK.conference.on("streamRemoved", (user, stream) => {
        if (stream.type === "ScreenShare") {
          dispatch(ParticipantActions.onScreenShareStopped());
          dispatch(ControlsActions.toggleScreenShareMode(false));
        } else {
          dispatch(ParticipantWaitingActions.onParticipantWaitingLeft(user.id));
          dispatch(ParticipantActions.onParticipantLeft(user.id));
        }
      });

      VoxeetSDK.videoPresentation.on("started", data => {
        dispatch(ControlsActions.forceMode("speaker"));
        if (VoxeetSDK.session.participant.id === data.ownerId) {
          dispatch(ControlsActions.toggleVideoPresentationMode(true));
        }
        dispatch(ParticipantActions.onVideoPresentationStarted(data.ownerId));
        dispatch(VideoPresentationActions.startVideoPresentation(data.url));
        setTimeout(() => {
          dispatch(VideoPresentationActions.seek(data.timestamp / 1000));
        }, 200);
      });

      VoxeetSDK.videoPresentation.on("stopped", data => {
        dispatch(ParticipantActions.onVideoPresentationStopped());
        dispatch(ControlsActions.toggleVideoPresentationMode(false));
        dispatch(VideoPresentationActions.stopVideoPresentation());
      });

      VoxeetSDK.videoPresentation.on("played", data => {
        if (VoxeetSDK.session.participant.id != data.ownerId) {
          dispatch(VideoPresentationActions.play());
          setTimeout(() => {
            dispatch(VideoPresentationActions.seek(data.timestamp / 1000));
          }, 200);
        }
      });

      VoxeetSDK.videoPresentation.on("paused", data => {
        if (VoxeetSDK.session.participant.id != data.ownerId) {
          dispatch(VideoPresentationActions.pause());
        }
      });

      VoxeetSDK.videoPresentation.on("seek", data => {
        if (VoxeetSDK.session.participant.id != data.ownerId) {
          dispatch(VideoPresentationActions.seek(data.timestamp / 1000));
        }
      });

      VoxeetSDK.command.on("received", (participant, message) => {
        const dataParsed = JSON.parse(message);
        switch (dataParsed.title) {
          case BROADCAST_KICK:
            if (VoxeetSDK.session.participant.id === dataParsed.userId) {
              dispatch(this.leave()).then(() => {
                dispatch(ControlsActions.resetWidgetControls());
              });
            }
            break;
          case RECORDING_STATE:
            if (dataParsed.recordingRunning) {
              dispatch(ControlsActions.lockRecording());
              dispatch(
                OnBoardingMessageActions.onBoardingDisplay(
                  strings.recordConferenceStartBy + dataParsed.name + ".",
                  1000
                )
              );
            } else {
              dispatch(ControlsActions.unlockRecording());
              dispatch(
                OnBoardingMessageActions.onBoardingDisplay(
                  strings.recordConferenceStopBy + dataParsed.name + ".",
                  1000
                )
              );
            }
            break;
          case CHAT_MESSAGE:
            dispatch(this._newBadgeMessage());
            dispatch(ChatActions.addMessage(dataParsed));
            break;
          case BROADCAST_KICK_ADMIN_HANG_UP:
            if (VoxeetSDK.session.participant.id != dataParsed.ownerId) {
              dispatch(this.leave()).then(() => {
                dispatch(ControlsActions.resetWidgetControls());
              });
            }
            break;
          default:
            break;
        }
      });

      resolve();
    });
  }

  static _sdkInitializedSuccessful(userId) {
    return {
      type: Types.INITIALIZED_SUCCESS,
      payload: {
        userId
      }
    };
  }

  static _newBadgeMessage() {
    return (dispatch, getState) => {
      const {
        voxeet: { controls }
      } = getState();
      if (!controls.displayAttendeesChat)
        dispatch(ChatActions.newBadgeMessage());
    };
  }

  static _conferenceReplaying(conferenceReplayId) {
    return {
      type: Types.CONFERENCE_REPLAYING,
      payload: {
        conferenceReplayId
      }
    };
  }

  static _conferenceConnecting() {
    return {
      type: Types.CONFERENCE_CONNECTING
    };
  }

  static _conferenceJoined(conferenceId, conferencePincode) {
    return {
      type: Types.CONFERENCE_JOINED,
      payload: {
        conferenceId,
        conferencePincode
      }
    };
  }

  static _conferenceLeave(disableSounds = true) {
    return {
      type: Types.CONFERENCE_LEAVE,
      payload: {
        disableSounds
      }
    };
  }
}
