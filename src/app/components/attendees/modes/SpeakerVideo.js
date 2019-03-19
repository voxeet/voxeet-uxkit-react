import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Sdk from '../../../sdk'

import userPlaceholder from '../../../../static/images/user-placeholder.png'

import AttendeesParticipantVideo from '../AttendeesParticipantVideo'

class SpeakerVideo extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isSpeaking: false
        }
    }

    componentDidMount() {
        const el = this.node
        const { participant } = this.props
        this._interval = setInterval(() => {
            Sdk.instance.isUserSpeaking(participant.participant_id, (isSpeaking) => {

                if (participant.isMuted && this.state.isSpeaking) {
                    this.setState({isSpeaking:false})
                }

                if (this.state.isSpeaking !== isSpeaking && !participant.isMuted)
                    this.setState({isSpeaking})
            })
        }, 300)
    }


    shouldComponentUpdate(nextProps, nextState) {
      const checker = document.getElementById("video-" + this.props.nbParticipant + "-video-on")
      if (nextProps.participant != this.props.participant || (checker != null && nextProps.participant.stream == null || checker == null && nextProps.participant.stream) || (this.props.nbParticipant != nextProps.nbParticipant) || (this.props.mySelf && this.props.participant.name == null) || ((this.state.isSpeaking != nextState.isSpeaking) && !checker)) {
        return true
      }
      return false
    }

    render() {
        const { participant, nbParticipant, mySelf } = this.props
        const photoUrl = participant.avatarUrl || userPlaceholder
        let className = ' avatar-vumeter ';
        if (this.state.isSpeaking) {
            className += ' avatar-vumeter-active';
        }

        return (
            <div id={"video-" + nbParticipant + "-video-" + (participant.stream ? "on" : "off")} className="participant-video video-frame">
                {participant.stream ?
                  <div className={'item ' + className} >
                    <div className="container-avatar-vumeter">
                      <div className={mySelf ? "stream-media myself" : "stream-media"}>
                          <AttendeesParticipantVideo stream={participant.stream} />
                      </div>
                    </div>
                  </div>
                    :
                    <img
                        src={photoUrl}
                        className={"preview-avatar " + className}
                        alt="Avatar"
                    />
                }
            </div>
        )
    }
}

SpeakerVideo.defaultProps = {
  mySelf: false
}

SpeakerVideo.propTypes = {
    participant: PropTypes.object.isRequired,
    mySelf: PropTypes.bool,
    nbParticipant: PropTypes.number
}

export default SpeakerVideo
