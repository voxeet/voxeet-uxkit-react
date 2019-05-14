import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import userPlaceholder from '../../../../static/images/user-placeholder.png'

import AttendeesParticipantBar from '../AttendeesParticipantBar'
import AttendeesParticipantVideo from '../AttendeesParticipantVideo'
import AttendeesParticipantFilePresentation from '../AttendeesParticipantFilePresentation'
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
        if ((checker != null && nextProps.participant.stream == null || checker == null && nextProps.participant.stream) || 
            (this.props.mySelf && this.props.participant.name == null) || (this.props.participant != nextProps.participant)) 
        {
            return true
        }
        return false
    }

    render() {
        const { mySelf, participant, toggleMicrophone, isWidgetFullScreenOn, screenShareEnabled, isFilePresentation, filePresentationEnabled, screenShareStream, isAdmin, kickParticipant, isAdminActived, userStream, isScreenshare, isElectron } = this.props
        const photoUrl = participant.avatarUrl || userPlaceholder
        return (
            <div id={"video-active-video-" + (participant.stream ? "on" : "off")} className="active-speaker">
                <div className={"video-frame " + (screenShareEnabled && "screen-share")}>
                    { screenShareEnabled && !isScreenshare && !isElectron &&
                        <ToggleFullScreenScrenShare toggle={this.toggleScreenShareFullScreen} />
                    }
                    {(participant && !screenShareEnabled && !filePresentationEnabled) &&
                        <AttendeesParticipantBar kickParticipant={kickParticipant} isAdminActived={isAdminActived} isAdmin={isAdmin} participant={participant} toggleMicrophone={toggleMicrophone} />
                    }
                    { filePresentationEnabled &&
                        <AttendeesParticipantFilePresentation isFilePresentation={isFilePresentation} />
                    }


                    {
                        !filePresentationEnabled &&
                        <Fragment>
                        {
                            (screenShareEnabled || participant.stream) ?
                            <div className={mySelf ? "stream-media myself" : "stream-media"}>
                                <AttendeesParticipantVideo
                                    stream={(screenShareEnabled ? screenShareStream : participant.stream)}
                                    enableDbClick={screenShareEnabled}
                                />
                            </div>
                            :
                            <AttendeesParticipantVuMeter participant={participant} width={80} height={80} customClass={"preview-avatar"} />
                        }
                        </Fragment>
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
    isFilePresentation: PropTypes.bool,
    screenShareEnabled: PropTypes.bool,
    filePresentationEnabled: PropTypes.bool,
    isElectron: PropTypes.bool,
    screenShareStream: PropTypes.object,
    userStream: PropTypes.object,
    kickParticipant: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    isAdminActived: PropTypes.bool.isRequired,
    mySelf: PropTypes.bool.isRequired
}

export default SpeakerActive
