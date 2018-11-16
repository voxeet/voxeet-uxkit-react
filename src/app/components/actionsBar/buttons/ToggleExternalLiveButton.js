import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import liveOff from '../../../../static/images/newicons/icon-broadcast-off.svg'
import liveOn from '../../../../static/images/newicons/icon-broadcast-on.svg'

let strings = new LocalizedStrings({
 en:{
   live: "Live Broadcast",
 },
 fr: {
   live: "Diffusion en direct",
 }
});

class ToggleExternalLiveButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          hover: false
        }
    }

    render() {
        const { displayModal, toggle, tooltipPlace, isExternalLive, isBottomBar } = this.props
        const { hover } = this.state
        return (
            <li className={isExternalLive ? 'active' : ''}
                onMouseEnter={() => this.setState({hover: true})}
                onMouseLeave={() => this.setState({hover: false})}>
                <a data-tip data-for="toggle-externalLive"
                    className={' ' + (isExternalLive ? 'on' : 'off')}
                    title={strings.live}
                    onClick={() => toggle()}>
                    <img src={(isExternalLive || hover) ? liveOn : liveOff} />
                    { isBottomBar &&
                      <div><span>{strings.live}</span></div>
                    }
                </a>
                { !isBottomBar &&
                  <ReactTooltip id="toggle-mute" place={tooltipPlace} effect="solid" className="tooltip">{strings.live}</ReactTooltip>
                }
            </li>
        )
    }
}

ToggleExternalLiveButton.propTypes = {
    toggle: PropTypes.func.isRequired,
    isExternalLive: PropTypes.bool.isRequired,
    isBottomBar: PropTypes.bool.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
};

ToggleExternalLiveButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleExternalLiveButton
