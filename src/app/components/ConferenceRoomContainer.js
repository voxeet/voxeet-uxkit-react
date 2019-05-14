import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { strings } from '../languages/localizedStrings';

import { Actions as ConferenceActions } from '../actions/ConferenceActions'
import { Actions as ControlsActions } from '../actions/ControlsActions'
import { Actions as TimerActions } from '../actions/TimerActions'
import { Actions as ErrorActions } from '../actions/ErrorActions'
import { Actions as ChatActions } from '../actions/ChatActions'
import { Actions as OnBoardingMessageActions } from '../actions/OnBoardingMessageActions'
import Sdk from '../sdk'
import { BROADCAST_KICK_ADMIN_HANG_UP, WEBINAR_LIVE, RECORDING_STATE } from '../constants/BroadcastMessageType'

import { Sidebar } from './actionsBar'
import Attendees from './attendees/Attendees'
import ModalClose from './attendees/modal/ModalClose'
import Modal from './attendees/modal/Modal'

import BottomBar from './actionsBar/bottomBar/BottomBar';

@connect((store) => {
    return {
        controlsStore: store.voxeet.controls,
        participantsStore: store.voxeet.participants,
        errorStore: store.voxeet.error
    }
})
class ConferenceRoomContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isModalExternalLiveOpen: false
        }
        this.leaveConference = this.leaveConference.bind(this)
        this.toggleWidget = this.toggleWidget.bind(this)
        this.toggleFullScreen = this.toggleFullScreen.bind(this)
        this.toggleMicrophone = this.toggleMicrophone.bind(this)
        this.toggleRecording = this.toggleRecording.bind(this)
        this.toggleScreenShare = this.toggleScreenShare.bind(this)
        this.convertFilePresentation = this.convertFilePresentation.bind(this)
        this.toggleModalWidget = this.toggleModalWidget.bind(this)
        this.toggleVideo = this.toggleVideo.bind(this)
        this.toggleAudio3D = this.toggleAudio3D.bind(this)
        this.toggleMode = this.toggleMode.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.toggleErrorModal = this.toggleErrorModal.bind(this)
        this.getSidebarClasses = this.getSidebarClasses.bind(this)
        this.toggleLive = this.toggleLive.bind(this)
        this.toggleAttendeesList = this.toggleAttendeesList.bind(this)
        this.toggleAttendeesChat = this.toggleAttendeesChat.bind(this)
        this.toggleAttendeesSettings = this.toggleAttendeesSettings.bind(this)
        this.toggleAttendeesLive = this.toggleAttendeesLive.bind(this)
        this.props.dispatch(TimerActions.startTime())
    }

    toggleWidget() {
        this.props.dispatch(ControlsActions.toggleWidget())
    }

    toggleFullScreen() {
        this.props.dispatch(ControlsActions.toggleFullScreen())
    }

    leaveConference() {
        const { isWidgetOpened, videoEnabled, isKickOnHangUpActived } = this.props.controlsStore
        const { isAdmin, isWebinar } = this.props.participantsStore
        const { handleOnLeave } = this.props
        if (isAdmin && isKickOnHangUpActived) {
            this.props.dispatch(ConferenceActions.sendBroadcastMessage(BROADCAST_KICK_ADMIN_HANG_UP))
                .then(() => {
                    this.props.dispatch(ConferenceActions.leave())
                })
        } else {
            if (isWidgetOpened) this.props.dispatch(ControlsActions.toggleWidget())
            if (videoEnabled) this.props.dispatch(ControlsActions.toggleVideo(false))
            this.props.dispatch(ConferenceActions.leave())
        }
    }

    toggleMicrophone() {
        this.props.dispatch(ConferenceActions.toggleMicrophone())
    }

    toggleRecording() {
        const { isRecording, recordingLocked } = this.props.controlsStore
        const { currentUser } = this.props.participantsStore
        const { conferenceId } = this.props
        if (!recordingLocked) {
            this.props.dispatch(ConferenceActions.toggleRecording(conferenceId, isRecording))
            this.props.dispatch(ConferenceActions.sendBroadcastMessage(RECORDING_STATE, null, { name: currentUser.name, userId: currentUser.participant_id, recordingRunning: !isRecording }));
        } else {
            this.props.dispatch(OnBoardingMessageActions.onBoardingDisplay(strings.conferenceAlreadyRecord, 1000))
        }
    }

    toggleVideo() {
        const { videoEnabled } = this.props.controlsStore
        this.props.dispatch(ConferenceActions.toggleVideo(videoEnabled))
    }

    toggleScreenShare(type) {
        const { isFilePresentation, isScreenshare } = this.props.controlsStore
        if (isScreenshare || type != null) { 
            this.props.dispatch(ConferenceActions.toggleScreenShare(type)) 
        } else if (isFilePresentation) {
            this.props.dispatch(ConferenceActions.stopFilePresentation()) 
        }
    }

    convertFilePresentation(file) {
        this.props.dispatch(ConferenceActions.convertFile(file))
    }

    toggleModal() {
        this.props.dispatch(ControlsActions.toggleModal())
    }

    toggleErrorModal() {
        this.props.dispatch(ControlsActions.toggleModal())
        this.props.dispatch(ErrorActions.onClearError())
    }

    toggleModalWidget() {
        this.props.dispatch(ControlsActions.toggleModalWidget())
    }

    toggleMode() {
        this.props.dispatch(ControlsActions.toggleMode())
    }

    toggleLive(url, password) {
        const { isExternalLive } = this.props.controlsStore
        if (isExternalLive) {
            this.props.dispatch(ConferenceActions.stopExternalLive()).then(() => {
                this.props.dispatch(ControlsActions.toggleLiveExternal())
            })
        } else {
            if (url.slice(-1) != '/') { url = url + "/" }
            const entireUrl = url + password;
            this.props.dispatch(ConferenceActions.joinExternalLive(entireUrl)).then(() => {
                this.props.dispatch(ControlsActions.toggleLiveExternal())
            })
        }
    }
    toggleAudio3D() {
        const { audio3DEnabled } = this.props.controlsStore
        this.props.dispatch(ConferenceActions.toggleAudio3D(!audio3DEnabled))
    }

    toggleAttendeesList() {
        this.props.dispatch(ControlsActions.toggleAttendeesList())
    }

    toggleAttendeesLive() {
        this.props.dispatch(ControlsActions.toggleAttendeesLive())
    }

    toggleAttendeesSettings() {
        this.props.dispatch(ControlsActions.toggleAttendeesSettings())
    }

    toggleAttendeesChat() {
        this.props.dispatch(ChatActions.resetBadgeMessage())
        this.props.dispatch(ControlsActions.toggleAttendeesChat())
    }

    getSidebarClasses() {
        const { forceFullscreen, isModal, isWebinar } = this.props
        const { isWidgetOpened, isWidgetFullScreenOn, modalOpened } = this.props.controlsStore
        if (isModal) {
            return modalOpened ? ' modal-content vxt-widget-opened vxt-widget-fullscreen-on' : ''
        }
        return (isWidgetOpened || forceFullscreen) ? ' vxt-widget-opened ' + ((isWidgetFullScreenOn || forceFullscreen) ? 'vxt-widget-fullscreen-on' : 'vxt-widget-mode-on') : ''
    }

    render() {
        const { isJoined, isModal, forceFullscreen, screenShareEnabled, filePresentationEnabled, actionsButtons, attendeesChat, attendeesList, isWebinar, isAdmin, attendeesWaiting, isDemo, conferencePincode } = this.props
        const { errorMessage, isError } = this.props.errorStore
        const { isModalExternalLiveOpen } = this.state
        const { userStream } = this.props.participantsStore
        const { mode, videoEnabled, recordingLocked, isWidgetOpened, isWidgetFullScreenOn, isMuted, isRecording, modalOpened, displayModal, displayActions, shareActions, audio3DEnabled, isElectron, isExternalLive, isFilePresentation, isScreenshare, isAdminActived, displayModes, displayAttendeesList, displayAttendeesChat, displayAttendeesSettings, displayAttendeesLive } = this.props.controlsStore
        return (
            <div id="vxt-widget-container" className={(isModal ? (!modalOpened ? 'vxt-widget-modal modal-hidden' : 'vxt-widget-modal') : '')}>
                <aside className={'vxt-widget-container' + this.getSidebarClasses()}>
                    {isModal &&
                        <ModalClose
                            toggle={this.toggleModalWidget}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen &&
                        <Sidebar
                            isJoined={isJoined}
                            conferencePincode={conferencePincode}
                            isWebinar={isWebinar}
                            isAdmin={isAdmin}
                            shareActions={shareActions}
                            isElectron={isElectron}
                            mode={mode}
                            forceFullscreen={forceFullscreen}
                            leave={this.leaveConference}
                            isDemo={isDemo}
                            filePresentationEnabled={filePresentationEnabled}
                            displayActions={displayActions}
                            screenShareEnabled={screenShareEnabled}
                            toggleWidget={this.toggleWidget}
                            toggleFullScreen={this.toggleFullScreen}
                            isWidgetOpened={isWidgetOpened}
                            isWidgetFullScreenOn={isWidgetFullScreenOn}
                            recordingLocked={recordingLocked}
                            isScreenshare={isScreenshare}
                            isMuted={isMuted}
                            isExternalLive={isExternalLive}
                            videoEnabled={videoEnabled}
                            toggleAudio3D={this.toggleAudio3D}
                            audio3DEnabled={audio3DEnabled}
                            displayModal={displayModal}
                            isRecording={isRecording}
                            isFilePresentation={isFilePresentation}
                            toggleMicrophone={this.toggleMicrophone}
                            toggleRecording={this.toggleRecording}
                            toggleAttendeesLive={this.toggleAttendeesLive}
                            toggleScreenShare={this.toggleScreenShare}
                            toggleAttendeesList={this.toggleAttendeesList}
                            toggleAttendeesChat={this.toggleAttendeesChat}
                            attendeesChatOpened={displayAttendeesChat}
                            attendeesListOpened={displayAttendeesList}
                            attendeesLiveOpened={displayAttendeesLive}
                            toggleAttendeesSettings={this.toggleAttendeesSettings}
                            attendeesSettingsOpened={displayAttendeesSettings}
                            convertFilePresentation={this.convertFilePresentation}
                            toggleVideo={this.toggleVideo}
                            toggleModal={this.toggleModal}
                            toggleMode={this.toggleMode}
                            actionsButtons={actionsButtons}
                        />
                    }

                    {isJoined &&
                        <Attendees
                            mode={mode}
                            toggleMode={this.toggleMode}
                            forceFullscreen={forceFullscreen}
                            toggleWidget={this.toggleWidget}
                            isWidgetOpened={isWidgetOpened}
                            toggleLive={this.toggleLive.bind(this)}
                            isModalExternalLive={true}
                            videoEnabled={videoEnabled}
                            isWidgetFullScreenOn={isWidgetFullScreenOn}
                            displayModal={displayModal}
                            isAdminActived={isAdminActived}
                            displayModes={displayModes}
                            isElectron={isElectron}
                            isScreenshare={isScreenshare}
                            isFilePresentation={isFilePresentation}
                            attendeesWaiting={attendeesWaiting}
                            attendeesListOpened={displayAttendeesList}
                            attendeesChatOpened={displayAttendeesChat}
                            attendeesLiveOpened={displayAttendeesLive}
                            attendeesSettingsOpened={displayAttendeesSettings}
                            attendeesChat={attendeesChat}
                            attendeesList={attendeesList}
                        />
                    }
                    {isJoined && (isWidgetFullScreenOn || forceFullscreen) &&
                        <BottomBar
                            isJoined={isJoined}
                            isWebinar={isWebinar}
                            isAdmin={isAdmin}
                            conferencePincode={conferencePincode}
                            mode={mode}
                            isDemo={isDemo}
                            isElectron={isElectron}
                            displayActions={displayActions}
                            shareActions={shareActions}
                            leave={this.leaveConference}
                            screenShareEnabled={screenShareEnabled}
                            filePresentationEnabled={filePresentationEnabled}
                            recordingLocked={recordingLocked}
                            isScreenshare={isScreenshare}
                            isFilePresentation={isFilePresentation}
                            toggleWidget={this.toggleWidget}
                            toggleAudio3D={this.toggleAudio3D}
                            toggleFullScreen={this.toggleFullScreen}
                            isWidgetOpened={isWidgetOpened}
                            isMuted={isMuted}
                            isExternalLive={isExternalLive}
                            videoEnabled={videoEnabled}
                            audio3DEnabled={audio3DEnabled}
                            displayModal={displayModal}
                            isRecording={isRecording}
                            toggleMicrophone={this.toggleMicrophone}
                            toggleRecording={this.toggleRecording}
                            toggleScreenShare={this.toggleScreenShare}
                            convertFilePresentation={this.convertFilePresentation}
                            toggleVideo={this.toggleVideo}
                            toggleModal={this.toggleModal}
                            toggleMode={this.toggleMode}
                            toggleAttendeesList={this.toggleAttendeesList}
                            attendeesLiveOpened={displayAttendeesLive}
                            toggleAttendeesLive={this.toggleAttendeesLive}
                            attendeesListOpened={displayAttendeesList}
                            toggleAttendeesChat={this.toggleAttendeesChat}
                            attendeesChatOpened={displayAttendeesChat}
                            toggleAttendeesSettings={this.toggleAttendeesSettings}
                            attendeesSettingsOpened={displayAttendeesSettings}
                            actionsButtons={actionsButtons}
                        />
                    }
                </aside>
                {displayModal && !isError &&
                    <Modal
                        isModalSettings={true}
                        toggle={this.toggleModal}
                        toggleVideo={this.toggleVideo}
                        microphoneMuted={isMuted}
                        videoEnabled={videoEnabled}
                        userStream={userStream}
                    />
                }
            </div>
        )

    }
}

ConferenceRoomContainer.propTypes = {
    isJoined: PropTypes.bool,
    isDemo: PropTypes.bool,
    isModal: PropTypes.bool,
    isWebinar: PropTypes.bool,
    isAdmin: PropTypes.bool,
    forceFullscreen: PropTypes.bool,
    actionsButtons: PropTypes.func,
    filePresentationEnabled: PropTypes.bool,
    screenShareEnabled: PropTypes.bool,
    handleOnLeave: PropTypes.func,
    conferenceId: PropTypes.string,
    conferencePincode: PropTypes.string,
    attendeesList: PropTypes.func,
    attendeesChat: PropTypes.func,
    attendeesWaiting: PropTypes.func
};


export default ConferenceRoomContainer
