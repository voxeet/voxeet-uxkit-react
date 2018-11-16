import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import CameraOn from '../../../../static/images/newicons/icon-camera-on.svg'
import CameraOff from '../../../../static/images/newicons/icon-camera-off.svg'

let strings = new LocalizedStrings({
 en:{
   video: "Video"
 },
 fr: {
   video: "Caméra"
 }
});

class ToggleVideoButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          hover: false
        }
    }

    render() {
        const { videoEnabled, toggle, tooltipPlace, isBottomBar } = this.props
        const { hover } = this.state

        return (
            <li className={videoEnabled ? 'active' : ''}
              onMouseEnter={() => this.setState({hover: true})}
              onMouseLeave={() => this.setState({hover: false})}>
                <a data-tip data-for="toggle-video"
                    title={strings.video}
                    onClick={() => toggle()}>
                    <img src={(videoEnabled || hover) ? CameraOn : CameraOff} />
                    {isBottomBar &&
                      <div><span>{strings.video}</span></div>
                    }
                </a>
                { !isBottomBar &&
                  <ReactTooltip id="toggle-video" place={tooltipPlace} effect="solid" className="tooltip">{strings.video}</ReactTooltip>
                }
            </li>
        )
    }
}

ToggleVideoButton.propTypes = {
    videoEnabled: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
    isBottomBar: PropTypes.bool.isRequired
};

ToggleVideoButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleVideoButton
