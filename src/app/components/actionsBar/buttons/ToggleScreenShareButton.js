import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import browser from 'bowser';
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux'
import { strings } from '../../../languages/localizedStrings';
import screenshare from '../../../../static/images/newicons/screenshare.svg'
import ShareScreenOn from '../../../../static/images/newicons/icon-share-screen-on.svg'
import ShareScreenOff from '../../../../static/images/newicons/icon-share-screen-off.svg'
import EntireScreenShareOff from '../../../../static/images/newicons/icon-screen-off.svg';
import WindowScreenShareOff from '../../../../static/images/newicons/icon-window-off.svg';
import FileShareOff from '../../../../static/images/newicons/icon-file-off.svg';
import VideoShareOff from '../../../../static/images/newicons/icon-video-off.svg';

@connect((store) => {
  return {
      filePresentationStore: store.voxeet.filePresentation
  }
})

class ToggleScreenShareButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          opened: false
        }
        this.togglePopUp = this.togglePopUp.bind(this)
        this.handleClickFilePresentation = this.handleClickFilePresentation.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.toggleScreenShare = this.toggleScreenShare.bind(this)
    }

    toggleScreenShare(type) {
      this.props.toggle(type)
      this.setState({ opened: !this.state.opened })
    }

    togglePopUp() {
      const { screenShareEnabled, filePresentationEnabled } = this.props
      if (!screenShareEnabled && !filePresentationEnabled) this.setState({ opened: !this.state.opened })
    }

    handleClickFilePresentation(e) {
      document.getElementById("filePresentationUpload").click()
    }

    handleChange(e) {
      this.props.convertFilePresentation(e.target.files[0])
      this.setState({ opened: !this.state.opened })
    }

    render() {
        const { screenShareEnabled, toggle, tooltipPlace, isBottomBar, isElectron, filePresentationEnabled, currentUserFilePresentation, currentUserScreenShare, shareActions } = this.props
        const { opened } = this.state
        const { fileConverted } = this.props.filePresentationStore
        return (
            <li id="screenshare-container" className={filePresentationEnabled || screenShareEnabled || opened ? 'active' : (fileConverted ? "conversion-running" : '')}>
                { fileConverted ?
                    <Fragment>
                      <div id="loader-container-file-presentation"><div className="loader-file-presentation"></div></div>
                      { 
                        isBottomBar && <a><div><span>{strings.share}</span></div></a>
                      }
                    </Fragment>
                  :
                    <Fragment>
                      <a data-tip data-for="toggle-screenshare"
                          className={'' + (opened ? 'on' : 'off')}
                          title={strings.screenshare}
                          onClick={() => { currentUserScreenShare || currentUserFilePresentation ? toggle() : this.togglePopUp()  }}>
                      <img src={(filePresentationEnabled || screenShareEnabled) ? ShareScreenOn : ShareScreenOff} />
                      { 
                        isBottomBar && <div><span>{strings.share}</span></div>
                      }
                      </a>
                    </Fragment>
                }
                { opened &&
                  <div className="bubble-tip">
                    <a className="icon-close" title="Close" currentitem="false" onClick={() => this.togglePopUp()}></a>
                    <span className="title">{strings.screenshareOption}</span>
                    { shareActions.indexOf("screenshare") > -1 && !browser.safari && !browser.msie &&
                          <div>
                            { browser.firefox ?
                                <Fragment>
                                  <a onClick={() => this.toggleScreenShare(["screen"])}><img src={EntireScreenShareOff} />{strings.screenshareEntireScreen}</a>
                                  <a onClick={() => this.toggleScreenShare(["window"])}><img src={WindowScreenShareOff} />{strings.screenshareAWindow}</a>
                                </Fragment>
                              :
                                <Fragment>
                                  <a onClick={() => this.toggleScreenShare(["screen", "window"])}><img src={EntireScreenShareOff} />{strings.screenshare}</a>
                                </Fragment>
                            }
                          </div>
                    }

                    { /*!isElectron &&
                      <a onClick={() => this.toggleScreenShare(["tab"])}><img src={FileShareOff} />Share a file</a>
                      <a onClick={() => this.toggleScreenShare(["tab"])}><img src={VideoShareOff} />Share a video</a>*/
                    }

                    { shareActions.indexOf("filepresentation") > -1 && 
                      <Fragment>
                        <a onClick={this.handleClickFilePresentation}><img src={FileShareOff} />{strings.filepresentation}</a>
                        <input type="file" id="filePresentationUpload" accept="application/pdf" onChange={this.handleChange} style={{display: "none"}}/>
                      </Fragment>
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
    shareActions: PropTypes.array.isRequired,
    screenShareEnabled: PropTypes.bool.isRequired,
    filePresentationEnabled: PropTypes.bool.isRequired,
    currentUserScreenShare: PropTypes.bool.isRequired,
    currentUserFilePresentation: PropTypes.bool.isRequired,
    convertFilePresentation: PropTypes.func.isRequired,
    toggle: PropTypes.func.isRequired,
    isElectron: PropTypes.bool.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
    isBottomBar: PropTypes.bool.isRequired
};

ToggleScreenShareButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleScreenShareButton
