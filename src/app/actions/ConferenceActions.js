import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import bowser from "bowser";
import Cookies from "./../libs/Storage";
import { Actions as InputManagerActions } from "./InputManagerActions";
import { Actions as ErrorActions } from "./ErrorActions";
import { Actions as ControlsActions } from "./ControlsActions";
import { Actions as ParticipantActions } from "./ParticipantActions";
import { Actions as ForwardedVideoActions } from "./ForwardedVideoActions";
import { Actions as ConferenceActions } from "./ConferenceActions";
import { Actions as FilePresentationActions } from "./FilePresentationActions";
import { Actions as VideoPresentationActions } from "./VideoPresentationActions";
import { Actions as ChatActions } from "./ChatActions";
import { Actions as ParticipantWaitingActions } from "./ParticipantWaitingActions";
import { Actions as OnBoardingMessageActions } from "./OnBoardingMessageActions";
import { Actions as OnBoardingMessageWithActionActions } from "./OnBoardingMessageWithActionActions";
import { Actions as OnBoardingMessageWithConfirmationActions } from "./OnBoardingMessageWithConfirmationActions";
import { Actions as TimerActions } from "./TimerActions";
import { strings } from "../languages/localizedStrings.js";
import { getVideoDeviceName } from "../libs/getVideoDeviceName";
import { isElectron, isIOS } from "../libs/browserDetection";
import Autolinker from "autolinker";
import {
  BROADCAST_KICK,
  BROADCAST_KICK_ADMIN_HANG_UP,
  CHAT_MESSAGE,
  RECORDING_STATE,
} from "../constants/BroadcastMessageType";
import { STATUS_CONNECTING } from "../constants/ParticipantStatus";
import {
  getVideoProcessorOptionsFromCache,
  VideoProcessorDefaultState,
} from "../components/videoProcessor/VideoProcessorUtils";

export const Types = {
  INITIALIZED_SUCCESS: "INITIALIZED_SUCCESS",
  CONFERENCE_CONNECTING: "CONFERENCE_CONNECTING",
  CONFERENCE_REPLAYING: "CONFERENCE_REPLAYING",
  CONFERENCE_JOINED: "CONFERENCE_JOINED",
  CONFERENCE_DEMO: "CONFERENCE_DEMO",
  INCREMENT_TIME: "INCREMENT_TIME",
  CONFERENCE_LEAVE: "CONFERENCE_LEAVE",
  REPLAY_ENDED: "REPLAY_ENDED",
};

export class Actions {
  static initialize(appKey, appSecret, options) {
    return (dispatch) => {
      return this._initializeListeners(dispatch, options)
        .then(() => {
          return (
            VoxeetSDK.session.participant ||
            VoxeetSDK.initialize(appKey, appSecret)
          );
        })
        .then((userId) => {
          dispatch(this._sdkInitializedSuccessful(userId));
        })
        .catch((err) => {
          dispatch(ErrorActions.onError(err));
        });
    };
  }

  static initializeWithToken(token, refreshTokenCallback, options) {
    return (dispatch) => {
      return this._initializeListeners(dispatch, options)
        .then(() => {
          return (
            VoxeetSDK.session.participant ||
            VoxeetSDK.initializeToken(token, () => {
              return refreshTokenCallback();
            })
          );
        })
        .then((userId) => dispatch(this._sdkInitializedSuccessful(userId)))
        .catch((err) => {
          this._throwErrorModal(err);
        });
    };
  }

  static _throwErrorModal(err) {
    return (dispatch) => {
      dispatch(ErrorActions.onError(err));
      dispatch(ControlsActions.toggleModal());
    };
  }

  static subscribeConference(conferenceAlias) {
    return (dispatch) => {
      return VoxeetSDK.subscribeConferenceStatus(conferenceAlias)
        .then((res) => {
          this._conferenceConnecting();
        })
        .catch((err) => {
          this._throwErrorModal(err);
        });
    };
  }

  static startFilePresentation(file) {
    return (dispatch) => {
      return VoxeetSDK.filePresentation.start(file).catch((err) => {
        this._throwErrorModal(err);
      });
    };
  }

  static stopFilePresentation() {
    return (dispatch, getState) => {
      const {
        voxeet: { filePresentation },
      } = getState();
      return VoxeetSDK.filePresentation
        .stop(filePresentation.filePresentationId)
        .catch((err) => {
          this._throwErrorModal(err);
        });
    };
  }

  static updateFilePresentation(filePresentationId, position) {
    return (dispatch) => {
      return VoxeetSDK.filePresentation.update(position).catch((err) => {
        this._throwErrorModal(err);
      });
    };
  }

  static convertFile(file) {
    return (dispatch) => {
      dispatch(FilePresentationActions.fileConvertStart());
      return VoxeetSDK.filePresentation.convert(file).catch((err) => {
        dispatch(FilePresentationActions.fileConvertStop());
      });
    };
  }

  static setAudioConstraints(constraints, dispatch) {
    let inputCookieExist = false;
    VoxeetSDK.mediaDevice.enumerateAudioInputDevices().then((devices) => {
      const device = Cookies.getDevice("input");
      if (device) {
        devices.forEach((source) => {
          if (device.deviceId == source.deviceId) inputCookieExist = true;
        });
      }
      if (devices.length == 0) {
        constraints.audio = false;
      } else {
        if (inputCookieExist) {
          constraints.audio = {
            deviceId: { exact: device.deviceId },
          };
          dispatch(InputManagerActions.inputAudioChange(device));
        }
      }
    });
    return constraints;
  }

