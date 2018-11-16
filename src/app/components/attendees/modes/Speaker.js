import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import AttendeesParticipantBar from '../AttendeesParticipantBar'
import AttendeesParticipantMute from '../AttendeesParticipantMute'
import AttendeesKickParticipant from '../AttendeesKickParticipant'

import { Actions as ActiveSpeakerActions } from '../../../actions/ActiveSpeakerActions'
import SpeakerDetails from './SpeakerDetails'
import SpeakerVideo from './SpeakerVideo'

class Speaker extends Component {

    constructor(props) {
        super(props)
        this.forceActiveSpeakerChecker = this.forceActiveSpeakerChecker.bind(this)
    }

    forceActiveSpeakerChecker(participant, forceActiveUserEnabled, activeSpeaker, forceActiveSpeaker, disableForceActiveSpeaker) {
      if (participant.participant_id == activeSpeaker.participant_id && forceActiveUserEnabled) {
        disableForceActiveSpeaker()
      } else if (participant.participant_id != activeSpeaker.participant_id) {
        forceActiveSpeaker(participant)
      }
    }

    render() {
        const { participant, activeSpeaker, forceActiveSpeaker, toggleMicrophone, isWidgetFullScreenOn, isAdmin, kickParticipant, isAdminActived, disableForceActiveSpeaker, forceActiveUserEnabled, screenShareEnabled, nbParticipant } = this.props
        let forcedActive = ""
        if (participant.participant_id == activeSpeaker.participant_id && forceActiveUserEnabled && !screenShareEnabled) {
          forcedActive = " participant-forced-active "
        }
        return (
            <li className={'item small-item ' + (participant.isConnected ? 'participant-available' : 'participant-offline') + forcedActive}
                onClick={() => { if (participant.isConnected && !screenShareEnabled) this.forceActiveSpeakerChecker(participant, forceActiveUserEnabled, activeSpeaker, forceActiveSpeaker, disableForceActiveSpeaker) }}>
                {isWidgetFullScreenOn &&
                    <AttendeesParticipantBar kickParticipant={kickParticipant} isAdminActived={isAdminActived} isAdmin={isAdmin} participant={participant} toggleMicrophone={toggleMicrophone} />
                }
                <SpeakerDetails participant={participant} isWidgetFullScreenOn={isWidgetFullScreenOn} />
                {!isWidgetFullScreenOn &&
                    <AttendeesParticipantMute participant={participant} toggleMicrophone={toggleMicrophone} />
                }
                {
                  !isWidgetFullScreenOn && isAdmin && isAdminActived &&
                      <AttendeesKickParticipant participant={participant} kickParticipant={kickParticipant} />
                }
                <SpeakerVideo nbParticipant={nbParticipant} participant={participant} />
            </li >
        )
    }
}

Speaker.propTypes = {
    participant: PropTypes.object.isRequired,
    forceActiveSpeaker: PropTypes.func.isRequired,
    forceActiveUserEnabled: PropTypes.bool.isRequired,
    activeSpeaker: PropTypes.object.isRequired,
    nbParticipant: PropTypes.number,
    disableForceActiveSpeaker: PropTypes.func.isRequired,
    screenShareEnabled: PropTypes.bool.isRequired,
    toggleMicrophone: PropTypes.func.isRequired,
    isWidgetFullScreenOn: PropTypes.bool.isRequired,
    kickParticipant: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    isAdminActived: PropTypes.bool.isRequired,
}

export default Speaker
