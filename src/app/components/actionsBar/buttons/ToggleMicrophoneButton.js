import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import MuteOn from '../../../../static/images/newicons/icon-mute-on.svg'
import MuteOff from '../../../../static/images/newicons/icon-mute-off.svg'

let strings = new LocalizedStrings({
 en:{
   mute: "Mute"
 },
 fr: {
   mute: "Muet"
 }
});

class ToggleMicrophoneButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          hover: false
        }
    }

    render() {
        const { isMuted, toggle, tooltipPlace, isBottomBar } = this.props
        const { hover } = this.state
        return (
            <li className={isMuted ? 'active' : ''}
                onMouseEnter={() => this.setState({hover: true})}
                onMouseLeave={() => this.setState({hover: false})}>
                <a data-tip data-for="toggle-mute"
                    className={' ' + (isMuted ? 'on' : 'off')}
                    title={strings.mute}
                    onClick={() => toggle()}>
                    <img src={(isMuted || hover) ? MuteOn : MuteOff} />
                    { isBottomBar &&
                      <div><span>{strings.mute}</span></div>
                    }
                </a>
                { !isBottomBar &&
                  <ReactTooltip id="toggle-mute" place={tooltipPlace} effect="solid" className="tooltip">{strings.mute}</ReactTooltip>
                }
            </li>
        )
    }
}

ToggleMicrophoneButton.propTypes = {
    toggle: PropTypes.func.isRequired,
    isMuted: PropTypes.bool.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
    isBottomBar: PropTypes.bool.isRequired
};

ToggleMicrophoneButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleMicrophoneButton
