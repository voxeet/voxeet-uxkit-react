import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization';

import Sdk from '../../sdk'
import { Actions as ConferenceActions } from '../../actions/ConferenceActions'
import AttendeesParticipantVideo from './AttendeesParticipantVideo';
import ModalSettingsVuMeter from './modal/type/ModalSettingsVuMeter';


let strings = new LocalizedStrings({
  en:{
    externalUrl:"Configure your stream",
    externalPassword:"Enter your password from your live",
    launchLive: "Start your stream",
    geturl: "Get your stream url (on Youtube or Facebook)",
    getpwd: "Get your stream password (on Youtube or Facebook)",
    enterhere: "Enter your informations here :",
    liveurl: "Stream url :",
    passwordurl: "Stream key or password :"
  },
  fr: {
    externalUrl:"Entrez l'url de la diffusion en direct",
    externalPassword:"Entrez le mot de passe de la diffusion en direct",
    launchLive: "Lancer le direct",
    geturl: "Récupérez l'url de la diffusion en direct (Youtube ou Facebook)",
    getpwd: "Récupérez le mot de passe de la diffusion en direct",
    enterhere: "Entrez vos informations içi :",
    liveurl: "URL de la diffusion en direct :",
    passwordurl: "Mot de passe de la diffusion en direct :"
  }
});

class AttendeesWaitingWebinarPresenter extends Component {

    constructor(props) {
        super(props)
        this.state = {
            audioDevices: [],
            videoDevices: [],
            thirdPartyUrl: null,
            thirdPartyPassword: null
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleChangePassword = this.handleChangePassword.bind(this)
    }

    handleChange(e) {
      this.setState({ thirdPartyUrl: e.target.value });
    }

    handleChangePassword(e) {
      this.setState({ thirdPartyPassword: e.target.value });
    }

    modalAction() {
      const { modalExternalAction } = this.props
      const { thirdPartyUrl,thirdPartyPassword } = this.state
      modalExternalAction(thirdPartyUrl, thirdPartyPassword)
    }


    componentDidMount() {
        Sdk.instance.enumerateAudioDevices().then((devices) => {
            this.setState({
                audioDevices: devices
            })
        })

        Sdk.instance.enumerateVideoDevices().then((devices) => {
            this.setState({
                videoDevices: devices
            })
        })
    }

    setAudioDevice(e) {
        Sdk.instance.selectAudioInput(e.target.value).then(() => {
        })
    }

    setVideoDevice(e) {
        Sdk.instance.selectVideoInput(e.target.value).then(() => {
        })
    }

    render() {
        const { toggleVideo, videoEnabled, userStream, toggleWebinarState } = this.props

        return (
                <div className="settings-webinar-presenter">
                  <div className="settings-webinar-presenter">
                      <div className="content">
                        <h3>Set up your webinar</h3>
                          <form>
                            <div className="form-group">
                                <label htmlFor="video">Microphone</label>
                                <select name="audio" className="form-control" onChange={this.setAudioDevice}>
                                    {this.state.audioDevices.map((device, i) =>
                                        <option key={i} value={device.deviceId}>{device.label}</option>
                                    )}
                                </select>
                            </div>
                            <div className="form-group">
                                <ModalSettingsVuMeter />
                            </div>
                            <div className="form-group">
                                <label htmlFor="video">Video</label>
                                <select name="video" className="form-control" onChange={this.setVideoDevice} disabled={false}>
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
                          </form>

                        <div className="modal-thirdparty">
                          <h3>{strings.externalUrl}</h3>
                          <ul className="ul-external-live">
                            <li>
                              1. {strings.geturl}
                            </li>
                            <li>
                              2. {strings.getpwd}
                            </li>
                            <li>
                              3. {strings.enterhere}
                            </li>
                            <li>
                              <div>
                                <label>{strings.liveurl}</label>
                                <input onChange={this.handleChange} placeholder={strings.externalUrl} name="thirdPartyUrl"/>
                              </div>
                              <div>
                                <label>{strings.passwordurl}</label>
                                <input id="password" onChange={this.handleChangePassword} type="password" placeholder={strings.externalPassword} name="thirdPartyPassword"/>
                                <button onClick={this.modalAction.bind(this)} type="submit">{strings.launchLive}</button>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div>
                        <a className="start-live-webinar" onClick={() => toggleWebinarState()}>
                          Start webinar
                        </a>
                        </div>
                      </div>
                    </div>
                  </div>
        )
    }
}

AttendeesWaitingWebinarPresenter.propTypes = {
  toggleVideo: PropTypes.func,
  toggleWebinarState: PropTypes.func,
  videoEnabled: PropTypes.bool,
  userStream: PropTypes.object,
  modalExternalAction: PropTypes.func
}

export default AttendeesWaitingWebinarPresenter
