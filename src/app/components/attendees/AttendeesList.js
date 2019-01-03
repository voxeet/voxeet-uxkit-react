import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization'
import { connect } from 'react-redux'

import userPlaceholder from '../../../static/images/user-placeholder.png'

const LABELS = new LocalizedStrings({
    en: {
        attendees: "Attendees",
        joined: "Joined",
        invited: "Waiting On",
        presenter: "Presenter",
        listener: "Listener"
    },
    fr: {
        attendees: "Participants",
        joined: "En conférence",
        invited: "En attente",
        presenter: "Présentateur",
        listener: "Auditeur"
    }
});

@connect((store) => {
    return {
        participantStore: store.voxeet.participants,
        participantWaiting: store.voxeet.participantsWaiting
    }
})

class AttendeesList extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { participants, currentUser } = this.props.participantStore
        const { isWebinar, isAdmin } = this.props
        const participantsConnected = participants.filter(p => p.isConnected)
        const participantsInvited = this.props.participantWaiting.participants.filter(p => (p.status == "Reserved"))
        const participantsInactive = this.props.participantWaiting.participants.filter(p => (p.status == "Inactive"))
        return (
            <div className="attendees-list">

                <div className="attendees-list-header">
                    <h1>{LABELS.attendees}</h1>
                </div>

                { isWebinar ? 
                    <div>
                        {(participantsConnected.length > 0 || isAdmin) &&
                        <div>
                            <div className="title-section">{LABELS.presenter}</div>
                            <ul>
                                { isAdmin &&
                                    <li>
                                        <span className="participant-details">
                                            <img src={currentUser.avatarUrl || userPlaceholder} className="participant-avatar" />
                                            <span className="participant-username">{currentUser.name}</span>
                                        </span>
                                    </li>
                                }
                                {participantsConnected.map((participant, i) => {
                                    return (
                                        <li key={i}>
                                            <span className="participant-details">
                                                <img src={participant.avatarUrl || userPlaceholder} className="participant-avatar" />
                                                <span className="participant-username">{participant.name}</span>
                                            </span>
                                        </li>)
                                })
                                }
                            </ul>
                        </div>
                        }
                        {(participantsInactive.length > 0 || !isAdmin) &&
                        <div>
                            <div className="title-section">{LABELS.listener}</div>
                            <ul>
                                { !isAdmin &&
                                <li>
                                    <span className="participant-details">
                                        <img src={currentUser.avatarUrl || userPlaceholder} className="participant-avatar" />
                                        <span className="participant-username">{currentUser.name}</span>
                                    </span>
                                </li>
                                }
                                {participantsInactive.map((participant, i) => {
                                    return (
                                        <li key={i}>
                                            <span className="participant-details">
                                                <img src={participant.avatarUrl || userPlaceholder} className="participant-avatar" />
                                                <span className="participant-username">{participant.name}</span>
                                            </span>
                                        </li>)
                                })}
                            </ul>
                        </div>
                        }
                    </div>
                    :
                    <div>
                        <div className="title-section">{LABELS.joined}</div>
                        <ul>
                            <li>
                                <span className="participant-details">
                                    <img src={currentUser.avatarUrl || userPlaceholder} className="participant-avatar" />
                                    <span className="participant-username">{currentUser.name}</span>
                                </span>
                            </li>
                            {participantsConnected.map((participant, i) => {
                                return (
                                    <li key={i}>
                                        <span className="participant-details">
                                            <img src={participant.avatarUrl || userPlaceholder} className="participant-avatar" />
                                            <span className="participant-username">{participant.name}</span>
                                        </span>
                                    </li>)
                            })}
                        </ul>
                    </div>
                }


                { participantsInvited.length > 0 &&
                    <div>
                        <div className="title-section">{LABELS.invited}</div>
                        <ul className="participant-invited">
                            {participantsInvited.map((participant, i) => {
                                return (
                                    <li key={i}>
                                        <span className="participant-details">
                                            <img src={participant.avatarUrl || userPlaceholder} className="participant-avatar" />
                                            <span className="participant-username">{participant.name}</span>
                                        </span>
                                    </li>)
                            })}
                        </ul>
                    </div>
                }


            </div>
        )
    }
}

AttendeesList.propTypes = {
    isWebinar: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired
}

export default AttendeesList
