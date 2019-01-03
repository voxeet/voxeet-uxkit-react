import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import LocalizedStrings from 'react-localization';
import RecordingOn from '../../../../static/images/newicons/icon-record-on.svg'
import RecordingOff from '../../../../static/images/newicons/icon-record-off.svg'

let strings = new LocalizedStrings({
 en:{
   record: "Recording"
 },
 fr: {
   record: "Enregistrer"
 }
});

class ToggleRecordingButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
          hover: false
        }
    }

    render() {
        const { isRecording, toggle, tooltipPlace, isBottomBar, recordingLocked } = this.props
        const { hover } = this.state
        return (
            <li className={isRecording ? 'active' : ''}
                onMouseEnter={() => this.setState({hover: true})}
                onMouseLeave={() => this.setState({hover: false})}>
                <a data-tip data-for="toggle-recording"
                    className={'' + ((isRecording || recordingLocked) ? 'on' : 'off')}
                    title={strings.record}
                    onClick={() => toggle()}>
                    <img src={(isRecording || hover || recordingLocked) ? RecordingOn : RecordingOff} />
                    { isBottomBar &&
                      <div><span>{strings.record}</span></div>
                    }
                </a>
                { !isBottomBar &&
                  <ReactTooltip id="toggle-recording" place={tooltipPlace} effect="solid" className="tooltip">{strings.record}</ReactTooltip>
                }
            </li>
        )
    }
}

ToggleRecordingButton.propTypes = {
    isRecording: PropTypes.bool.isRequired,
    recordingLocked: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    tooltipPlace: PropTypes.string.isRequired,
    isBottomBar: PropTypes.bool.isRequired
};

ToggleRecordingButton.defaultProps = {
    tooltipPlace: "right"
};

export default ToggleRecordingButton
