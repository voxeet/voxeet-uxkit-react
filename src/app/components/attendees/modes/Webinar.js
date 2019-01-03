import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import ListItem from './ListItem'
import LocalizedStrings from 'react-localization';


let strings = new LocalizedStrings({
 en:{
   attendees:"Attendees"
 },
 fr: {
   attendees:"Participants"
 }
});

@connect((store) => {
    return {
        participantWaiting: store.voxeet.participantsWaiting
    }
})

class Webinar extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { toggleMicrophone, kickParticipant, isAdmin, isAdminActived } = this.props
        const { participants } = this.props.participantWaiting
        const participantsConnected = participants.filter(p => (p.status == "Inactive"))
        return (
                <div className="webinar-mode">
                  {participantsConnected.length} {strings.attendees}
                </div>
        )
    }
}

Webinar.propTypes = {
    isAdmin: PropTypes.bool.isRequired,
    isAdminActived: PropTypes.bool.isRequired,
    toggleMicrophone: PropTypes.func.isRequired,
    kickParticipant: PropTypes.func.isRequired,
}

export default Webinar
