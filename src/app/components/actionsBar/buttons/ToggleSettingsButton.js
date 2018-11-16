import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import settings from '../../../../static/images/newicons/settings.svg'
import SettingsOn from '../../../../static/images/newicons/icon-settings-on.svg'
import SettingsOff from '../../../../static/images/newicons/icon-settings-off.svg'

let strings = new LocalizedStrings({
 en:{
   settings: "Settings"
 },
 fr: {
   settings: "Paramètres"
 }
});

class ToggleSettingsButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          hover: false
        }
    }

    render() {
        const { displayModal, toggle, tooltipPlace, isBottomBar } = this.props
        const { hover } = this.state
        return (
            <li id="settings-container" className={displayModal ? 'active' : ''}
                onMouseEnter={() => this.setState({hover: true})}
                onMouseLeave={() => this.setState({hover: false})}>
                <a data-tip data-for="toggle-settings"
                    className={' ' + (displayModal ? 'on' : 'off')}
                    onClick={() => toggle()}
                    title={strings.settings}>
                    <img src={(displayModal || hover) ? SettingsOn : SettingsOff} />
                    { isBottomBar &&
                      <div><span>{strings.settings}</span></div>
                    }
                </a>
                { !isBottomBar &&
                  <ReactTooltip id="toggle-settings" place={tooltipPlace} effect="solid" className="tooltip">{strings.settings}</ReactTooltip>
                }
            </li>
        )
    }
}

ToggleSettingsButton.propTypes = {
    displayModal: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
    isBottomBar: PropTypes.bool.isRequired
};

ToggleSettingsButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleSettingsButton
