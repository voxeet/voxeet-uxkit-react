import React, { Component, Fragment } from "react";
import bowser from "bowser";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import Cookies from "./../../libs/Storage";
import { Actions as InputManagerActions } from "../../actions/InputManagerActions";
import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import { Actions as ControlsActions } from "../../actions/ControlsActions"
import AttendeesSettingsVuMeterFromAudioLevel from "./AttendeesSettingsVuMeterFromAudioLevel";
import { strings } from "../../languages/localizedStrings";
import { getVideoDeviceName } from "../../libs/getVideoDeviceName";
import { isElectron, isIOS, isMobile } from "../../libs/browserDetection";
import { getUxKitContext } from "../../context";

const today = new Date();
today.setDate(today.getDate() + 365);
const default_cookies_param = {
  path: "/",
  expires: today,
  secure: true,
  sameSite: "none",
};

@connect(
  (store) => {
    return {
      inputManager: store.voxeet.inputManager,
      controlsStore: store.voxeet.controls,
    };
  },
  null,
  null,
  { context: getUxKitContext() }
)
class AttendeesSettings extends Component {
  constructor(props) {
    super(props);
    // defaults
    let maxVideoForwarding =
      this.props.controlsStore.maxVideoForwarding !== undefined
        ? this.props.controlsStore.maxVideoForwarding
        : isMobile()
        ? 4
        : 9;
    let audioTransparentMode =
      this.props.controlsStore.audioTransparentMode !== undefined
        ? this.props.controlsStore.audioTransparentMode
        : false;
    let videoEnabled =
      this.props.controlsStore.videoEnabled !== undefined
        ? this.props.controlsStore.videoEnabled
        : true;
    let lowBandwidthMode = !videoEnabled && !maxVideoForwarding;
    let virtualBackgroundMode =
      this.props.controlsStore.virtualBackgroundMode !== undefined
        ? this.props.controlsStore.virtualBackgroundMode
        : Cookies.get("virtualBackgroundMode");
    if (virtualBackgroundMode === "null") virtualBackgroundMode = null;
    let videoDenoise =
      this.props.controlsStore.videoDenoise !== undefined
        ? this.props.controlsStore.videoDenoise
        : false;

    this.state = {
      runningAnimation: false,
      attendeesSettingsOpened: props.attendeesSettingsOpened,
      audioDevices: [],
      videoDevices: [],
      outputDevices: [],
      testAudio: null,
      testAudioPlaying: false,
      audioTransparentMode: audioTransparentMode,
      videoEnabled: videoEnabled,
      maxVideoForwarding: maxVideoForwarding,
      lowBandwidthMode: lowBandwidthMode,
      virtualBackgroundMode: virtualBackgroundMode,
      videoDenoise: videoDenoise,
    };
    this.onAudioDeviceSelected = this.onAudioDeviceSelected.bind(this);
    this.setVideoDevice = this.setVideoDevice.bind(this);
    this.onOutputDeviceSelected = this.onOutputDeviceSelected.bind(this);
    this.onDeviceChange = this.onDeviceChange.bind(this);
    this.handleChangeLowBandwidthMode =
      this.handleChangeLowBandwidthMode.bind(this);
    this.onAudioTransparentModeChange =
      this.onAudioTransparentModeChange.bind(this);
    this.handleMaxVideoForwardingChange =
      this.handleMaxVideoForwardingChange.bind(this);
    this.onVirtualBackgroundModeChange =
      this.onVirtualBackgroundModeChange.bind(this);
    this.onVideoDenoiseChange = this.onVideoDenoiseChange.bind(this);
    this.maxVFTimer = null;

    this.isIOS = isIOS();
  }

