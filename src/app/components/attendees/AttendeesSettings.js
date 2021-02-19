import React, { Component, Fragment } from "react";
import bowser from "bowser";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import ReactTooltip from "react-tooltip";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import Cookies from "js-cookie";
import { Actions as InputManagerActions } from "../../actions/InputManagerActions";
import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import AttendeesParticipantVideo from "./AttendeesParticipantVideo";
import PreConfigVuMeter from "./../preConfig/PreConfigVuMeter";
import AttendeesSettingsVuMeter from "./AttendeesSettingsVuMeter";
import { strings } from "../../languages/localizedStrings";
import { getVideoDeviceName } from "./../../libs/getVideoDeviceName";
import {isIOS, isMobile} from "./../../libs/browserDetection";
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

    this.state = {
      runningAnimation: false,
      audioDevices: [],
      videoDevices: [],
      outputDevices: [],
      testAudio: null,
      testAudioPlaying: false,
      audioTransparentMode: audioTransparentMode,
      maxVideoForwarding: maxVideoForwarding,
      lowBandwidthMode: lowBandwidthMode
    };
    this.setAudioDevice = this.setAudioDevice.bind(this);
    this.setVideoDevice = this.setVideoDevice.bind(this);
    this.setOutputDevice = this.setOutputDevice.bind(this);
    this.onDeviceChange = this.onDeviceChange.bind(this);
    this.handleChangeLowBandwidthMode = this.handleChangeLowBandwidthMode.bind(this);
    this.onAudioTransparentModeChange = this.onAudioTransparentModeChange.bind(this);
    this.handleMaxVideoForwardingChange = this.handleMaxVideoForwardingChange.bind(this);
    this.maxVFTimer = null;

    this.isIOS = isIOS();
  }

  componentDidMount() {
    this.initDevices();
    navigator.mediaDevices.addEventListener('devicechange', this.onDeviceChange);
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this.props.attendeesSettingsOpened == true &&
      nextProps.attendeesSettingsOpened == false
    ) {
      this.setState({ runningAnimation: true });
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
  }

  componentDidUpdate(prevProps, prevState) {

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
      this.setState({ lowBandwidthMode: !this.props.controlsStore.videoEnabled && !this.props.controlsStore.maxVideoForwarding });
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
    VoxeetSDK.mediaDevice.enumerateAudioDevices().then(devices => {
      if (this.props.inputManager.currentAudioDevice != "") {
        let exist = false;
        devices.map((device, i) => {
          if (device.deviceId == this.props.inputManager.currentAudioDevice && device.deviceId != "") {
            exist = true;
          }
        });
        if (!exist && devices.length) {
          let selected_device = devices.find(device => device.deviceId == 'default');
          if (!selected_device)
            selected_device = devices[0];
          Cookies.set("input", selected_device.deviceId, default_cookies_param);
          this.props.dispatch(
            InputManagerActions.inputAudioChange(selected_device.deviceId)
          );
        }
      }
      this.setState({
        audioDevices: devices
      });
    });

    VoxeetSDK.mediaDevice.enumerateAudioDevices("output").then(devices => {
      if (this.props.inputManager.currentOutputDevice != "") {
        let exist = false;
        devices.map((device, i) => {
          if (
            device.deviceId == this.props.inputManager.currentOutputDevice && device.deviceId != ""
          ) {
            exist = true;
          }
        });
        if (!exist && devices.length) {
          let selected_device = devices.find(device => device.deviceId == 'default');
          if (!selected_device)
            selected_device = devices[0];
          Cookies.set("output", selected_device.deviceId, default_cookies_param);
          this.props.dispatch(
            InputManagerActions.outputAudioChange(selected_device.deviceId)
          );
        }
      }
      this.setState({
        outputDevices: devices
      });
    });

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
    });
  }

  setOutputDevice(e) {
    const deviceId = e.target.value;
    VoxeetSDK.mediaDevice.selectAudioOutput(deviceId);
    Cookies.set("output", deviceId, default_cookies_param);
    this.props.dispatch(InputManagerActions.outputAudioChange(deviceId));
  }

  setAudioDevice(e) {
    const deviceId = e.target.value;
    VoxeetSDK.mediaDevice.selectAudioInput(deviceId).then(() => {
      Cookies.set("input", deviceId, default_cookies_param);
      if (this.props.microphoneMuted) {
        VoxeetSDK.conference.toggleMute(VoxeetSDK.session.participant);
      }
      this.props.dispatch(InputManagerActions.inputAudioChange(deviceId));
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
    const { lowBandwidthMode, maxVideoForwarding, audioTransparentMode } = this.state;
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
                    onChange={this.setOutputDevice}
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
                      onChange={this.setAudioDevice}
                    >
                      {this.state.audioDevices.map((device, i) => (
                        <option key={i} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    {(this.isIOS) ?
                      <AttendeesSettingsVuMeter maxLevel={21} /> :
                      <PreConfigVuMeter maxLevel={21} />}
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
  maxVideoForwarding: PropTypes.number
};

export default AttendeesSettings;
