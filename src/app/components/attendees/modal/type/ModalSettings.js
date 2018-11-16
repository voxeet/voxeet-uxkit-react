import React, { Component } from 'react'
import bowser from 'bowser'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'

import Sdk from '../../../../sdk'
import { Actions as InputManagerActions } from '../../../../actions/InputManagerActions';
import AttendeesParticipantVideo from '../../AttendeesParticipantVideo';
import ModalSettingsVuMeter from './ModalSettingsVuMeter';
import LocalizedStrings from 'react-localization';
import MusicTest from '../../../../../static/sounds/voxeet_notif.mp3'



let strings = new LocalizedStrings({
 en:{
   titleSettings:"Set preferred camera and microphone",
   problemSettings:"If you are having problems, try restarting your browser.",
   saveSettings:"Your preferences will automatically save."
 },
 fr: {
   titleSettings:"Préférences caméra et microphone",
   problemSettings:"Si vous rencontrez des problèmes, veuillez essayer de redémarrer votre navigateur.",
   saveSettings:"Vos modifications seront automatiquement sauvegardées."
 }
});

@connect((store) => {
    return {
        inputManager: store.voxeet.inputManager
    }
})

class ModalSettings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            audioDevices: [],
            videoDevices: [],
            outputDevices: [],
            testAudio: null,
            testAudioPlaying: false
        }
        this.setAudioDevice = this.setAudioDevice.bind(this)
        this.setVideoDevice = this.setVideoDevice.bind(this)
        this.setOutputDevice = this.setOutputDevice.bind(this)
    }

    componentDidMount() {
        Sdk.instance.enumerateAudioDevices().then((devices) => {
            if (this.props.inputManager.currentAudioDevice != "") {
              let exist = false
              devices.map((device, i) => {
                if (device.deviceId == this.props.inputManager.currentAudioDevice) {
                  exist = true
                }
              })
              if (!exist) this.props.dispatch(InputManagerActions.inputAudioChange(devices[0].deviceId))
            }
            this.setState({
                audioDevices: devices
            })
        })

        Sdk.instance.enumerateAudioDevices("output").then((devices) => {
            if (this.props.inputManager.currentOutputDevice != "") {
              let exist = false
              devices.map((device, i) => {
                if (device.deviceId == this.props.inputManager.currentOutputDevice) {
                  exist = true
                }
              })
              if (!exist) this.props.dispatch(InputManagerActions.outputAudioChange(devices[0].deviceId))
            }
            this.setState({
                outputDevices: devices
            })
        })

        Sdk.instance.enumerateVideoDevices().then((devices) => {
            this.setState({
                videoDevices: devices
            })
        })


    }

    setOutputDevice(e) {
        Sdk.instance.selectAudioOutput(e.target.value).then(() => {
        })
        this.props.dispatch(InputManagerActions.outputAudioChange(e.target.value))
    }

    setAudioDevice(e) {
        Sdk.instance.selectAudioInput(e.target.value).then(() => {
          if (this.props.microphoneMuted) {
            Sdk.instance.toggleMute(Sdk.instance.userId)
          }
        })
        this.props.dispatch(InputManagerActions.inputAudioChange(e.target.value))
    }

    setVideoDevice(e) {
        Sdk.instance.selectVideoInput(e.target.value).then(() => {
        })
        this.props.dispatch(InputManagerActions.inputVideoChange(e.target.value))
    }

    testVolumeClick() {
      if (!this.state.testAudioPlaying) {
        const testAudio = new Audio(MusicTest)
        testAudio.volume = 0.3
        testAudio.play()
        this.setState({ testAudio: testAudio, testAudioPlaying: true })
      } else {
        this.state.testAudio.pause()
        this.setState({ testAudio: null, testAudioPlaying: false })
      }
    }

    render() {
        const { toggle, toggleVideo, videoEnabled, userStream } = this.props
        const { currentAudioDevice, currentVideoDevice, currentOutputDevice } = this.props.inputManager
        return (
                  <div>
                    <h3>{strings.titleSettings}</h3>
                    <form>
                        <div className="form-group">
                            <label htmlFor="video">Microphone</label>
                            <select name="audio" value={currentAudioDevice} className="form-control" onChange={this.setAudioDevice}>
                                {this.state.audioDevices.map((device, i) =>
                                    <option key={i} value={device.deviceId}>{device.label}</option>
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <ModalSettingsVuMeter />
                        </div>

                        { bowser.chrome &&
                        <div className="form-group form-output">
                            <label htmlFor="output">Sound Output</label>
                            <select name="output" value={currentOutputDevice} className="form-control" onChange={this.setOutputDevice} disabled={false}>
                                {this.state.outputDevices.map((device, i) =>
                                    <option key={i} value={device.deviceId}>{device.label}</option>
                                )}
                            </select>
                        </div>
                        }
                        {
                        /*<a className="test-volume" onClick={() => this.testVolumeClick()}>
                          Test volume
                        </a>*/
                        }
                        <div className="form-group last">
                            <label htmlFor="video">Camera</label>
                            <select name="video" value={currentVideoDevice} className="form-control" onChange={this.setVideoDevice} disabled={false}>
                                {this.state.videoDevices.map((device, i) =>
                                    <option key={i} value={device.deviceId}>{device.label}</option>
                                )}
                            </select>
                        </div>
                        {!window.voxeetNodeModule &&
                            <div className="video">
                                {videoEnabled  ?
                                    <AttendeesParticipantVideo
                                        width="360"
                                        height="280"
                                        stream={userStream}
                                    />
                                    :
                                    <div className="btn">
                                        <a data-tip data-for="toggle-video"
                                            className={'icon-camera-video ' + (videoEnabled ? 'on' : 'off')}
                                            title="Video"
                                            onClick={() => toggleVideo()}>
                                        </a>
                                    </div>
                                }
                            </div>
                        }
                        <div className="hint-text">
                          <p>{strings.problemSettings}</p>
                          <p>{strings.saveSettings}</p>
                        </div>
                    </form>
                  </div>
        )
    }
}

ModalSettings.defaultProps = {
}

ModalSettings.propTypes = {
    toggle: PropTypes.func,
    microphoneMuted: PropTypes.bool,
    toggleVideo: PropTypes.func,
    videoEnabled: PropTypes.bool,
    userStream: PropTypes.object,
}

export default ModalSettings