  componentDidMount() {
    this.initDevices();
    navigator.mediaDevices.addEventListener(
      "devicechange",
      this.onDeviceChange
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let stateUpdate = {
      attendeesSettingsOpened: nextProps.attendeesSettingsOpened,
    };
    // Check if it should run animation
    if (
      prevState.attendeesSettingsOpened === true &&
      nextProps.attendeesSettingsOpened === false
    ) {
      stateUpdate.runningAnimation = true;
    }
    return stateUpdate;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.attendeesListOpened === true &&
      this.props.attendeesListOpened === false
    ) {
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }

    if (
      prevProps.attendeesSettingsOpened === true &&
      this.props.attendeesSettingsOpened === false
    ) {
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
    //console.log(this.props.controlsStore.maxVideoForwarding, prevProps.controlsStore.maxVideoForwarding);
    if (
      this.props.controlsStore &&
      prevProps.controlsStore.maxVideoForwarding !==
        this.props.controlsStore.maxVideoForwarding
    ) {
      this.setState({
        maxVideoForwarding: this.props.controlsStore.maxVideoForwarding,
        lowBandwidthMode:
          !this.props.controlsStore.videoEnabled &&
          !this.props.controlsStore.maxVideoForwarding,
      });
    }
    if (
      this.props.controlsStore &&
      prevProps.controlsStore.audioTransparentMode !==
        this.props.controlsStore.audioTransparentMode
    ) {
      this.setState({
        audioTransparentMode: this.props.controlsStore.audioTransparentMode,
      });
    }
    if (
      this.props.controlsStore &&
      prevProps.controlsStore.videoEnabled !==
        this.props.controlsStore.videoEnabled
    ) {
      this.setState({
        videoEnabled: this.props.controlsStore.videoEnabled,
      });
    }
    if (
      this.props.controlsStore &&
      prevProps.controlsStore.videoEnabled !==
        this.props.controlsStore.videoEnabled
    ) {
      this.setState({
        lowBandwidthMode:
          !this.props.controlsStore.videoEnabled &&
          !this.props.controlsStore.maxVideoForwarding,
      });
    }

    if (
      this.props.controlsStore &&
      prevProps.controlsStore.virtualBackgroundMode !==
        this.props.controlsStore.virtualBackgroundMode
    ) {
      console.log(
        "virtualBackgroundMode changed %s -> %s",
        prevProps.controlsStore.virtualBackgroundMode,
        this.props.controlsStore.virtualBackgroundMode
      );
      this.setState({
        virtualBackgroundMode: this.props.controlsStore.virtualBackgroundMode,
      });
    }

    if (
      this.props.controlsStore &&
      prevProps.controlsStore.videoDenoise !==
        this.props.controlsStore.videoDenoise
    ) {
      console.log(
        "videoDenoise changed %s -> %s",
        prevProps.controlsStore.videoDenoise,
        this.props.controlsStore.videoDenoise
      );
      this.setState({ videoDenoise: this.props.controlsStore.videoDenoise });
    }

    if (
      this.props.controlsStore.videoEnabled !==
        prevProps.controlsStore.videoEnabled ||
      this.props.controlsStore.audioEnabled !==
        prevProps.controlsStore.audioEnabled
    ) {
      this.initDevices();
    }
  }

  componentWillUnmount() {
    navigator.mediaDevices.removeEventListener(
      "devicechange",
      this.onDeviceChange
    );
  }

  onDeviceChange() {
    this.initDevices();
  }

  initDevices() {
    VoxeetSDK.mediaDevice
      .enumerateAudioInputDevices()
      .then((devices) => {
        this.setState({ audioDevices: devices });
        const currentInputDevice = VoxeetSDK.mediaDevice.selectedAudioInputDevice;
        if (currentInputDevice) {
          return this.props.dispatch(InputManagerActions.inputAudioChange(currentInputDevice));
        }

      })
      .catch((e) =>
        console.error("Initializing an audio input device failed.", e)
      );

    VoxeetSDK.mediaDevice
      .enumerateAudioOutputDevices()
      .then((devices) => {
        this.setState({ outputDevices: devices });
        const currentOutputDevice = VoxeetSDK.mediaDevice.selectedAudioOutputDevice;
        if (currentOutputDevice) {
          return this.props.dispatch(InputManagerActions.outputAudioChange(currentOutputDevice));
        }
      })
      .catch((e) =>
        console.error("Initializing an audio output device failed.", e)
      );

    VoxeetSDK.mediaDevice
      .enumerateVideoInputDevices()
      .then((devices) => {
        const currentVideoDevice = VoxeetSDK.mediaDevice.selectedVideoInputDevice;
        if (currentVideoDevice) {
          getVideoDeviceName(currentVideoDevice.deviceId).then(
            (isBackCamera) => {
              this.props.dispatch(
                InputManagerActions.inputVideoChange(
                  currentVideoDevice,
                  isBackCamera
                )
              );
            }
          );
        }
        this.setState({
          videoDevices: devices,
        });
      })
      .catch((e) => console.error(e));
  }

  onOutputDeviceSelected(e) {
    const device =  e.target.value ? JSON.parse(e.target.value) : {};
    this.setOutputDevice(device).catch((e) =>
      console.error("Selecting audio output device failed.", e)
    );
  }

  setOutputDevice(device) {
    return VoxeetSDK.mediaDevice.selectAudioOutput(device).then(() => {
      Cookies.setDevice("output", device, default_cookies_param);
      this.props.dispatch(InputManagerActions.outputAudioChange(device));
    });
  }

  onAudioDeviceSelected(e) {
    const device =  e.target.value ? JSON.parse(e.target.value) : {};
    this.setAudioDevice(device).catch((e) =>
      console.error("Selecting audio input device failed.", e)
    );
  }

  setAudioDevice(device) {
    return VoxeetSDK.mediaDevice.selectAudioInput(device).then(() => {
      if (this.props.microphoneMuted) {
        VoxeetSDK.conference
          .mute(VoxeetSDK.session.participant, true)
          .catch((e) =>
            console.warn("Muting a new selected input device failed.", e)
          );
      }

      Cookies.setDevice("input", device, default_cookies_param);
      this.props.dispatch(InputManagerActions.inputAudioChange(device));
    });
  }

  setVideoDevice(e) {
    const { videoEnabled } = this.props;
    const device =  e.target.value ? JSON.parse(e.target.value) : {};
    if (videoEnabled) {
      VoxeetSDK.mediaDevice.selectVideoInput(device);
    }
    Cookies.setDevice("camera", device, default_cookies_param);
    getVideoDeviceName(device.deviceId).then(
      (isBackCamera, currentVideoDevice) => {
        this.props.dispatch(
          InputManagerActions.inputVideoChange(device, isBackCamera)
        );
      }
    );
  }

  onAudioTransparentModeChange() {
    const { audioTransparentMode } = this.props.controlsStore;
    this.setState(
      {
        audioTransparentMode: !audioTransparentMode,
      },
      () => {
        Cookies.set(
          "audioTransparentMode",
          this.state.audioTransparentMode,
          default_cookies_param
        );
        this.props.dispatch(
          ControlsActions.toggleAudioTransparentMode()
        );
        this.props.dispatch(
          ConferenceActions.setAudioTransparentMode(
            this.state.audioTransparentMode
          )
        );
      }
    );
  }

  onVirtualBackgroundModeChange(mode) {
    console.log("onVirtualBackgroundModeChange", mode);
    this.setState(
      {
        virtualBackgroundMode:
          mode !== this.state.virtualBackgroundMode ? mode : null,
      },
      () => {
        console.log(
          "about to call ConferenceActions.setVirtualBackgroundMode",
          this.state.virtualBackgroundMode
        );
        this.props.dispatch(
          ConferenceActions.setVirtualBackgroundMode(
            this.state.virtualBackgroundMode
          )
        );
      }
    );
  }

  onVideoDenoiseChange() {
    const { videoDenoise } = this.props.controlsStore;
    this.setState(
      {
        videoDenoise: !videoDenoise,
      },
      () => {
        this.props.dispatch(
          ConferenceActions.setVideoDenoise(this.state.videoDenoise)
        );
      }
    );
  }

  handleChangeLowBandwidthMode(event) {
    if (this.maxVFTimer) {
      clearTimeout(this.maxVFTimer);
      this.maxVFTimer = null;
    }
    const low_bandwidth = event.target.checked;
    let maxVideoForwarding = low_bandwidth
      ? 0
      : Cookies.get("maxVideoForwarding") !== undefined
      ? Cookies.get("maxVideoForwarding")
      : isMobile()
      ? 4
      : 9;
    if (
      typeof maxVideoForwarding === "string" ||
      maxVideoForwarding instanceof String
    )
      maxVideoForwarding = parseInt(maxVideoForwarding);

    if (low_bandwidth) {
      // Get current videoEnabled status
      let videoEnabled =
        this.props.controlsStore.videoEnabled !== undefined
          ? this.props.controlsStore.videoEnabled
          : true;
      // Cookies.set('videoEnabled', false, default_cookies_param);
      if (videoEnabled) {
        // Disable if enabled, don't change if already disabled
        this.props.dispatch(ConferenceActions.toggleVideo(true));
      }
      // Don't change maxVideoForwarding value in cookies
      // Cookies.set("maxVideoForwarding", 0, default_cookies_param);
      this.props.dispatch(
        ConferenceActions.setMaxVideoForwarding(maxVideoForwarding)
      );
    } else {
      // Don't enable video, don't touch a value in cookies
      // Cookies.set('videoEnabled', true, default_cookies_param);
      // this.props.dispatch(ConferenceActions.toggleVideo(low_bandwidth));
      // Don't change maxVideoForwarding value in cookies
      // Cookies.set("maxVideoForwarding", maxVideoForwarding, default_cookies_param);
      // Revert to value stored in cookies
      this.props.dispatch(
        ConferenceActions.setMaxVideoForwarding(maxVideoForwarding)
      );
    }
  }

  handleMaxVideoForwardingChange(event) {
    if (this.maxVFTimer) {
      clearTimeout(this.maxVFTimer);
      this.maxVFTimer = null;
    }
    let num;
    const maxVF = event.target.value;

    try {
      num = parseInt(maxVF);
    } catch (e) {}
    if (num !== undefined && !isNaN(num)) {
      this.setState({ maxVideoForwarding: num }, () => {
        this.maxVFTimer = setTimeout(() => {
          //console.log('handleMaxVideoForwardingChange', num);
          Cookies.set("maxVideoForwarding", num, default_cookies_param);
          this.props.dispatch(ConferenceActions.setMaxVideoForwarding(num));
          clearTimeout(this.maxVFTimer);
          this.maxVFTimer = null;
        }, 1500);
      });
    } else {
      this.setState({ maxVideoForwarding: "" });
    }
  }

  render() {
    const {
      lowBandwidthMode,
      maxVideoForwarding,
      audioTransparentMode,
      virtualBackgroundMode,
      videoEnabled,
      videoDenoise,
    } = this.state;
    //const { audioTransparentMode } = this.props.controlsStore;

    const { attendeesSettingsOpened, isListener, dolbyVoiceEnabled } =
      this.props;
    const MAX_MAXVF = isMobile() ? 4 : 16;
    const { currentAudioDevice, currentVideoDevice, currentOutputDevice } =
      this.props.inputManager;
    return (
      <div
        className={
          this.state.runningAnimation
            ? "attendees-settings attendees-settings-out"
            : attendeesSettingsOpened
            ? "attendees-settings"
            : "attendees-settings-hidden"
        }
      >
        <div className="attendees-settings-header">
          <h1>{strings.settings}</h1>
        </div>

        <div className="settings">
          <div className="content">
            <form>
              {(bowser.chrome || isElectron()) && (
                <div className="form-group form-output">
                  {/* <label htmlFor="output">Sound Output</label> */}
                  <select
                    name="output"
                    value={JSON.stringify(currentOutputDevice)}
                    className="form-control select-audio-output"
                    onChange={this.onOutputDeviceSelected}
                    disabled={false}
                  >
                    {this.state.outputDevices.map((device, i) => (
                      <option key={i} value={JSON.stringify(device)}>
                        {device.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {!isListener && (
                <Fragment>
                  <div className="form-group last">
                    {/* <label htmlFor="video">Camera</label> */}
                    <select
                      name="video"
                      value={JSON.stringify(currentVideoDevice)}
                      className="form-control select-video-device"
                      onChange={this.setVideoDevice}
                      disabled={false}
                    >
                      {this.state.videoDevices.map((device, i) => (
                        <option key={i} value={JSON.stringify(device)}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    {/* <label htmlFor="video">Microphone</label> */}
                    <select
                      name="audio"
                      value={JSON.stringify(currentAudioDevice)}
                      className="form-control select-audio-input"
                      onChange={this.onAudioDeviceSelected}
                    >
                      {this.state.audioDevices.map((device, i) => (
                        <option key={i} value={JSON.stringify(device)}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    {<AttendeesSettingsVuMeterFromAudioLevel maxLevel={21} />}
                  </div>
                  {dolbyVoiceEnabled && (
                    <div className="form-group switch-enable">
                      <div className="switch-mode">
                        <input
                          id="audioTransparentMode"
                          name="audioTransparentMode"
                          type="checkbox"
                          onChange={this.onAudioTransparentModeChange}
                          checked={audioTransparentMode}
                        />
                        <label htmlFor="audioTransparentMode">
                          {strings.audioTransparentMode}
                        </label>
                      </div>
                    </div>
                  )}
                </Fragment>
              )}
              <div className="form-group switch-enable">
                <div className="switch-mode">
                  <input
                    id="lowBandwidthMode"
                    name="lowBandwidthMode"
                    type="checkbox"
                    onChange={this.handleChangeLowBandwidthMode}
                    checked={lowBandwidthMode}
                  />
                  <label htmlFor="lowBandwidthMode">
                    {strings.lowBandwidthMode}
                  </label>
                </div>
              </div>

              {(bowser.chrome || isElectron()) && (
                <div
                  className={`form-group switch-enable ${
                    !videoEnabled ? "disabled-form" : ""
                  }`}
                >
                  <div className="switch-mode">
                    <input
                      id="vbModeBokeh"
                      name="vbModeBokeh"
                      type="checkbox"
                      onChange={() =>
                        this.onVirtualBackgroundModeChange("bokeh")
                      }
                      checked={virtualBackgroundMode === "bokeh"}
                    />
                    <label htmlFor="vbModeBokeh">{strings.bokehMode}</label>
                  </div>
                </div>
              )}

              {isElectron() && (
                <div
                  className={`form-group switch-enable ${
                    !videoEnabled ? "disabled-form" : ""
                  }`}
                >
                  <div className="switch-mode">
                    <input
                      id="videoDenoise"
                      name="videoDenoise"
                      type="checkbox"
                      onChange={this.onVideoDenoiseChange}
                      checked={videoDenoise}
                    />
                    <label htmlFor="videoDenoise">{strings.videoDenoise}</label>
                  </div>
                </div>
              )}
              <div
                className={`form-group switch-enable maxVideoForwarding ${
                  lowBandwidthMode ? "disabled-form" : ""
                }`}
              >
                <div className="input-wrapper">
                  <div className="input-value">0</div>
                  <input
                    type="range"
                    style={{
                      background: `linear-gradient(to right, #00afef 0%, #00afef ${
                        (100 / MAX_MAXVF) *
                        (!lowBandwidthMode ? maxVideoForwarding : 0)
                      }%, #fff ${
                        (100 / MAX_MAXVF) *
                        (!lowBandwidthMode ? maxVideoForwarding : 0)
                      }%, #fff 100%)`,
                    }}
                    id="maxVideoForwarding"
                    name="maxVideoForwarding"
                    min={0}
                    max={MAX_MAXVF}
                    step={1}
                    onChange={this.handleMaxVideoForwardingChange}
                    value={!lowBandwidthMode ? maxVideoForwarding : 0}
                  />
                  <div className="input-value">{MAX_MAXVF}</div>
                </div>
                <label htmlFor="maxVideoForwarding">
                  <div className="maxVideoForwardingValue">{`${
                    strings.showVideoParticipants1
                  } ${!lowBandwidthMode ? maxVideoForwarding : 0} ${
                    strings.showVideoParticipants2
                  }`}</div>
                </label>
              </div>
              <div className="hint-text">
                <p>{strings.problemSettings}</p>
                <p>{strings.saveSettings}</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

AttendeesSettings.propTypes = {
  videoEnabled: PropTypes.bool.isRequired,
  isListener: PropTypes.bool.isRequired,
  attendeesSettingsOpened: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
  maxVideoForwarding: PropTypes.number,
};

export default AttendeesSettings;