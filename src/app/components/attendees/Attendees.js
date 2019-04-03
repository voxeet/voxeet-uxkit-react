import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import Sdk from '../../sdk'
import { Actions as ConferenceActions } from '../../actions/ConferenceActions'
import { Actions as ControlsActions } from '../../actions/ControlsActions'
import { Actions as ParticipantActions } from '../../actions/ParticipantActions'
import { Actions as ActiveSpeakerActions } from '../../actions/ActiveSpeakerActions'

import { MODE_LIST, MODE_TILES, MODE_SPEAKER } from '../../constants/DisplayModes'
import { BROADCAST_KICK, WEBINAR_LIVE } from '../../constants/BroadcastMessageType'

import Modal from './modal/Modal'
import AttendeesHeader from './AttendeesHeader'
import OnBoardingMessage from './onBoardingMessage/onBoardingMessage'
import OnBoardingMessageWithAction from './onBoardingMessage/onBoardingMessageWithAction'
import AttendeesWaitingWebinarPresenter from './AttendeesWaitingWebinarPresenter'
import { List, ListWidget, Speakers, Tiles, View3D, Webinar, ToggleModeButton } from './modes'
import AttendeesParticipantVideo from './AttendeesParticipantVideo'
import AttendeesToggleFullscreen from './AttendeesToggleFullscreen';

@connect((store) => {
    return {
        participantStore: store.voxeet.participants,
        errorStore: store.voxeet.error
    }
})
class Attendees extends Component {

    constructor(props) {
        super(props)
        this.toggleMicrophone = this.toggleMicrophone.bind(this)
        this.kickParticipant = this.kickParticipant.bind(this)
        this.toggleVideo = this.toggleVideo.bind(this)
        this.toggleWebinarState = this.toggleWebinarState.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.toggleErrorModal = this.toggleErrorModal.bind(this)
        this.forceActiveSpeaker = this.forceActiveSpeaker.bind(this)
        this.disableForceActiveSpeaker = this.disableForceActiveSpeaker.bind(this)
        this.setUserPosition = this.setUserPosition.bind(this)
        this.saveUserPosition = this.saveUserPosition.bind(this)
        this.renderWaiting = this.renderWaiting.bind(this)
    }

    componentDidMount() {
        if (this.props.broadcasterModeWebinar == false && this.props.participantStore.isWebinar && this.props.participantStore.isAdmin && !this.props.webinarLive) {
            this.props.dispatch(ConferenceActions._webinarIsLive())
            this.props.dispatch(ConferenceActions.sendBroadcastMessage(WEBINAR_LIVE));
        }
    }

    toggleMicrophone(participant_id) {
        this.props.dispatch(ConferenceActions.toggleMicrophone(participant_id))
    }

    toggleWebinarState() {
        this.props.dispatch(ConferenceActions._webinarIsLive())
        this.props.dispatch(ConferenceActions.sendBroadcastMessage(WEBINAR_LIVE));
    }

    toggleErrorModal() {
        this.props.dispatch(ControlsActions.toggleModal())
        this.props.dispatch(ErrorActions.onClearError())
    }

    forceActiveSpeaker(participant) {
        this.props.dispatch(ActiveSpeakerActions.forceActiveSpeaker(participant))
    }

    disableForceActiveSpeaker() {
        this.props.dispatch(ActiveSpeakerActions.disableForceActiveSpeaker())
    }

    saveUserPosition(participant_id, relativePosition, position) {
        this.props.dispatch(ParticipantActions.saveUserPosition(participant_id, relativePosition, position))
    }

    setUserPosition(participant_id, positionRelative, position, moved) {
        this.props.dispatch(ParticipantActions.user3DMoved(participant_id, moved))
        Sdk.instance.setUserPosition(participant_id, positionRelative.x, -positionRelative.y);
    }

    toggleModal() {
        this.props.dispatch(ControlsActions.toggleModal())
    }

    toggleVideo() {
        const { videoEnabled } = this.props
        this.props.dispatch(ConferenceActions.toggleVideo(videoEnabled))
    }

    kickParticipant(participant_id) {
        this.props.dispatch(ConferenceActions.sendBroadcastMessage(BROADCAST_KICK, participant_id))
    }

    renderWaiting() {
        return React.createElement(this.props.attendeesWaiting, { ...this.props })
    }

    renderParticipantList() {
        return React.createElement(this.props.attendeesList, { ...this.props, isWebinar: this.props.participantStore.isWebinar, isAdmin: this.props.participantStore.isAdmin })
    }

    renderChat() {
        return React.createElement(this.props.attendeesChat, { ...this.props, participants: this.props.participantStore.participants, currentUser: this.props.participantStore.currentUser })
    }

