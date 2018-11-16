import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization'

import userPlaceholder from '../../../static/images/user-placeholder.png'

const LABELS = new LocalizedStrings({
    en: {
        attendees: "Attendees"
    },
    fr: {
        attendees: "Participants"
    }
});


class AttendeesList extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { participants } = this.props
        return (
            <div className="attendees-list">
                <div className="attendees-list-header">
                    <h1>{LABELS.attendees}</h1>
                </div>
                <ul>
                    {participants.map(participant => {
                        return (
                            <li>
                                <span className="participant-details">
                                    <img src={participant.avatarUrl || userPlaceholder} className="participant-avatar" />
                                    <span className="participant-username">{participant.name}</span>
                                </span>
                            </li>)
                    })}
                </ul>
            </div>
        )
    }
}

AttendeesList.propTypes = {
    participants: PropTypes.array.isRequired
}

export default AttendeesList
