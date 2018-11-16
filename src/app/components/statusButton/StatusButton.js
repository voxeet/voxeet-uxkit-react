import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Actions as ConferenceActions } from '../../actions/ConferenceActions'
import { Actions as ControlsActions } from '../../actions/ControlsActions'
import { Actions as ErrorActions } from '../../actions/ErrorActions'
import { Actions as ParticipantActions } from '../../actions/ParticipantActions'

import Modal from '../attendees/modal/Modal'

import {
    Connecting,
    Live,
    Replay,
    LiveSettings,
    Offline
} from './status'

@connect((state) => {
    return {
        conferenceStore: state.voxeet.conference,
        errorStore: state.voxeet.error,
        controlsStore: state.voxeet.controls,
    }
})
class StatusButton extends Component {

    constructor(props) {
        super(props)
        this.joinConference = this.joinConference.bind(this)
        this.toggleErrorModal = this.toggleErrorModal.bind(this)
    }

    joinConference() {
        const { conferenceAlias, isAdmin, constraints, isModal, liveRecordingEnabled, conferenceId, ttl, rtcpmode, mode, videoCodec, userInfo } = this.props
        const { isJoined } = this.props.conferenceStore

        if (isAdmin) {
          this.props.dispatch(ParticipantActions.onParticipantAdmin())
        }

        if (!isJoined) {
            this.props.dispatch(ConferenceActions.subscribeConference(conferenceAlias)).then(() => {
                if (conferenceId != null) {
                  const constraintsUpdated = {
                    video: constraints.video ? true : false,
                    audio: constraints.audio ? true : false,
                    params: {
                      liveRecording: liveRecordingEnabled
                    }
                  }
                  this.props.dispatch(ConferenceActions.joinWithConferenceId(conferenceId, constraintsUpdated))
                } else {
                  this.props.dispatch(ConferenceActions.join(conferenceAlias, false, constraints, liveRecordingEnabled, ttl, rtcpmode, mode, videoCodec, userInfo))
                }
            })
        } else if (isModal) {
            this.props.dispatch(ControlsActions.toggleModal())
        }
    }

    toggleErrorModal() {
      this.props.dispatch(ControlsActions.toggleModal())
      this.props.dispatch(ErrorActions.onClearError())
    }

    render() {
        const { isLive, initialized, isConnecting, isJoined } = this.props.conferenceStore
        const { errorMessage, isError } = this.props.errorStore

        if (isConnecting) {
            return (<Connecting />)
        } else if (initialized && this.props.openSettingsOnJoin) {
            return (<LiveSettings isLive={isLive} initialize={initialized} join={() => this.joinConference()} />)
        } else if (isLive) {
            return (<Live join={() => this.joinConference()} />)
        } else if (initialized) {
            const { displayModal } = this.props.controlsStore
            if (displayModal && isError) {
                  return (
                    <div>
                    <Offline join={() => this.joinConference()} />
                    <Modal
                      error={JSON.stringify(errorMessage)}
                      isModalError={true}
                      toggle={this.toggleErrorModal}
                   />
                   </div>
                 )
            }
            return (<Offline join={() => this.joinConference()} />)
        }
        return (null);
    }

}

StatusButton.propTypes = {
    conferenceAlias: PropTypes.string,
    conferenceId: PropTypes.string,
    liveRecordingEnabled: PropTypes.bool,
    constraints: PropTypes.object,
    ttl: PropTypes.number,
    rtcpmode: PropTypes.string,
    isAdmin: PropTypes.bool,
    mode: PropTypes.string,
    userInfo: PropTypes.object,
    videoCodec: PropTypes.string,
    isModal: PropTypes.bool,
    openSettingsOnJoin: PropTypes.bool
}

StatusButton.defaultProps = {
    isModal: false,
    conferenceId: null,
    ttl: 0,
    isAdmin: false,
    userInfo: {
        name: 'Guest ' + Math.floor((Math.random() * 100) + 1),
        externalId: '',
        avatarUrl: '',
    },
    rtcpmode: 'worst',
    mode: 'standard',
    videoCodec: 'VP8',
    liveRecordingEnabled: false,
    openSettingsOnJoin: false,
}

export default StatusButton
