import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { strings } from '../../languages/localizedStrings';
import { connect } from 'react-redux'

import userPlaceholder from '../../../static/images/user-placeholder.png'

@connect((store) => {
    return {
        participantStore: store.voxeet.participants,
        participantWaiting: store.voxeet.participantsWaiting
    }
})

class AttendeesList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            runningAnimation: false
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.props.attendeesListOpened == true && nextProps.attendeesListOpened == false) {
            this.setState({ runningAnimation: true })
            setTimeout(() => { this.setState({ runningAnimation: false })}, 250);
        }
    }

    render() {
        const { participants, currentUser } = this.props.participantStore
        const { isWebinar, isAdmin, attendeesListOpened } = this.props
        const participantsConnected = participants.filter(p => p.isConnected)
        const participantsInvited = this.props.participantWaiting.participants.filter(p => (p.status == "Reserved"))
        const participantsInactive = this.props.participantWaiting.participants.filter(p => (p.status == "Inactive"))
        const participantsLeft = this.props.participantWaiting.participants.filter(p => (p.status == "Left"))
        return (
            <div className={this.state.runningAnimation ? "attendees-list attendees-list-out" : (attendeesListOpened ? "attendees-list": "attendees-list-hidden")}>

                <div className="attendees-list-header">
                    <h1>{strings.attendees}</h1>
                </div>

                { isWebinar ? 
                    <div>
                        {(participantsConnected.length > 0 || isAdmin) &&
                        <div>
                            <div className="title-section">{strings.presenter} <span>({participantsConnected.length + 1})</span></div>
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
                            <div className="title-section">{strings.listener} <span>({participantsInactive.length + 1})</span></div>
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
                    <Fragment>
                    <div>
                        <div className="title-section">{strings.joined} <span>({participantsConnected.length + 1})</span></div>
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
                    { participantsInactive.length > 0 &&
                    <div>
                        <div className="title-section">{strings.listener} <span>({participantsInactive.length})</span></div>
                        <ul>
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
                    </Fragment>
                }


                { participantsInvited.length > 0 &&
                    <div>
                        <div className="title-section">{strings.invited} <span>({participantsInvited.length})</span></div>
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


                { participantsLeft.length > 0 &&
                    <div>
                        <div className="title-section">{strings.left} <span>({participantsLeft.length})</span></div>
                        <ul className="participant-invited">
                            {participantsLeft.map((participant, i) => {
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
    attendeesListOpened: PropTypes.bool.isRequired,
    isWebinar: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired
}

export default AttendeesList
