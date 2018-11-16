import React, { Component } from 'react'
import PropTypes from 'prop-types'

import userPlaceholder from '../../../../static/images/user-placeholder.png'

import AttendeesParticipantBar from '../AttendeesParticipantBar'
import AttendeesParticipantVideo from '../AttendeesParticipantVideo'
import ToggleFullScreenScrenShare from './ToggleFullScreenScreenShare'
import AttendeesParticipantVuMeter from '../AttendeesParticipantVuMeter'

class SpeakerActive extends Component {

    constructor(props) {
        super(props)
    }

    shouldComponentUpdate(nextProps, nextState) {
      if ((!this.props.screenShareEnabled && nextProps.screenShareEnabled) || (this.props.screenShareEnabled && !nextProps.screenShareEnabled)) {
        return true
      }
      const checker = document.getElementById("video-active-video-on")
      if ((checker != null && nextProps.participant.stream == null || checker == null && nextProps.participant.stream) || (this.props.mySelf && this.props.participant.name == null) || (this.props.participant != nextProps.participant)) {
        return true
      }
      return false
    }

    render() {
        const { participant, toggleMicrophone, isWidgetFullScreenOn, screenShareEnabled, screenShareStream, isAdmin, kickParticipant, isAdminActived, userStream, isScreenshare, isElectron } = this.props
        const photoUrl = participant.avatarUrl || userPlaceholder
        return (
            <div id={"video-active-video-" + (participant.stream ? "on" : "off")} className="active-speaker">
                <div className={"video-frame " + (screenShareEnabled && "screen-share")}>
                    { screenShareEnabled && !isScreenshare && !isElectron &&
                        <ToggleFullScreenScrenShare toggle={this.toggleScreenShareFullScreen} />
                    }
                    {(participant && !screenShareEnabled) &&
                        <AttendeesParticipantBar kickParticipant={kickParticipant} isAdminActived={isAdminActived} isAdmin={isAdmin} participant={participant} toggleMicrophone={toggleMicrophone} />
                    }
                    {(screenShareEnabled || participant.stream) ?
                        <div className="stream-media">
                            <AttendeesParticipantVideo
                                stream={(screenShareEnabled ? screenShareStream : participant.stream)}
                                enableDbClick={screenShareEnabled}
                            />
                        </div>
                        :
                        <AttendeesParticipantVuMeter participant={participant} width={80} height={80} customClass={"preview-avatar"} />
                    }
                </div>
            </div>
        )
    }
}

SpeakerActive.propTypes = {
    participant: PropTypes.object,
    toggleMicrophone: PropTypes.func.isRequired,
    isWidgetFullScreenOn: PropTypes.bool.isRequired,
    isScreenshare: PropTypes.bool,
    screenShareEnabled: PropTypes.bool,
    isElectron: PropTypes.bool,
    screenShareStream: PropTypes.object,
    userStream: PropTypes.object,
    kickParticipant: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    isAdminActived: PropTypes.bool.isRequired,
}

export default SpeakerActive
