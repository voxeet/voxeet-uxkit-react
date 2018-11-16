import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'

import Sdk from '../../../sdk'
import AttendeesParticipantVideo from '../AttendeesParticipantVideo';
import ModalSettingsVuMeter from './type/ModalSettingsVuMeter';
import ModalSettings from './type/ModalSettings';
import ModalExternalLive from './type/ModalExternalLive';
import ModalError from './type/ModalError';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
 en:{
   close:"Close"
 },
 fr: {
   close:"Fermer"
 }
});

class Modal extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
    }

    render() {
        const { toggle, microphoneMuted, toggleVideo, videoEnabled, userStream, isModalSettings, isModalError, error, isModalExternalLive, modalAction } = this.props

        return (
          <div className="settings">
              <div className="content">
                  <span className="close">
                        <a data-tip data-for="toggle-close"
                          className='icon-close'
                          onClick={() => toggle()}
                          title={strings.close}>
                      </a>
                  </span>
                  <ReactTooltip id="toggle-close" place="left" effect="solid" className="tooltip">{strings.close}</ReactTooltip>
                    { isModalExternalLive &&
                        <ModalExternalLive
                          toggle={toggle}
                          modalAction={modalAction}
                        />
                    }
                    { isModalSettings &&
                        <ModalSettings
                          toggle={toggle}
                          toggleVideo={toggleVideo}
                          microphoneMuted={microphoneMuted}
                          videoEnabled={videoEnabled}
                          userStream={userStream}
                        />
                    }
                    { isModalError &&
                      <ModalError
                        toggle={toggle}
                        error={error}
                      />
                    }
              </div>
            </div>
        )
    }
}

Modal.defaultProps = {
  isModalSettings: false,
  isModalError: false,
  isModalExternalLive: false
}

Modal.propTypes = {
    isModalSettings: PropTypes.bool,
    isModalError: PropTypes.bool,
    isModalExternalLive: PropTypes.bool,
    modalAction: PropTypes.func,
    microphoneMuted: PropTypes.bool,
    error: PropTypes.string,
    toggle: PropTypes.func,
    toggleVideo: PropTypes.func,
    videoEnabled: PropTypes.bool,
    userStream: PropTypes.object,
}

export default Modal
