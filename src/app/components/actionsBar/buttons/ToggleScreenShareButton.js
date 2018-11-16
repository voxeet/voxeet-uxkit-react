import React, { Component } from 'react'
import PropTypes from 'prop-types'
import browser from 'bowser';
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import screenshare from '../../../../static/images/newicons/screenshare.svg'
import ShareScreenOn from '../../../../static/images/newicons/icon-share-screen-on.svg'
import ShareScreenOff from '../../../../static/images/newicons/icon-share-screen-off.svg'
import EntireScreenShareOff from '../../../../static/images/newicons/icon-screen-off.svg';
import WindowScreenShareOff from '../../../../static/images/newicons/icon-window-off.svg';
import FileShareOff from '../../../../static/images/newicons/icon-file-off.svg';
import VideoShareOff from '../../../../static/images/newicons/icon-video-off.svg';

let strings = new LocalizedStrings({
 en:{
   screenshare: "Share Screen",
   screenshareEntireScreen: "Share entire screen",
   screenshareAWindow: "Share a window",
   screenshareOption: "Share options"
 },
 fr: {
   screenshare: "Partage d'écran",
   screenshareEntireScreen: "Écran entier",
   screenshareAWindow: "Fenêtre du navigateur",
   screenshareOption: "Partage d'écran"
 }
});

class ToggleScreenShareButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          opened: false
        }
        this.togglePopUp = this.togglePopUp.bind(this)
        this.toggleScreenShare = this.toggleScreenShare.bind(this)
    }

    toggleScreenShare(type) {
      this.props.toggle(type)
      this.setState({ opened: !this.state.opened })
    }

    togglePopUp() {
      this.setState({ opened: !this.state.opened })
    }

    render() {
        const { screenShareEnabled, toggle, tooltipPlace, isBottomBar, isElectron } = this.props
        const { opened } = this.state
        return (
            <li id="screenshare-container" className={screenShareEnabled || opened ? 'active' : ''}>
                <a data-tip data-for="toggle-screenshare"
                    className={'' + (opened ? 'on' : 'off')}
                    title={strings.screenshare}
                    onClick={() => {screenShareEnabled ? toggle() : this.togglePopUp()}}>
                    <img src={screenShareEnabled ? ShareScreenOn : ShareScreenOff} />
                    { isBottomBar &&
                      <div><span>{strings.screenshare}</span></div>
                    }
                </a>
                { opened &&
                  <div className="bubble-tip">
                    <a className="icon-close" title="Close" currentitem="false" onClick={() => this.togglePopUp()}></a>
                    <span className="title">{strings.screenshareOption}</span>

                    { browser.firefox ?
                        <div>
                          <a onClick={() => this.toggleScreenShare(["screen"])}><img src={EntireScreenShareOff} />{strings.screenshareEntireScreen}</a>
                          <a onClick={() => this.toggleScreenShare(["window"])}><img src={WindowScreenShareOff} />{strings.screenshareAWindow}</a>
                        </div>
                        :
                        <a onClick={() => this.toggleScreenShare(["screen", "window"])}><img src={EntireScreenShareOff} />{strings.screenshare}</a>
                    }

                    { /*!isElectron &&
                      <a onClick={() => this.toggleScreenShare(["tab"])}><img src={FileShareOff} />Share a file</a>
                      <a onClick={() => this.toggleScreenShare(["tab"])}><img src={VideoShareOff} />Share a video</a>*/
                    }





                    <div className="anchor-popup">
                    </div>
                  </div>
                }
                { !isBottomBar &&
                  <ReactTooltip id="toggle-screenshare" place={tooltipPlace} effect="solid" className="tooltip">{strings.screenshare}</ReactTooltip>
                }
            </li>
        )
    }
}

ToggleScreenShareButton.propTypes = {
    screenShareEnabled: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    isElectron: PropTypes.bool.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
    isBottomBar: PropTypes.bool.isRequired
};

ToggleScreenShareButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleScreenShareButton
