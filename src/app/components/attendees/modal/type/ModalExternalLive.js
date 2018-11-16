import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import Sdk from '../../../../sdk'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
 en:{
   externalUrl:"Enter your stream url from your channel",
   externalPassword:"Enter your password from your live",
   launchLive: "Go live",
   geturl: "Get your stream url (on Youtube or Facebook)",
   getpwd: "Get your stream password (on Youtube or Facebook)",
   enterhere: "Enter your informations here :",
   liveurl: "Stream url :",
   passwordurl: "Stream key or password :"
 },
 fr: {
   externalUrl:"Entrez l'url de la diffusion en direct",
   externalPassword:"Entrez le mot de passe de la diffusion en direct",
   launchLive: "Lancer la diffusion en direct",
   geturl: "Récupérez l'url de la diffusion en direct (Youtube ou Facebook)",
   getpwd: "Récupérez le mot de passe de la diffusion en direct",
   enterhere: "Entrez vos informations içi :",
   liveurl: "URL de la diffusion en direct :",
   passwordurl: "Mot de passe de la diffusion en direct :"
 }
});

class ModalExternalLive extends Component {

    constructor(props) {
        super(props);
        this.state = {
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
      const { modalAction } = this.props
      const { thirdPartyUrl,thirdPartyPassword } = this.state
      modalAction(thirdPartyUrl, thirdPartyPassword)
    }

    render() {
        return (
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
                    <input onChange={this.handleChangePassword} type="password" placeholder={strings.externalPassword} name="thirdPartyPassword"/>
                  </div>
                </li>
              </ul>
              <button onClick={this.modalAction.bind(this)} type="submit">{strings.launchLive}</button>
            </div>
        )
    }
}

ModalExternalLive.defaultProps = {
}

ModalExternalLive.propTypes = {
    toggle: PropTypes.func,
    modalAction: PropTypes.func
}

export default ModalExternalLive
