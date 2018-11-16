import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization';
import { Actions as ActiveSpeakerActions } from '../../../actions/ActiveSpeakerActions'

import Speaker from './Speaker'
import SpeakerActive from './SpeakerActive'
import SpeakerVideo from './SpeakerVideo'
import AttendeesParticipantBar from '../AttendeesParticipantBar'

let strings = new LocalizedStrings({
 en:{
   screensharerunning: "Happy Screen Sharing!"
 },
 fr: {
   screensharerunning: "Partage d'écran en cours"
 }
});

@connect((store) => {
    return {
        activeSpeakerStore: store.voxeet.activeSpeaker
    }
})

class Speakers extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.dispatch(ActiveSpeakerActions.startActiveSpeaker())
    }

    componentWillUnmount() {
        this.props.dispatch(ActiveSpeakerActions.stopActiveSpeaker())
    }

    render() {
        const { participants, forceActiveSpeaker, disableForceActiveSpeaker, toggleMicrophone, isWidgetFullScreenOn, screenShareEnabled, screenShareStream, isAdmin, kickParticipant, isAdminActived, userIdStreamScreenShare, currentUser, isWebinar, isScreenshare, isElectron } = this.props
        const { activeSpeaker, forceActiveUserEnabled } = this.props.activeSpeakerStore
        let activeSpeakerChecker = activeSpeaker
        let count = -1
        if (activeSpeakerChecker == null) {
          activeSpeakerChecker = participants[0]
        }
        if (participants.length == 0) {
          activeSpeakerChecker = currentUser
        }

        return (
            <div className="SidebarSpeaker">
                {(activeSpeakerChecker || screenShareEnabled) &&
                  !isScreenshare ?
                    <SpeakerActive
                        participant={activeSpeakerChecker}
                        toggleMicrophone={toggleMicrophone}
                        isWidgetFullScreenOn={isWidgetFullScreenOn}
                        screenShareEnabled={screenShareEnabled}
                        screenShareStream={screenShareStream}
                        isElectron={isElectron}
                        isScreenshare={isScreenshare}
                        kickParticipant={kickParticipant}
                        isAdmin={isAdmin}
                        isAdminActived={isAdminActived}
                    />
                  :
                  <div className="screenshare-current-user">
                    <div className="screenshare-current-user-enable">
                      {strings.screensharerunning}
                    </div>
                    <SpeakerActive
                        participant={activeSpeakerChecker}
                        toggleMicrophone={toggleMicrophone}
                        isWidgetFullScreenOn={isWidgetFullScreenOn}
                        screenShareEnabled={screenShareEnabled}
                        isElectron={isElectron}
                        screenShareStream={screenShareStream}
                        kickParticipant={kickParticipant}
                        isAdmin={isAdmin}
                        isAdminActived={isAdminActived}
                    />
                  </div>
                }
                <div className="SidebarList">
                    {participants.length >= 1 &&
                        <ul className="list-items">
                            {participants.map((participant, i) => {
                                count = count + 1
                                return(<Speaker key={i}
                                    participant={participant}
                                    toggleMicrophone={toggleMicrophone}
                                    kickParticipant={kickParticipant}
                                    isAdmin={isAdmin}
                                    nbParticipant={count}
                                    screenShareEnabled={screenShareEnabled}
                                    activeSpeaker={activeSpeakerChecker}
                                    forceActiveUserEnabled={forceActiveUserEnabled}
                                    isAdminActived={isAdminActived}
                                    isWidgetFullScreenOn={isWidgetFullScreenOn}
                                    disableForceActiveSpeaker={disableForceActiveSpeaker}
                                    forceActiveSpeaker={forceActiveSpeaker} />)
                              }
                          )}
                          { !isWebinar && !isAdmin &&
                            <li className={'item participant-available myself'}>
                                <SpeakerVideo mySelf={true} participant={currentUser} />
                                <AttendeesParticipantBar participant={currentUser} />
                            </li>
                          }
                        </ul>
                    }
                </div>
            </div>
        )
    }
}

Speakers.propTypes = {
    participants: PropTypes.array.isRequired,
    forceActiveSpeaker: PropTypes.func.isRequired,
    disableForceActiveSpeaker: PropTypes.func.isRequired,
    userIdStreamScreenShare: PropTypes.string,
    isWebinar: PropTypes.bool.isRequired,
    isScreenshare: PropTypes.bool,
    toggleMicrophone: PropTypes.func.isRequired,
    isElectron: PropTypes.bool.isRequired,
    isWidgetFullScreenOn: PropTypes.bool.isRequired,
    screenShareEnabled: PropTypes.bool.isRequired,
    screenShareStream: PropTypes.object,
    userStream: PropTypes.object,
    kickParticipant: PropTypes.func.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    isAdminActived: PropTypes.bool.isRequired,
}

export default Speakers
