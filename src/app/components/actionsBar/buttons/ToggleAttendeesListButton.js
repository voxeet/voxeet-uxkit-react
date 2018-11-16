import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import ListOn from '../../../../static/images/newicons/icon-participants-on.svg'
import ListOff from '../../../../static/images/newicons/icon-participants-off.svg'

const LABELS = new LocalizedStrings({
 en:{
   attendees: "Attendees"
 },
 fr: {
    attendees: "Participants"
 }
});

class ToggleAttendeesListButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          hover: false
        }
    }

    render() {
        const { isOpen, toggle, tooltipPlace, isBottomBar } = this.props
        const { hover } = this.state
        return (
            <li className={isOpen ? 'active' : ''}
                onMouseEnter={() => this.setState({hover: true})}
                onMouseLeave={() => this.setState({hover: false})}>
                <a data-tip data-for="toggle-mute"
                    className={' ' + (isOpen ? 'on' : 'off')}
                    title={LABELS.attendees}
                    onClick={() => toggle()}>
                    <img src={(isOpen || hover) ? ListOn : ListOff} />
                    { isBottomBar &&
                      <div><span>{LABELS.attendees}</span></div>
                    }
                </a>
                { !isBottomBar &&
                  <ReactTooltip id="toggle-mute" place={tooltipPlace} effect="solid" className="tooltip">{LABELS.attendees}</ReactTooltip>
                }
            </li>
        )
    }
}

ToggleAttendeesListButton.propTypes = {
    toggle: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
    isBottomBar: PropTypes.bool.isRequired
};

ToggleAttendeesListButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleAttendeesListButton
