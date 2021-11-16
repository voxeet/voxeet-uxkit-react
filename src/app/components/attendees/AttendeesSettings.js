import React, { Component, Fragment } from "react";
import bowser from "bowser";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import ReactTooltip from "react-tooltip";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import Cookies from "./../../libs/Storage";
import { Actions as InputManagerActions } from "../../actions/InputManagerActions";
import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import AttendeesParticipantVideo from "./AttendeesParticipantVideo";
import AttendeesSettingsVuMeterFromAudioLevel from "./AttendeesSettingsVuMeterFromAudioLevel";
import AttendeesSettingsVuMeterFromMediaStream from "./AttendeesSettingsVuMeterFromMediaStream";
import { strings } from "../../languages/localizedStrings";
import { getVideoDeviceName } from "./../../libs/getVideoDeviceName";
import {isIOS, isMobile, isElectron} from "./../../libs/browserDetection";
import {Actions as ControlsActions} from "../../actions/ControlsActions";

var today = new Date();
today.setDate(today.getDate() + 365);
const default_cookies_param = {
  path: "/",
  expires: today,
  secure: true,
  sameSite: 'none'
};

@connect(store => {
  return {
    inputManager: store.voxeet.inputManager,
    controlsStore: store.voxeet.controls
  };
})
class AttendeesSettings extends Component {
  constructor(props) {
    super(props);
    // defaults
    let maxVideoForwarding = ((this.props.controlsStore.maxVideoForwarding !== undefined) ? this.props.controlsStore.maxVideoForwarding : isMobile()?4:9);
    let audioTransparentMode = ((this.props.controlsStore.audioTransparentMode !== undefined) ? this.props.controlsStore.audioTransparentMode : false);
    let videoEnabled = ((this.props.controlsStore.videoEnabled !== undefined) ? this.props.controlsStore.videoEnabled : true);
    let lowBandwidthMode = !videoEnabled && !maxVideoForwarding
    let virtualBackgroundMode = ((this.props.controlsStore.virtualBackgroundMode !== undefined) ? this.props.controlsStore.virtualBackgroundMode : Cookies.get("virtualBackgroundMode"));
    if(virtualBackgroundMode=='null')
      virtualBackgroundMode = null;

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
      virtualBackgroundMode: virtualBackgroundMode
    };
    this.onAudioDeviceSelected = this.onAudioDeviceSelected.bind(this);
    this.setVideoDevice = this.setVideoDevice.bind(this);
    this.onOutputDeviceSelected = this.onOutputDeviceSelected.bind(this);
    this.onDeviceChange = this.onDeviceChange.bind(this);
    this.handleChangeLowBandwidthMode = this.handleChangeLowBandwidthMode.bind(this);
    this.onAudioTransparentModeChange = this.onAudioTransparentModeChange.bind(this);
    this.handleMaxVideoForwardingChange = this.handleMaxVideoForwardingChange.bind(this);
    this.onVirtualBackgroundModeChange = this.onVirtualBackgroundModeChange.bind(this);
    this.maxVFTimer = null;

    this.isIOS = isIOS();
  }

  componentDidMount() {
    this.initDevices();
    navigator.mediaDevices.addEventListener('devicechange', this.onDeviceChange);
  }

  static getDerivedStateFromProps(nextProps, prevState){
    let stateUpdate = {attendeesSettingsOpened: nextProps.attendeesSettingsOpened};
    // Check if it should run animation
    if (
        prevState.attendeesSettingsOpened == true &&
        nextProps.attendeesSettingsOpened == false
    ) {
      stateUpdate.runningAnimation = true;
    }
    return stateUpdate;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Check if it should stop animation
    if (
        prevProps.attendeesListOpened == true &&
        this.props.attendeesListOpened == false
    ) {
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
  }

  componentDidUpdate(prevProps, prevState) {

    if (
        prevProps.attendeesSettingsOpened == true &&
        this.props.attendeesSettingsOpened == false
    ) {
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
    //console.log(this.props.controlsStore.maxVideoForwarding, prevProps.controlsStore.maxVideoForwarding);
    if (
      this.props.controlsStore &&
        prevProps.controlsStore.maxVideoForwarding !== this.props.controlsStore.maxVideoForwarding
    ) {
      this.setState({
        maxVideoForwarding: this.props.controlsStore.maxVideoForwarding,
        lowBandwidthMode: !this.props.controlsStore.videoEnabled && !this.props.controlsStore.maxVideoForwarding
      });
    }
    if (
      this.props.controlsStore &&
        prevProps.controlsStore.audioTransparentMode !== this.props.controlsStore.audioTransparentMode
    ) {
      this.setState({
        audioTransparentMode: this.props.controlsStore.audioTransparentMode,
      });
    }
    if (
      this.props.controlsStore &&
        prevProps.controlsStore.videoEnabled !== this.props.controlsStore.videoEnabled
    ) {
      this.setState({
        videoEnabled: this.props.controlsStore.videoEnabled,
      });
    }
    if (
      this.props.controlsStore &&
        prevProps.controlsStore.videoEnabled !== this.props.controlsStore.videoEnabled
    ) {
      this.setState({ lowBandwidthMode: !this.props.controlsStore.videoEnabled && !this.props.controlsStore.maxVideoForwarding });
    }

    if (
      this.props.controlsStore &&
        prevProps.controlsStore.virtualBackgroundMode !== this.props.controlsStore.virtualBackgroundMode
    ) {
      console.log('virtualBackgroundMode changed %s -> %s', prevProps.controlsStore.virtualBackgroundMode, this.props.controlsStore.virtualBackgroundMode)
      this.setState({ virtualBackgroundMode: this.props.controlsStore.virtualBackgroundMode });
    }

    if (
        this.props.controlsStore.videoEnabled !=
        prevProps.controlsStore.videoEnabled ||
        this.props.controlsStore.audioEnabled !=
        prevProps.controlsStore.audioEnabled
    ) {
      this.initDevices();
    }
  }

  componentWillUnmount() {
    navigator.mediaDevices.removeEventListener('devicechange', this.onDeviceChange);
  }

  onDeviceChange() {
    this.initDevices();
  }

  initDevices() {
    VoxeetSDK.mediaDevice.enumerateAudioDevices("input").then(devices => {
        this.setState({ audioDevices: devices });

        // Pick out an audio input device:
        // 1. use a current selected device
        // 2. OR use a default device
        // 3. OR use the first device from the device list
        const deviceInfo =
          devices.length && (
            devices.find(e => e.deviceId === this.props.inputManager.currentAudioDevice)
            || devices.find(e => e.deviceId === "default")
            || devices[0]
          );

        // If the selected device is default, select it by using its proper deviceId
        // (other than "default") but keep UI informed that the "default" is still selected.
        if (deviceInfo.deviceId === "default") {
          return this.setAudioDevice(
            devices.find(e => e.groupId === deviceInfo.groupId
                           && e.deviceId !== "default")
              .deviceId,
            "default");
        }

        return this.setAudioDevice(deviceInfo.deviceId);
      })
      .catch(e => console.error("Initializing an audio input device failed.", e));

    VoxeetSDK.mediaDevice.enumerateAudioDevices("output").then(devices => {
        this.setState({ outputDevices: devices });

        // Pick out an audio output device:
        // 1. use a current selected device
        // 2. OR use a default device
        // 3. OR use the first device from the device list
        const deviceInfo =
          devices.length && (
            devices.find(e => e.deviceId === this.props.inputManager.currentOutputDevice)
            || devices.find(e => e.deviceId === "default")
            || devices[0]
          );

        return this.setOutputDevice(deviceInfo.deviceId);
      })
      .catch(e => console.error("Initializing an audio output device failed.", e));


    VoxeetSDK.mediaDevice.enumerateVideoDevices().then(devices => {
      if (this.props.inputManager.currentVideoDevice != "") {
        let exist = false;
        devices.map((device, i) => {
          if (device.deviceId == this.props.inputManager.currentVideoDevice && device.deviceId != "") {
            exist = true;
          }
        });
        if (!exist && devices.length) {
          let selected_device = devices.find(device => device.deviceId == 'default');
          if (!selected_device)
            selected_device = devices[0];
          Cookies.set("camera", selected_device.deviceId, default_cookies_param);
          getVideoDeviceName(selected_device.deviceId)
            .then((isBackCamera) => {
              this.props.dispatch(InputManagerActions.inputVideoChange(selected_device.deviceId, isBackCamera))
            })
        }
      }
      this.setState({
        videoDevices: devices
      });
    })
    .catch((e) => console.error(e));
  }

  onOutputDeviceSelected(e) {
    this.setOutputDevice(e.target.value).catch(e =>
      console.error("Selecting audio output device failed.", e)
    );
  }

  setOutputDevice(deviceId) {
    return VoxeetSDK.mediaDevice.selectAudioOutput(deviceId).then(() => {
      Cookies.set("output", deviceId, default_cookies_param);
      this.props.dispatch(InputManagerActions.outputAudioChange(deviceId));
    });
  }

  onAudioDeviceSelected(e) {
    this.setAudioDevice(e.target.value).catch(e =>
      console.error("Selecting audio input device failed.", e)
    );
  }

  setAudioDevice(deviceId, guiDeviceId = deviceId) {
    return VoxeetSDK.mediaDevice.selectAudioInput(deviceId).then(() => {
      if (this.props.microphoneMuted) {
        VoxeetSDK.conference
          .mute(VoxeetSDK.session.participant, true)
          .catch((e) => console.warn("Muting a new selected input device failed.", e));
      }

      Cookies.set("input", guiDeviceId, default_cookies_param);
      this.props.dispatch(InputManagerActions.inputAudioChange(guiDeviceId));
    });
  }

  setVideoDevice(e) {
    const { videoEnabled } = this.props;
    const deviceId = e.target.value;
    if (videoEnabled) {
      VoxeetSDK.mediaDevice.selectVideoInput(deviceId);
    }
    Cookies.set("camera", deviceId, default_cookies_param);
    getVideoDeviceName(deviceId)
      .then((isBackCamera, currentVideoDevice) => {
        this.props.dispatch(InputManagerActions.inputVideoChange(deviceId, isBackCamera))
      })
  }

  onAudioTransparentModeChange() {
    const { audioTransparentMode } = this.props.controlsStore;
    this.setState({
      audioTransparentMode: !audioTransparentMode
    }, () => {
      Cookies.set('audioTransparentMode', this.state.audioTransparentMode, default_cookies_param);
      this.props.dispatch(ConferenceActions.setAudioTransparentMode(this.state.audioTransparentMode));
    })
  }

  onVirtualBackgroundModeChange(mode) {
    console.log('onVirtualBackgroundModeChange', mode);
    this.setState({
      virtualBackgroundMode: mode!==this.state.virtualBackgroundMode?mode:null
    }, () => {
      console.log('about to call ConferenceActions.setVirtualBackgroundMode', this.state.virtualBackgroundMode);
      this.props.dispatch(ConferenceActions.setVirtualBackgroundMode(this.state.virtualBackgroundMode));
    });
  }

  handleChangeLowBandwidthMode(event) {
    if (this.maxVFTimer) {
      clearTimeout(this.maxVFTimer);
      this.maxVFTimer = null;
    }
    const low_bandwidth = event.target.checked;
    let maxVideoForwarding = low_bandwidth?0:(Cookies.get("maxVideoForwarding")!==undefined?Cookies.get("maxVideoForwarding"):(isMobile()?4:9));
    if(typeof maxVideoForwarding === 'string' || maxVideoForwarding instanceof String)
      maxVideoForwarding = parseInt(maxVideoForwarding);

    if(low_bandwidth) {
      // Get current videoEnabled status
      let videoEnabled = ((this.props.controlsStore.videoEnabled !== undefined) ? this.props.controlsStore.videoEnabled : true);
      // Cookies.set('videoEnabled', false, default_cookies_param);
      if(videoEnabled) {
        // Disable if enabled, don't change if already disabled
        this.props.dispatch(ConferenceActions.toggleVideo(true));
      }
      // Don't change maxVideoForwarding value in cookies
      // Cookies.set("maxVideoForwarding", 0, default_cookies_param);
      this.props.dispatch(ConferenceActions.setMaxVideoForwarding(maxVideoForwarding));
    } else {
      // Don't enable video, don't touch a value in cookies
      // Cookies.set('videoEnabled', true, default_cookies_param);
      // this.props.dispatch(ConferenceActions.toggleVideo(low_bandwidth));
      // Don't change maxVideoForwarding value in cookies
      // Cookies.set("maxVideoForwarding", maxVideoForwarding, default_cookies_param);
      // Revert to value stored in cookies
      this.props.dispatch(ConferenceActions.setMaxVideoForwarding(maxVideoForwarding));
    }
  }

  handleMaxVideoForwardingChange(event) {
    if (this.maxVFTimer) {
      clearTimeout(this.maxVFTimer);
      this.maxVFTimer = null;
    }
    let num;
    const maxVF = event.target.value;

    try { num = parseInt(maxVF) } catch (e) { };
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
    }
    else {
      this.setState({ maxVideoForwarding: '' });
    }
  }

  render() {
    const { lowBandwidthMode, maxVideoForwarding, audioTransparentMode, virtualBackgroundMode, videoEnabled } = this.state;
    //const { audioTransparentMode } = this.props.controlsStore;

    const { attendeesSettingsOpened, isListener, dolbyVoiceEnabled } = this.props;
    const MAX_MAXVF = isMobile()?4:16;
    const {
      currentAudioDevice,
      currentVideoDevice,
      currentOutputDevice
    } = this.props.inputManager;
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
              {bowser.chrome && (
                <div className="form-group form-output">
                  {/* <label htmlFor="output">Sound Output</label> */}
                  <select
                    name="output"
                    value={currentOutputDevice}
                    className="form-control select-audio-output"
                    onChange={this.onOutputDeviceSelected}
                    disabled={false}
                  >
                    {this.state.outputDevices.map((device, i) => (
                      <option key={i} value={device.deviceId}>
                        {device.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {!isListener &&
                (<Fragment>
                  <div className="form-group last">
                    {/* <label htmlFor="video">Camera</label> */}
                    <select
                      name="video"
                      value={currentVideoDevice}
                      className="form-control select-video-device"
                      onChange={this.setVideoDevice}
                      disabled={false}
                    >
                      {this.state.videoDevices.map((device, i) => (
                        <option key={i} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    {/* <label htmlFor="video">Microphone</label> */}
                    <select
                      name="audio"
                      value={currentAudioDevice}
                      className="form-control select-audio-input"
                      onChange={this.onAudioDeviceSelected}
                    >
                      {this.state.audioDevices.map((device, i) => (
                        <option key={i} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    {(this.isIOS || bowser.safari) ?
                      <AttendeesSettingsVuMeterFromAudioLevel maxLevel={21} /> :
                      <AttendeesSettingsVuMeterFromMediaStream maxLevel={21} />}
                  </div>
                  {dolbyVoiceEnabled && <div className="form-group switch-enable">
                    <div className='switch-mode'>
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
                  </div>}
                </Fragment>)
              }
                <div className="form-group switch-enable">
                  <div className='switch-mode'>
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
                {isElectron() && <div className={`form-group switch-enable ${!videoEnabled ? 'disabled-form' : ''}`}>
                  <div className='switch-mode'>
                    <input
                        id="vbModeBokeh"
                        name="vbModeBokeh"
                        type="checkbox"
                        onChange={() => this.onVirtualBackgroundModeChange('bokeh')}
                        checked={virtualBackgroundMode == 'bokeh'}
                    />
                    <label htmlFor="vbModeBokeh">
                      {strings.bokehMode}
                    </label>
                  </div>
                </div>}
                <div className={`form-group switch-enable maxVideoForwarding ${lowBandwidthMode ? 'disabled-form' : ''}`}>
                  <div className='input-wrapper'>
                    <div className='input-value'>0</div>
                    <input
                      type="range"
                      style={{ background: `linear-gradient(to right, #00afef 0%, #00afef ${(100 / MAX_MAXVF) * (!lowBandwidthMode ? maxVideoForwarding : 0)}%, #fff ${(100 / MAX_MAXVF) * (!lowBandwidthMode ? maxVideoForwarding : 0)}%, #fff 100%)` }}
                      id="maxVideoForwarding"
                      name="maxVideoForwarding"
                      min={0}
                      max={MAX_MAXVF}
                      step={1}
                      onChange={this.handleMaxVideoForwardingChange}
                      value={!lowBandwidthMode ? maxVideoForwarding : 0}
                    />
                    <div className='input-value'>{MAX_MAXVF}</div>
                  </div>
                  <label htmlFor="maxVideoForwarding">
                    <div className='maxVideoForwardingValue'>{`${strings.showVideoParticipants1} ${!lowBandwidthMode ? maxVideoForwarding : 0} ${strings.showVideoParticipants2}`}</div>
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