    render() {
        const { mode, forceFullscreen, toggleMode, toggleWidget, isWidgetOpened, webinarLive, modalExternalAction, isWidgetFullScreenOn, videoEnabled, isAdminActived, displayModes, isElectron, isScreenshare, broadcasterModeWebinar, attendeesListOpened, attendeesChatOpened } = this.props
        const { participants, screenShareEnabled, isAdmin, isWebinar, userIdStreamScreenShare, userStreamScreenShare, userStream, currentUser } = this.props.participantStore

        const participantsConnected = participants.filter(p => p.isConnected)
        const participantWebinar = participants.filter(p => p.isAdmin)

        return (
            <div id="conference-attendees" className={isWidgetFullScreenOn ? "vxt-conference-attendees sidebar-less" : "vxt-conference-attendees"}>
                {(isWidgetFullScreenOn || forceFullscreen) && !screenShareEnabled && (!isWebinar || (isWebinar && webinarLive)) && participantsConnected.length > 0 &&
                    <ToggleModeButton
                        mode={mode}
                        isElectron={isElectron}
                        toggleMode={toggleMode}
                    />
                }

                {isWidgetFullScreenOn && !forceFullscreen &&
                    <AttendeesToggleFullscreen
                        toggleWidget={toggleWidget}
                        isWidgetOpened={isWidgetOpened} />
                }

                {(!forceFullscreen && !isWidgetFullScreenOn) &&
                    <AttendeesHeader />
                }

                {isWebinar && isAdmin &&
                    <Webinar
                        isAdmin={isAdmin}
                        isAdminActived={isAdminActived}
                        kickParticipant={this.kickParticipant}
                        toggleMicrophone={this.toggleMicrophone} />
                }

                <OnBoardingMessageWithAction
                />
                <OnBoardingMessage
                />

                {attendeesListOpened &&
                    this.renderParticipantList()
                }

                {attendeesChatOpened &&
                    this.renderChat()
                }

                <section className={`sidebar-container ${(attendeesListOpened || attendeesChatOpened) ? "attendees-list-opened" : ""}`}>
                    {!webinarLive && isWebinar && isAdmin && broadcasterModeWebinar &&
                        <AttendeesWaitingWebinarPresenter
                            isModalSettings={true}
                            toggleWebinarState={this.toggleWebinarState}
                            toggleVideo={this.toggleVideo}
                            modalExternalAction={modalExternalAction}
                            videoEnabled={videoEnabled}
                            userStream={userStream}
                        />
                    }

                    {!isWidgetFullScreenOn && !forceFullscreen &&
                        participants.length > 0 &&
                        <ListWidget participants={isWebinar && !isAdmin ? participantWebinar : participants}
                            isAdmin={isAdmin}
                            isAdminActived={isAdminActived}
                            kickParticipant={this.kickParticipant}
                            toggleMicrophone={this.toggleMicrophone} />
                    }

                    {mode === MODE_LIST && (forceFullscreen || isWidgetFullScreenOn) && participantsConnected.length > 0 && (displayModes.indexOf("list") > -1) && isElectron && !screenShareEnabled &&
                        <View3D participants={isWebinar && !isAdmin ? participantWebinar : participants}
                            isAdmin={isAdmin}
                            isAdminActived={isAdminActived}
                            kickParticipant={this.kickParticipant}
                            setUserPosition={this.setUserPosition}
                            saveUserPosition={this.saveUserPosition}
                            toggleMicrophone={this.toggleMicrophone} />
                    }
                    {(mode === MODE_TILES) && (forceFullscreen || isWidgetFullScreenOn) /*&& participants.length > 0*/ && displayModes.indexOf("tiles") > -1 && !screenShareEnabled && currentUser != null &&
                        <Tiles participants={isWebinar && !isAdmin ? participantWebinar : participants}
                            isAdmin={isAdmin}
                            isWebinar={isWebinar}
                            isAdminActived={isAdminActived}
                            webinarLive={webinarLive}
                            currentUser={currentUser}
                            kickParticipant={this.kickParticipant}
                            toggleMicrophone={this.toggleMicrophone}
                            isWidgetFullScreenOn={(forceFullscreen || isWidgetFullScreenOn)} />
                    }
                    {(mode === MODE_SPEAKER) && (forceFullscreen || isWidgetFullScreenOn) /*&& participantsConnected.length > 0*/ && displayModes.indexOf("speaker") > -1 &&
                        <Speakers participants={isWebinar && !isAdmin ? participantWebinar : participantsConnected}
                            isAdmin={isAdmin}
                            isAdminActived={isAdminActived}
                            isWebinar={isWebinar}
                            kickParticipant={this.kickParticipant}
                            userIdStreamScreenShare={userIdStreamScreenShare}
                            forceActiveSpeaker={this.forceActiveSpeaker}
                            isElectron={isElectron}
                            disableForceActiveSpeaker={this.disableForceActiveSpeaker}
                            toggleMicrophone={this.toggleMicrophone}
                            isWidgetFullScreenOn={(forceFullscreen || isWidgetFullScreenOn)}
                            screenShareEnabled={screenShareEnabled}
                            userStream={userStream}
                            currentUser={currentUser}
                            isScreenshare={isScreenshare}
                            screenShareStream={userStreamScreenShare}
                        />
                    }
                    {participantsConnected.length === 0 && !isWebinar &&
                        this.renderWaiting()
                    }

                </section>
            </div>
        )
    }
}

Attendees.propTypes = {
    mode: PropTypes.string.isRequired,
    toggleMode: PropTypes.func.isRequired,
    webinarLive: PropTypes.bool.isRequired,
    modalExternalAction: PropTypes.func,
    broadcasterModeWebinar: PropTypes.bool,
    isWidgetOpened: PropTypes.bool.isRequired,
    toggleWidget: PropTypes.func.isRequired,
    attendeesListOpened: PropTypes.bool.isRequired,
    attendeesChatOpened: PropTypes.bool.isRequired,
    forceFullscreen: PropTypes.bool,
    videoEnabled: PropTypes.bool,
    isWidgetFullScreenOn: PropTypes.bool,
    displayModal: PropTypes.bool,
    isAdminActived: PropTypes.bool,
    displayModes: PropTypes.array,
    isElectron: PropTypes.bool,
    isScreenshare: PropTypes.bool,
    attendeesWaiting: PropTypes.func,
    attendeesChat: PropTypes.func,
    attendeesList: PropTypes.func
}

export default Attendees