  static setVideoConstraints(constraints, videoRatio, dispatch) {
    let videoCookieExist = false;
    VoxeetSDK.mediaDevice.enumerateVideoInputDevices().then((devices) => {
      const device = Cookies.getDevice("camera");
      if (device) {
        devices.forEach((source) => {
          if (device && device.deviceId === source.deviceId)
            videoCookieExist = true;
        });
      }

      if (
        devices.length === 0 ||
        (devices.length === 1 && devices[0]?.deviceId == "")
      ) {
        constraints.video = false;
      } else {
        if (videoCookieExist) {
          if (constraints.video) {
            if (videoRatio != null) {
              constraints.video = {
                height: videoRatio.height,
                width: videoRatio.width,
                deviceId: { exact: device.deviceId },
              };
            } else {
              constraints.video = {
                deviceId: { exact: device.deviceId },
              };
            }
          }
          getVideoDeviceName(device.deviceId).then((isBackCamera) => {
            dispatch(
              InputManagerActions.inputVideoChange(device, isBackCamera)
            );
          });
        }
      }
    });
    return constraints;
  }

  static setOutputAudio(dispatch) {
    let outputCookieExist = false;
    VoxeetSDK.mediaDevice.enumerateAudioOutputDevices().then((devices) => {
      const device = Cookies.getDevice("output");
      if (device) {
        devices.map((source, i) => {
          if (device.deviceId === source.deviceId) outputCookieExist = true;
        });
      }
      if (outputCookieExist) {
        VoxeetSDK.mediaDevice
          .selectAudioOutput(device.deviceId)
          .then(() => dispatch(InputManagerActions.outputAudioChange(device)))
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }

  static joinDemo(userInfoRaw, enableSpatialAudio) {
    return async (dispatch, getState) => {
      dispatch(ChatActions.clearMessages());
      dispatch(ParticipantActions.clearParticipantsList());
      dispatch(this._conferenceConnecting());
      const {
        voxeet: { participants },
      } = getState();
      let userInfo = {
        name: userInfoRaw.name,
        externalId: userInfoRaw.externalId,
        avatarUrl: userInfoRaw.avatarUrl,
      };
      if (!VoxeetSDK.session.participant) {
        await VoxeetSDK.session.open(userInfo);
      }
      return VoxeetSDK.conference
        .demo({ spatialAudio: enableSpatialAudio })
        .then(function (res) {
          dispatch(
            ParticipantActions.saveCurrentUser(
              "Me",
              "https://gravatar.com/avatar/" +
                Math.floor(Math.random() * 1000000) +
                "?s=200&d=identicon",
              "123456"
            )
          );
          dispatch(
            ParticipantActions.saveCurrentUser(
              userInfo.name,
              userInfo.avatarUrl,
              userInfo.externalId,
              true
            )
          );
          dispatch(
            ConferenceActions._conferenceJoined(
              res.id,
              "",
              res.params.dolbyVoice
            )
          );
          dispatch(ControlsActions.toggleWidget());
          dispatch(ControlsActions.setConferencePermissions(res.permissions));
          dispatch(ParticipantActions.triggerHandleOnConnect());
        });
    };
  }

  static setConstraintsWithPreconfigPayload(
    preConfigPayload,
    constraints,
    videoRatio
  ) {
    if (
      preConfigPayload &&
      preConfigPayload.videoEnabled &&
      preConfigPayload.videoDeviceSelected
    ) {
      if (videoRatio != null) {
        constraints.video = {
          height: videoRatio.height,
          width: videoRatio.width,
          deviceId: { exact: preConfigPayload.videoDeviceSelected.deviceId },
        };
      } else {
        constraints.video = {
          deviceId: { exact: preConfigPayload.videoDeviceSelected.deviceId },
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
        deviceId: { exact: preConfigPayload.audioDeviceSelected.deviceId },
      };
    return constraints;
  }

  static async setVirtualBackground(
    virtualBackgroundMode,
    videoEnabled,
    videoDenoise
  ) {
    if (videoEnabled) {
      if (isElectron()) {
        console.log(
          "About to set vb to selected",
          virtualBackgroundMode,
          VoxeetSDK.videoFilters
        );
        switch (virtualBackgroundMode) {
          case "bokeh":
          case "staticimage":
            await VoxeetSDK.videoFilters.setFilter(virtualBackgroundMode, {
              videoDenoise: videoDenoise,
            });
            break;
          default:
            await VoxeetSDK.videoFilters.setFilter("none", {
              videoDenoise: videoDenoise,
            });
        }
      } else {
        if (virtualBackgroundMode === "bokeh") {
          await VoxeetSDK.video.local.setProcessor({ type: "bokeh" });
        } else {
          await VoxeetSDK.video.local.disableProcessing();
        }
      }
    }
  }

  static join(
    conferenceAlias,
    isAdmin,
    constraints,
    liveRecordingEnabled,
    ttl,
    mode,
    videoCodec,
    userInfoRaw,
    videoRatio,
    isListener,
    preConfigPayload,
    autoRecording,
    pinCode,
    simulcast,
    enableDolbyVoice,
    maxVideoForwardingParam,
    chatOptions,
    dvwc,
    spatialAudio,
    virtualBackgroundModeSupported
  ) {
    let maxVideoForwarding =
      preConfigPayload && preConfigPayload.maxVideoForwarding !== undefined
        ? preConfigPayload.maxVideoForwarding
        : maxVideoForwardingParam;
    let virtualBackgroundMode =
      preConfigPayload && preConfigPayload.virtualBackgroundMode !== undefined
        ? preConfigPayload.virtualBackgroundMode
        : Cookies.get("virtualBackgroundMode");
    virtualBackgroundMode =
      ["none", "bokeh"].indexOf(virtualBackgroundMode) >= 0
        ? virtualBackgroundMode
        : "none";
    const videoDenoise =
      preConfigPayload && preConfigPayload.videoDenoise !== undefined
        ? preConfigPayload.videoDenoise
        : Cookies.get("videoDenoise");
    return async (dispatch, getState) => {
      let videoProcessorOptions =
        preConfigPayload?.videoProcessorOptions ??
        (await getVideoProcessorOptionsFromCache());
      // Video processing should be enabled only if at least one option is enabled.
      // When all options are off, video processing should be disabled to reduce CPU usage.
      if (
        videoProcessorOptions.virtualBackgroundId ===
          VideoProcessorDefaultState.VirtualBackgroundId &&
        videoProcessorOptions.facialSmoothingStrength ===
          VideoProcessorDefaultState.FacialSmoothingStrength &&
        videoProcessorOptions.spotLightStrength ===
          VideoProcessorDefaultState.SpotLightStrength &&
        videoProcessorOptions.autoFraming ===
          VideoProcessorDefaultState.AutoFraming &&
        videoProcessorOptions.noiseReduction ===
          VideoProcessorDefaultState.NoiseReduction &&
        videoProcessorOptions.autoBrightness ===
          VideoProcessorDefaultState.AutoBrightness
      ) {
        videoProcessorOptions = undefined;
      }
      dispatch(ChatActions.clearMessages());
      dispatch(ParticipantActions.clearParticipantsList());
      dispatch(this._conferenceConnecting());
      const {
        voxeet: { participants, controls },
      } = getState();
      let userInfo = {
        name: userInfoRaw.name,
        externalId: userInfoRaw.externalId,
        avatarUrl: userInfoRaw.avatarUrl,
      };
      if (!VoxeetSDK.session.participant) {
        await VoxeetSDK.session.open(userInfo);
      }

      if (isListener || (participants.isWebinar && !isAdmin)) {
        return VoxeetSDK.conference
          .create({
            alias: conferenceAlias,
            params: {
              liveRecording: liveRecordingEnabled,
              dolbyVoice: enableDolbyVoice,
              ttl: ttl,
              stats: "true",
              mode: mode,
              videoCodec: videoCodec,
            },
            pinCode: pinCode,
          })
          .then((conference) => {
            if ((participants.isWebinar && !isAdmin) || isListener) {
              return VoxeetSDK.conference
                .listen(conference)
                .then(function (res) {
                  dispatch(
                    ParticipantActions.saveCurrentUser(
                      userInfo.name,
                      userInfo.avatarUrl,
                      userInfo.externalId,
                      true
                    )
                  );
                  dispatch(
                    ConferenceActions._conferenceJoined(
                      res.id,
                      pinCode,
                      res.params.dolbyVoice
                    )
                  );
                  dispatch(ControlsActions.toggleWidget());
                  dispatch(
                    ControlsActions.setConferencePermissions(res.permissions)
                  );
                  dispatch(ParticipantActions.triggerHandleOnConnect());
                  if (VoxeetSDK.recording.current) {
                    dispatch(ControlsActions.lockRecording());
                    dispatch(
                      OnBoardingMessageActions.onBoardingDisplay(
                        strings.recordConferenceStart,
                        2000
                      )
                    );
                  }
                });
            } else {
              return VoxeetSDK.conference
                .join(conference, {
                  constraints: { audio: false, video: false },
                  simulcast: simulcast,
                  maxVideoForwarding: maxVideoForwarding,
                  dvwc: dvwc,
                  spatialAudio,
                })
                .then(function (res) {
                  if (isIOS() && navigator.userAgent.match(/AppleWebKit/)) {
                    navigator.mediaDevices.getUserMedia({
                      audio: true,
                      video: false,
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
                    ConferenceActions._conferenceJoined(
                      res.id,
                      pinCode,
                      res.params.dolbyVoice
                    )
                  );
                  dispatch(ControlsActions.toggleWidget());
                  dispatch(
                    ControlsActions.setConferencePermissions(res.permissions)
                  );
                  dispatch(ParticipantActions.triggerHandleOnConnect());
                  if (VoxeetSDK.recording.current) {
                    dispatch(ControlsActions.lockRecording());
                    dispatch(
                      OnBoardingMessageActions.onBoardingDisplay(
                        strings.recordConferenceStart,
                        2000
                      )
                    );
                  }
                });
            }
          });
      }

      if (preConfigPayload == null && !participants.isWebinar) {
        this.setVideoConstraints(constraints, videoRatio, dispatch);
        if (constraints.audio) {
          constraints = this.setAudioConstraints(constraints, dispatch);
          return VoxeetSDK.conference
            .create({
              alias: conferenceAlias,
              params: {
                liveRecording: liveRecordingEnabled,
                dolbyVoice: enableDolbyVoice,
                ttl: ttl,
                stats: "true",
                mode: mode,
                videoCodec: videoCodec,
              },
              pinCode: pinCode,
            })
            .then((conference) => {
              return VoxeetSDK.conference
                .join(conference, {
                  constraints,
                  simulcast: simulcast,
                  maxVideoForwarding: maxVideoForwarding,
                  videoFilter: virtualBackgroundMode,
                  videoFilterOptions: { videoDenoise: videoDenoise },
                  dvwc: dvwc,
                  spatialAudio,
                  videoProcessor: videoProcessorOptions,
                })
                .then((res) => {
                  dispatch(
                    ParticipantActions.saveCurrentUser(
                      userInfo.name,
                      userInfo.avatarUrl,
                      userInfo.externalId
                    )
                  );
                  dispatch(
                    ConferenceActions._conferenceJoined(
                      res.id,
                      pinCode,
                      res.params.dolbyVoice
                    )
                  );
                  dispatch(ControlsActions.toggleWidget());
                  dispatch(ControlsActions.saveConstraints(constraints));
                  dispatch(
                    ControlsActions.setConferencePermissions(res.permissions)
                  );
                  dispatch(ParticipantActions.triggerHandleOnConnect());
                  if (VoxeetSDK.recording.current) {
                    dispatch(ControlsActions.lockRecording());
                    dispatch(
                      OnBoardingMessageActions.onBoardingDisplay(
                        strings.recordConferenceStart,
                        2000
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
                          recordingRunning: true,
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
                      if (
                        preConfigPayload.outputDeviceSelected &&
                        preConfigPayload.outputDeviceSelected.deviceId !==
                          "default"
                      )
                        VoxeetSDK.mediaDevice
                          .selectAudioOutput(
                            preConfigPayload.outputDeviceSelected
                          )
                          .then(() =>
                            dispatch(
                              InputManagerActions.outputAudioChange(
                                preConfigPayload.outputDeviceSelected
                              )
                            )
                          )
                          .catch((err) => {
                            console.log(err);
                          });
                    } else {
                      this.setOutputAudio(dispatch);
                    }
                  }
                })
                .then(() => {
                  if (virtualBackgroundModeSupported) {
                    this.setVirtualBackground(
                      virtualBackgroundModeSupported,
                      virtualBackgroundMode,
                      controls.videoEnabled,
                      controls.videoDenoise
                    );
                  }
                });
            })
            .catch((err) => {
              console.error(err);
              dispatch(ErrorActions.onError(err));
            });
        }
      } else {
        constraints = this.setConstraintsWithPreconfigPayload(
          preConfigPayload,
          constraints,
          videoRatio
        );
      }

      if (constraints.video && videoRatio != null && preConfigPayload == null) {
        constraints.video = videoRatio;
      }

      return VoxeetSDK.conference
        .create({
          alias: conferenceAlias,
          params: {
            liveRecording: liveRecordingEnabled,
            dolbyVoice: enableDolbyVoice,
            ttl: ttl,
            stats: "true",
            mode: mode,
            videoCodec: videoCodec,
          },
          pinCode: pinCode,
        })
        .then((conference) => {
          return VoxeetSDK.conference
            .join(conference, {
              constraints,
              simulcast: simulcast,
              maxVideoForwarding: maxVideoForwarding,
              videoFilter: virtualBackgroundMode,
              videoFilterOptions: { videoDenoise: videoDenoise },
              dvwc: dvwc,
              spatialAudio,
              videoProcessor: videoProcessorOptions,
            })
            .then((res) => {
              dispatch(
                ParticipantActions.saveCurrentUser(
                  userInfo.name,
                  userInfo.avatarUrl,
                  userInfo.externalId
                )
              );
              dispatch(
                ConferenceActions._conferenceJoined(
                  res.id,
                  pinCode,
                  res.params.dolbyVoice
                )
              );
              dispatch(ControlsActions.toggleWidget());
              dispatch(ControlsActions.saveConstraints(constraints));
              dispatch(
                ControlsActions.setConferencePermissions(res.permissions)
              );
              dispatch(ParticipantActions.triggerHandleOnConnect());
              if (VoxeetSDK.recording.current) {
                dispatch(ControlsActions.lockRecording());
                dispatch(
                  OnBoardingMessageActions.onBoardingDisplay(
                    strings.recordConferenceStart,
                    2000
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
                      recordingRunning: true,
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
                  if (
                    preConfigPayload.outputDeviceSelected &&
                    preConfigPayload.outputDeviceSelected.deviceId !== "default"
                  )
                    VoxeetSDK.mediaDevice
                      .selectAudioOutput(preConfigPayload.outputDeviceSelected)
                      .then(() =>
                        dispatch(
                          InputManagerActions.outputAudioChange(
                            preConfigPayload.outputDeviceSelected
                          )
                        )
                      )
                      .catch((err) => {
                        console.log(err);
                      });
                } else {
                  this.setOutputAudio(dispatch);
                }
              }
              if (
                preConfigPayload &&
                preConfigPayload.audioTransparentMode !== undefined
              ) {
                dispatch(
                  ConferenceActions.setAudioTransparentMode(
                    preConfigPayload.audioTransparentMode
                  )
                );
              }
              if (maxVideoForwarding !== undefined) {
                dispatch(
                  ControlsActions.setMaxVideoForwarding(maxVideoForwarding)
                );
              }
            })
            .then(() => {
              if (virtualBackgroundModeSupported) {
                return this.setVirtualBackground(
                  virtualBackgroundMode,
                  controls.videoEnabled,
                  controls.videoDenoise
                );
              }
            });
        })
        .catch((err) => {
          console.log(err);
          dispatch(ErrorActions.onError(err));
        });
    };
  }

  static replay(conferenceId, offset) {
    return (dispatch) => {
      dispatch(this._conferenceReplaying(conferenceId));
      dispatch(ParticipantActions.onParticipantSave());
      dispatch(ParticipantActions.clearParticipantsList());
      return VoxeetSDK.replayConference(conferenceId, 0)
        .then((res) => {
          dispatch(ControlsActions.toggleWidget());
          dispatch(ParticipantActions.triggerHandleOnConnect());
          dispatch(
            this._conferenceJoined(
              res.conferenceId,
              undefined,
              res.params.dolbyVoice
            )
          );
        })
        .catch((err) => {
          this._throwErrorModal(err);
        });
    };
  }

  static demo() {
    return {
      type: Types.CONFERENCE_DEMO,
    };
  }

  static leave() {
    return (dispatch, getState) => {
      const {
        voxeet: { controls },
      } = getState();
      return VoxeetSDK.conference
        .leave()
        .then(() => {
          dispatch(TimerActions.stopTime());
          dispatch(ConferenceActions._conferenceLeave());
          dispatch(ConferenceActions._conferenceLeave(controls.disableSounds));
          if (controls.closeSessionAtHangUp) {
            this._removeListeners().then(() => {
              if (VoxeetSDK.session && VoxeetSDK.session.participant) {
                VoxeetSDK.session.close().catch((err) => {
                  // console.error(err);
                });
              }
            });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    };
  }

  static playBlockedAudio() {
    return () => {
      VoxeetSDK.conference.playBlockedAudio();
    };
  }

  static conferenceEnded() {
    return (dispatch) => {
      dispatch(TimerActions.stopTime());
      dispatch({
        type: Types.REPLAY_ENDED,
      });
    };
  }

  static toggleMicrophone(userId, isMuted) {
    return (dispatch, getState) => {
      const {
        voxeet: { controls },
      } = getState();
      let user;
      if (!userId) {
        user = VoxeetSDK.session.participant;
        userId = user.id;
        isMuted = controls.isMuted;
      } else {
        user = VoxeetSDK.conference.participants.get(userId);
      }
      if (!controls.audioEnabled) {
        let inputCookieExist = false;
        VoxeetSDK.mediaDevice.enumerateAudioDevices().then((devices) => {
          devices.forEach((source) => {
            const inputDevice = Cookies.getDevice("input");
            if (inputDevice && inputDevice.deviceId === source.deviceId)
              inputCookieExist = true;
          });
          if (!inputCookieExist) {
            let selected_device = devices.find(
              (device) => device.deviceId === "default"
            );
            if (!selected_device) selected_device = devices[0];
            dispatch(InputManagerActions.inputAudioChange(selected_device));
          } else {
            dispatch(
              InputManagerActions.inputAudioChange(Cookies.getDevice("input"))
            );
          }
          VoxeetSDK.audio.remote
            .start(VoxeetSDK.session.participant)
            .then(() => {
              dispatch(ControlsActions.toggleAudio(true));
            });
        });
      } else {
        if (userId === VoxeetSDK.session.participant.id) {
          VoxeetSDK.conference.mute(user, !isMuted);
        } else {
          let promise;
          if (isMuted) {
            promise = VoxeetSDK.audio.remote.start(user);
          } else {
            promise = VoxeetSDK.audio.remote.stop(user);
          }
          return promise.then(() =>
            dispatch(ParticipantActions.onToogleMicrophone(userId))
          );
        }
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
    return (dispatch) => {
      return VoxeetSDK.conference.rtc.enable3DAudio(audio3DEnabled).then(() => {
        dispatch(ControlsActions.toggleAudio3D());
      });
    };
  }

  static setAudioTransparentMode(enabled) {
    return (dispatch) => {
      const options = enabled
        ? { mode: "unprocessed" }
        : { mode: "standard", modeOptions: { noiseReductionLevel: "high" } };
      return VoxeetSDK.audio.local.setCaptureMode(options).then(() => {
        dispatch(ControlsActions.setAudioTransparentMode(enabled));
      });
    };
  }

  static setMaxVideoForwarding(value) {
    return (dispatch, getState) => {
      const {
        voxeet: { controls },
      } = getState();
      let { requestedVideos } = controls;
      let request = requestedVideos.map((id) =>
        VoxeetSDK.conference.participants.get(id)
      );
      return VoxeetSDK.conference.videoForwarding(value, request).then(() => {
        dispatch(ControlsActions.setMaxVideoForwarding(value));
      });
    };
  }

  static toggleForwardedVideo(participantId) {
    return (dispatch, getState) => {
      const {
        voxeet: { controls, participants },
      } = getState();
      let { requestedVideos, maxVideoForwarding } = controls;
      const requested = requestedVideos.indexOf(participantId) > -1;
      // call api and update controls
      let rv = !requested
        ? [...requestedVideos, participantId]
        : requestedVideos.filter((id) => id !== participantId);
      let request = rv.map((id) => VoxeetSDK.conference.participants.get(id));
      //console.log('CA forwardParticipantVideo', {requestedVideos, maxVideoForwarding, participantId, state: !requested, request});
      return VoxeetSDK.conference
        .videoForwarding(maxVideoForwarding, request)
        .then(() => {
          dispatch(
            ControlsActions.setRequestedVideo(participantId, !requested)
          );
        })
        .catch((error) => {
          console.error(error);
          // Just in case..
          dispatch(ControlsActions.setRequestedVideo(participantId, false));
        });
    };
  }

  static toggleVideo(videoStarted) {
    return async (dispatch, getState) => {
      const {
        voxeet: { controls, inputManager },
      } = getState();
      if (!videoStarted) {
        const virtualBackgroundMode =
          controls.virtualBackgroundMode !== undefined
            ? controls.virtualBackgroundMode
            : Cookies.get("virtualBackgroundMode");
        const processor =
          virtualBackgroundMode != null && virtualBackgroundMode !== "none"
            ? { type: virtualBackgroundMode }
            : null;

        const payloadConstraints = {
          deviceId: inputManager.currentVideoDevice?.deviceId,
        };
        if (controls.videoRatio) {
          payloadConstraints.width = controls.videoRatio.width;
          payloadConstraints.height = controls.videoRatio.height;
        }

        return VoxeetSDK.video.local
          .start(payloadConstraints, processor)
          .then(() => {
            dispatch(
              OnBoardingMessageActions.onBoardingDisplay(strings.cameraOn, 1000)
            );
            dispatch(ControlsActions.toggleVideo(true));
          })
          .catch((err) => {
            this._throwErrorModal(err);
          });
      } else {
        return VoxeetSDK.video.local
          .stop()
          .then(() => {
            dispatch(ControlsActions.toggleVideo(false));
            dispatch(
              OnBoardingMessageActions.onBoardingDisplay(
                strings.cameraOff,
                1000
              )
            );
          })
          .catch((err) => {
            this._throwErrorModal(err);
          });
      }
    };
  }

  static handleLeave() {
    return (dispatch, getState) => {
      const {
        voxeet: { participants, controls },
      } = getState();
      if (participants.handleOnLeave != null) participants.handleOnLeave();
    };
  }

  static handleConferenceLeft() {
    return (dispatch, getState) => {
      const {
        voxeet: { participants, controls },
      } = getState();
      if (controls.closeSessionAtHangUp) {
        this._removeListeners().then(() => {
          if (VoxeetSDK.session && VoxeetSDK.session.participant) {
            VoxeetSDK.session.close().catch((err) => {
              // console.error(err);
            });
          }
        });
      }
    };
  }

  static toggleVideoPresentation(url) {
    return (dispatch, getState) => {
      const {
        voxeet: { participants },
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
        voxeet: { participants, controls },
      } = getState();
      if (controls.isScreenshare) return VoxeetSDK.conference.stopScreenShare();
      else {
        if (participants.maxScreenShareReached) {
          dispatch(
            OnBoardingMessageWithActionActions.onBoardingMessageWithAction(
              strings.screenshareInProgress,
              null,
              true
            )
          );
        } else
          return VoxeetSDK.conference
            .startScreenShare({ audio: true })
            .catch((err) => {
              if (
                err.message === "Chrome Web Extension is not installed" &&
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
                err.message === "Chrome Web Extension is not installed" &&
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
      }
    };
  }

  static sendBroadcastMessage(messageType, participant_id, chat_payload) {
    return (dispatch, getState) => {
      let broadcastMessage = {};
      switch (messageType) {
        case BROADCAST_KICK:
          broadcastMessage = {
            title: "Kick_Event",
            userId: participant_id,
          };
          return VoxeetSDK.command
            .send(broadcastMessage)
            .then(() => {})
            .catch((err) => {
              this._throwErrorModal(err);
            });

        case RECORDING_STATE:
          broadcastMessage = {
            title: "Recording_State",
            recordingRunning: chat_payload.recordingRunning,
            name: chat_payload.name,
            userId: chat_payload.userId,
          };
          return VoxeetSDK.command
            .send(broadcastMessage)
            .then(() => {
              dispatch({ type: "noop" });
            })
            .catch((err) => {
              this._throwErrorModal(err);
            });

        case CHAT_MESSAGE:
          broadcastMessage = {
            title: "Chat_Message",
            content: chat_payload.content,
            type: chat_payload.type,
            avatarUrl: chat_payload.avatarUrl,
            time: chat_payload.time,
            name: chat_payload.name,
            ownerId: chat_payload.ownerId,
          };
          return VoxeetSDK.command
            .send(broadcastMessage)
            .then(() => {
              dispatch({ type: "noop" });
            })
            .catch((err) => {
              this._throwErrorModal(err);
            });

        case BROADCAST_KICK_ADMIN_HANG_UP:
          broadcastMessage = {
            title: "Kick_Admin_Hang_up",
            ownerId: VoxeetSDK.session.participant.id,
          };
          return VoxeetSDK.command
            .send(broadcastMessage)
            .then(() => {})
            .catch((err) => {
              this._throwErrorModal(err);
            });

        default:
          break;
      }
    };
  }

  static toggleRecording(conferenceId, isRecording) {
    return (dispatch) => {
      if (!isRecording) {
        return VoxeetSDK.recording
          .start()
          .then(() => {
            sessionStorage.setItem("conferenceId", conferenceId);
            window.dispatchEvent(new Event("storage"));
            dispatch(ControlsActions.toggleRecording());
          })
          .catch((err) => {
            this._throwErrorModal(err);
          });
      } else {
        return VoxeetSDK.recording
          .stop()
          .then(() => {
            dispatch(ControlsActions.toggleRecording());
          })
          .catch((err) => {
            this._throwErrorModal(err);
          });
      }
    };
  }

  static setVirtualBackgroundMode(mode) {
    return async (dispatch, getState) => {
      const {
        voxeet: { controls },
      } = getState();

      await ConferenceActions.setVirtualBackground(
        mode,
        controls.videoEnabled,
        controls.videoDenoise
      );

      Cookies.set("virtualBackgroundMode", mode);
      dispatch(ControlsActions.setVirtualBackgroundMode(mode));
    };
  }

  static setVideoDenoise(enabled) {
    return (dispatch, getState) => {
      if (!VoxeetSDK.videoFilters || !isElectron()) {
        // Skip if not supported in SDK or not in NDS
        Cookies.set("videoDenoise", false);
        dispatch(ControlsActions.setVideoDenoise(false));
        return Promise.resolve();
      }
      const {
        voxeet: { controls },
      } = getState();
      let { virtualBackgroundMode } = controls;
      const videoFilter =
        ["none", "bokeh"].indexOf(virtualBackgroundMode) >= 0
          ? virtualBackgroundMode
          : "none";
      return VoxeetSDK.videoFilters
        .setFilter(videoFilter, { videoDenoise: enabled })
        .then(() => {
          Cookies.set("videoDenoise", enabled);
          dispatch(ControlsActions.setVideoDenoise(enabled));
        })
        .catch((e) => console.warn(e));
    };
  }

  static checkIfUpdateStatusUser(user) {
    return (dispatch, getState) => {
      const {
        voxeet: { participants },
      } = getState();
      const index = participants.participants.findIndex(
        (p) => p.participant_id === user.id
      );
      if (index !== -1) {
        const {
          voxeet: { participantsWaiting },
        } = getState();
        const index = participantsWaiting.participants.findIndex(
          (p) => p.participant_id === user.id
        );
        dispatch(
          ParticipantActions.onParticipantStatusUpdated(
            user.id,
            participantsWaiting.participants[index],
            user.status
          )
        );
      }
      dispatch(
        ParticipantWaitingActions.onParticipantWaitingStatusUpdated(
          user.id,
          user.status,
          user.type
        )
      );
    };
  }

  static checkIfUpdateUser(user, stream) {
    return (dispatch, getState) => {
      const {
        voxeet: { participants },
      } = getState();
      const index = participants.participants.findIndex(
        (p) => p.participant_id === user.id
      );
      if (index !== -1 || VoxeetSDK.session.participant.id === user.id)
        dispatch(ParticipantActions.onParticipantUpdated(user, stream));
    };
  }

  static checkIfUserJoined(user, stream) {
    return (dispatch, getState) => {
      const {
        voxeet: { participants, controls },
      } = getState();
      const index = participants.participants.findIndex(
        (p) => p.participant_id === user.id
      );
      if (index === -1) {
        const {
          voxeet: { participantsWaiting },
        } = getState();
        const index = participantsWaiting.participants.findIndex(
          (p) => p.participant_id === user.id
        );
        dispatch(
          ParticipantActions.onParticipantStatusUpdated(
            user.id,
            participantsWaiting.participants[index],
            STATUS_CONNECTING
          )
        );
      }
      dispatch(
        ParticipantActions.onParticipantJoined(user, controls.disableSounds)
      );
    };
  }

  static _removeListeners(dispatch) {
    return new Promise((resolve, reject) => {
      VoxeetSDK.conference.removeAllListeners();
      VoxeetSDK.session.removeAllListeners();
      VoxeetSDK.videoPresentation.removeAllListeners();
      VoxeetSDK.filePresentation.removeAllListeners();
      VoxeetSDK.recording.removeAllListeners();
      VoxeetSDK.command.removeAllListeners();
      resolve();
    });
  }

  static _initializeListeners(dispatch, options) {
    let { chatOptions } = options || {};
    return new Promise((resolve, reject) => {
      VoxeetSDK.conference.on("left", () => {
        dispatch(this.handleLeave());
        dispatch(ControlsActions.resetWidgetControls());
        dispatch(this.conferenceEnded());
        dispatch(ParticipantActions.clearParticipantsList());
        dispatch(ParticipantActions.onParticipantReset());
        dispatch(ParticipantWaitingActions.onParticipantWaitingReset());
        dispatch(this.handleConferenceLeft());
      });

      VoxeetSDK.conference.on("ended", () => {
        dispatch(this.handleLeave());
        dispatch(this.conferenceEnded());
        dispatch(ControlsActions.resetWidgetControls());
        dispatch(ParticipantActions.clearParticipantsList());
        dispatch(ParticipantActions.onParticipantReset());
      });

      VoxeetSDK.filePresentation.on("converted", (filePresentation) => {
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

      VoxeetSDK.filePresentation.on("started", (filePresentation) => {
        dispatch(ControlsActions.forceMode("speaker"));
        if (VoxeetSDK.session.participant.id === filePresentation.owner.id) {
          dispatch(ControlsActions.toggleFilePresentationMode(true));
        }

        for (let i = 0; i < filePresentation.imageCount; i++) {
          VoxeetSDK.filePresentation.thumbnail(i).then((thumbUrl) => {
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
          .then((res) => {
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

      VoxeetSDK.filePresentation.on("updated", (filePresentation) => {
        VoxeetSDK.filePresentation
          .image(filePresentation.position)
          .then((res) => {
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

      VoxeetSDK.conference.on("participantAdded", (userInfo) => {
        dispatch(
          ParticipantWaitingActions.onParticipantWaitingAdded(
            userInfo.id,
            userInfo
          )
        );
        dispatch(this.checkIfUserJoined(userInfo, null));
      });

      VoxeetSDK.conference.on("participantUpdated", (user) => {
        // if (user.status === "Left") {
        //   dispatch(ParticipantWaitingActions.onParticipantWaitingLeft(user.id));
        //   dispatch(ParticipantActions.onParticipantLeft(user.id));
        // }
        // dispatch(
        //   ParticipantWaitingActions.onParticipantWaitingStatusUpdated(
        //     user.id,
        //     user.status,
        //     user.type
        //   )
        // );
        dispatch(this.checkIfUpdateStatusUser(user));
      });

      VoxeetSDK.conference.on("streamAdded", (user, stream) => {
        if (stream && stream.type === "ScreenShare") {
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
          dispatch(
            ParticipantActions.onStreamAddedForParticipant(user, stream)
          );

          // VFS
          dispatch(ForwardedVideoActions.updateForwardedVideos());
        }
      });

      VoxeetSDK.conference.on("autoplayBlocked", () => {
        dispatch(
          OnBoardingMessageWithConfirmationActions.onBoardingMessageWithConfirmation(
            strings.autoPlayBlocked,
            strings.autoPlayBlockedButton,
            false,
            () => {
              VoxeetSDK.conference.playBlockedAudio();
            }
          )
        );
      });

      VoxeetSDK.conference.on("streamUpdated", (user, stream) => {
        if (stream && stream.type === "ScreenShare") {
          return;
        }
        dispatch(
          ParticipantWaitingActions.onParticipantWaitingUpdated(user.id, stream)
        );
        dispatch(this.checkIfUpdateUser(user, stream));

        // VFS
        dispatch(ForwardedVideoActions.updateForwardedVideos());
      });

      VoxeetSDK.conference.on("streamRemoved", (user, stream) => {
        if (stream && stream.type === "ScreenShare") {
          dispatch(ParticipantActions.onScreenShareStopped(user.id));
          if (VoxeetSDK.session.participant.id === user.id) {
            dispatch(ControlsActions.toggleScreenShareMode(false));
          }
        } else {
          // VFS
          dispatch(ForwardedVideoActions.updateForwardedVideos());
        }
      });

      VoxeetSDK.conference.on("qualityIndicators", (indicators) => {
        if (indicators) {
          // console.log("Quality indicators:", indicators)
          dispatch(ParticipantActions.onParticipantQualityUpdated(indicators));
          // dispatch(ControlsActions.toggleScreenShareMode(false));
        } else {
          console.warn("No indicators");
        }
      });

      VoxeetSDK.conference.on("error", (data) => {
        let title, description, isError;
        console.error("error", JSON.stringify(data), data.message, data.name);
        switch (data.name) {
          case "NotAllowedError":
          case "OverconstrainedError":
          case "AbortError":
          case "NotReadableError":
          case "SecurityError":
          case "TypeError":
            title = strings[`title${data.name}`];
            description = strings[`desc${data.name}`];
            isError = true;
            break;
          case "MediaError":
            title = data.message;
            description = null;
            isError = true;
            break;
          case "PeerConnectionFailedError":
            title = strings.titleNetworkConnectionError;
            description = strings.descPeerConnectionFailedError;
            isError = true;
            break;
          case "PeerConnectionDisconnectedError":
            title = strings.titleNetworkConnectionError;
            description = strings.descPeerConnectionDisconnectedError;
            isError = true;
            break;
          case "RemoteDescriptionError":
            title = strings.titleCallSetupError;
            description = strings.descRemoteDescriptionError;
            isError = true;
            break;
          case "CreateAnswerError":
            title = strings.titleCallSetupError;
            description = strings.descCreateAnswerError;
            isError = true;
            break;
          case "ConferenceUninitializedError":
            title = strings.titleCallSetupError;
            description = strings.descPeerNotFoundError;
            isError = true;
            break;
          // case 'PeerDisconnectedError':
          // case 'PeerNotFoundError':
          // case 'ParticipantNotFoundError':
          case "NotFoundError":
            if (data instanceof PeerNotFoundError) {
              title = strings.titleSystemError;
              description = strings.descPeerNotFoundError;
            } else if (data instanceof ParticipantNotFoundError) {
              title = strings.titleSystemError;
              description = string.descParticipantNotFoundError;
            } else if (data instanceof MediaStreamError) {
              title = strings.titleNotFoundError;
              description = string.descNotFoundError;
            }
            isError = true;
            break;
          case "ChromeExtensionNotInstalled":
            title = strings.noExtensionAvailable;
            description = null;
            isError = true;
            break;
          case "BrowserNotSupportedError":
            title = strings.browserNotSupported;
            description = null;
            isError = true;
            break;
          case "MaxCapacityError":
            title = strings.titleConferenceCapacityError;
            description = strings.descConferenceCapacityError;
            isError = true;
            break;
          case "DataChannelError":
            title = data.message;
            description = null;
            isError = true;
            break;
          case "MediaServerConnectionError":
            title = data.message;
            description = null;
            isError = true;
            break;
          case "DolbyVoiceNotSupported":
            title = strings.dolbyVoiceNotSupported;
            description = data.message;
            isError = true;
            break;
          default:
            // title = strings[`titleDefaultError`];
            // description = strings[`descDefaultError`];
            title = null;
            description = null;
            isError = true;
        }
        if (description) {
          dispatch(
            OnBoardingMessageWithActionActions.onBoardingMessageWithDescription(
              title,
              description,
              null,
              isError
            )
          );
        } else if (title) {
          dispatch(
            OnBoardingMessageWithActionActions.onBoardingMessageWithAction(
              title,
              null,
              isError
            )
          );
        }
      });

      VoxeetSDK.conference.on("permissionsUpdated", (permissions) => {
        dispatch(ControlsActions.setConferencePermissions(permissions));
      });

      VoxeetSDK.videoPresentation.on("started", (data) => {
        dispatch(ControlsActions.forceMode("speaker"));
        if (VoxeetSDK.session.participant.id === data.ownerId) {
          dispatch(ControlsActions.toggleVideoPresentationMode(true));
        }
        dispatch(ParticipantActions.onVideoPresentationStarted(data.ownerId));
        dispatch(
          VideoPresentationActions.startVideoPresentation(
            data.url,
            data.timestamp / 1000
          )
        );
        setTimeout(() => {
          dispatch(VideoPresentationActions.seek(data.timestamp / 1000));
        }, 200);
      });

      VoxeetSDK.videoPresentation.on("stopped", (data) => {
        dispatch(ParticipantActions.onVideoPresentationStopped());
        dispatch(ControlsActions.toggleVideoPresentationMode(false));
        dispatch(VideoPresentationActions.stopVideoPresentation());
      });

      VoxeetSDK.videoPresentation.on("played", (data) => {
        if (VoxeetSDK.session.participant.id !== data.ownerId) {
          dispatch(VideoPresentationActions.play());
          setTimeout(() => {
            dispatch(VideoPresentationActions.seek(data.timestamp / 1000));
          }, 200);
        }
      });

      VoxeetSDK.videoPresentation.on("paused", (data) => {
        if (VoxeetSDK.session.participant.id !== data.ownerId) {
          dispatch(VideoPresentationActions.pause());
        }
      });

      VoxeetSDK.videoPresentation.on("sought", (data) => {
        if (VoxeetSDK.session.participant.id !== data.ownerId) {
          dispatch(VideoPresentationActions.seek(data.timestamp / 1000));
        }
      });

      VoxeetSDK.recording.on("statusUpdated", (recording, status) => {
        const { userId, startTimestamp } = recording || {};
        if (!userId && !startTimestamp) return;
        let message =
          status === "recording"
            ? strings.recordConferenceStart
            : strings.recordConferenceStop;
        if (userId && VoxeetSDK.session.participant.id !== userId) {
          let user = VoxeetSDK.conference.participants.get(userId);
          let name = user && user.info ? user.info.name : "(unknown)";
          message =
            status === "recording"
              ? `${strings.recordConferenceStartBy}${name}.`
              : `${strings.recordConferenceStopBy}${name}.`;
        }
        dispatch(OnBoardingMessageActions.onBoardingDisplay(message, 1000));
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
            } else {
              dispatch(ControlsActions.unlockRecording());
            }
            break;
          case CHAT_MESSAGE:
            dispatch(this._newBadgeMessage());
            // Run autolinker
            if (chatOptions && chatOptions.autoLinker) {
              dataParsed.content =
                dataParsed.content &&
                Autolinker.link(dataParsed.content.trim());
            }
            dispatch(ChatActions.addMessage(dataParsed));
            break;
          case BROADCAST_KICK_ADMIN_HANG_UP:
            if (VoxeetSDK.session.participant.id !== dataParsed.ownerId) {
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
        userId,
      },
    };
  }

  static _newBadgeMessage() {
    return (dispatch, getState) => {
      const {
        voxeet: { controls },
      } = getState();
      if (!controls.displayAttendeesChat)
        dispatch(ChatActions.newBadgeMessage());
    };
  }

  static _conferenceReplaying(conferenceReplayId) {
    return {
      type: Types.CONFERENCE_REPLAYING,
      payload: {
        conferenceReplayId,
      },
    };
  }

  static _conferenceConnecting() {
    return {
      type: Types.CONFERENCE_CONNECTING,
    };
  }

  static _conferenceJoined(conferenceId, conferencePincode, dolbyVoiceEnabled) {
    return {
      type: Types.CONFERENCE_JOINED,
      payload: {
        conferenceId,
        conferencePincode,
        dolbyVoiceEnabled,
      },
    };
  }

  static _conferenceLeave(disableSounds = true) {
    return {
      type: Types.CONFERENCE_LEAVE,
      payload: {
        disableSounds,
      },
    };
  }
}
