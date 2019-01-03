import React, { Component } from 'react'
import browser from 'bowser';
import PropTypes from 'prop-types'

import {
    ToggleMicrophoneButton,
    ToggleRecordingButton,
    ToggleScreenShareButton,
    Toggle3DAudioButton,
    HangUpButtonBottomBar,
    ToggleVideoButton,
    ToggleExternalLiveButton,
    ToggleSettingsButton,
    ToggleAttendeesListButton,
    ToggleAttendeesChatButton
} from './buttons'

class ActionsButtons extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { isBottomBar, forceFullscreen, isMuted, isRecording, isWidgetFullScreenOn,
            videoEnabled, displayModal,
            toggleMicrophone, toggleRecording, toggleVideo, toggleScreenShare, toggleAttendeesList, attendeesListOpened, attendeesChatOpened, 
            toggleAttendeesChat, recordingLocked, toggleModal, toggleAudio3D, isWebinar, isAdmin, displayActions, leave, audio3DEnabled, isElectron, displayExternalLiveModal, isExternalLive, isScreenshare, isDemo } = this.props

        return (
            <div>
                <ul className="controls-left">
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("mute") > -1 && !isDemo &&
                        <ToggleMicrophoneButton
                            isMuted={isMuted}
                            toggle={toggleMicrophone}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("video") > -1 && !isDemo &&
                        <ToggleVideoButton
                            videoEnabled={videoEnabled}
                            toggle={toggleVideo}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && isBottomBar && isElectron &&
                        <Toggle3DAudioButton
                            audio3DEnabled={audio3DEnabled}
                            toggleAudio3D={toggleAudio3D}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || isWebinar && isAdmin) &&
                        <ToggleSettingsButton
                            displayModal={displayModal}
                            toggle={toggleModal}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                </ul>
                <ul className="controls-center">
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("recording") > -1 && !isDemo &&
                        <ToggleRecordingButton
                            isRecording={isRecording}
                            recordingLocked={recordingLocked}
                            toggle={toggleRecording}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("screenshare") > -1 && !isDemo && !browser.safari &&
                        <ToggleScreenShareButton
                            screenShareEnabled={isScreenshare}
                            isElectron={isElectron}
                            toggle={toggleScreenShare}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("live") > -1 && !isDemo &&
                        <ToggleExternalLiveButton
                            toggle={displayExternalLiveModal}
                            isExternalLive={isExternalLive}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {isBottomBar && (!isWebinar || isWebinar && isAdmin) && !isDemo &&
                        <li className="separator">
                        </li>
                    }
                    {isBottomBar &&
                        <HangUpButtonBottomBar
                            leave={leave}
                            tooltipPlace='top'
                        />
                    }

                </ul>
                <ul className="controls-right">
                    {isBottomBar && displayActions.indexOf("attendees") > -1  &&
                        <ToggleAttendeesListButton tooltipPlace='top' toggle={toggleAttendeesList} isBottomBar isOpen={attendeesListOpened}/>
                    }
                    {isBottomBar && displayActions.indexOf("chat") > -1  &&
                        <ToggleAttendeesChatButton tooltipPlace='top' toggle={toggleAttendeesChat} isBottomBar isOpen={attendeesChatOpened}/>
                    }
                </ul>
            </div>
        )

    }
}

ActionsButtons.propTypes = {
    isBottomBar: PropTypes.bool.isRequired,
    forceFullscreen: PropTypes.bool.isRequired,
    isMuted: PropTypes.bool.isRequired,
    isWebinar: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    videoEnabled: PropTypes.bool.isRequired,
    screenShareEnabled: PropTypes.bool.isRequired,
    displayModal: PropTypes.bool.isRequired,
    isScreenshare: PropTypes.bool.isRequired,
    displayActions: PropTypes.array.isRequired,
    toggleAudio3D: PropTypes.func.isRequired,
    recordingLocked: PropTypes.bool.isRequired,
    displayExternalLiveModal: PropTypes.func.isRequired,
    isElectron: PropTypes.bool.isRequired,
    isExternalLive: PropTypes.bool.isRequired,
    audio3DEnabled: PropTypes.bool.isRequired,
    isRecording: PropTypes.bool.isRequired,
    isWidgetFullScreenOn: PropTypes.bool.isRequired,
    toggleMicrophone: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    toggleRecording: PropTypes.func.isRequired,
    toggleVideo: PropTypes.func.isRequired,
    toggleScreenShare: PropTypes.func.isRequired,
    toggleModal: PropTypes.func.isRequired,
    toggleMode: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    toggleAttendeesList: PropTypes.func.isRequired,
    attendeesListOpened: PropTypes.bool.isRequired,
    toggleAttendeesChat: PropTypes.func.isRequired,
    attendeesChatOpened: PropTypes.bool.isRequired
}

ActionsButtons.defaultProps = {
    isBottomBar: false,
    forceFullscreen: false
}

export default ActionsButtons
