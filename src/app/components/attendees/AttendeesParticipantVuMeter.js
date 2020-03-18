import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { Actions as ParticipantActions } from "../../actions/ParticipantActions";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import userPlaceholder from "../../../static/images/user-placeholder.png";
import AttendeesParticipantVideo from "./AttendeesParticipantVideo";

class AttendeesParticipantVuMeter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSpeaking: false
    };
  }

  componentDidMount() {
    const el = this.node;
    const { participant } = this.props;
    this._interval = setInterval(() => {
      VoxeetSDK.conference.isSpeaking(VoxeetSDK.conference.participants.get(participant.participant_id), isSpeaking => {
        if (participant.isMuted && this.state.isSpeaking) {
          this.setState({ isSpeaking: false });
        }

        if (this.state.isSpeaking !== isSpeaking && !participant.isMuted)
          this.setState({ isSpeaking });
      });
    }, 300);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  render() {
    const {
      height,
      width,
      includeName,
      isVideo,
      participant,
      isActiveSpeaker
    } = this.props;
    let className = " avatar-vumeter ";
    const photoUrl = participant.avatarUrl || userPlaceholder;
    if (this.props.customClass !== undefined) {
      className += this.props.customClass;
    }
    if (this.state.isSpeaking && !isActiveSpeaker) {
      className += " avatar-vumeter-active";
    }
    return isVideo ? (
      <div className={"item " + className}>
        <div className="container-avatar-vumeter" width={width}>
          <AttendeesParticipantVideo
            width="200"
            height="200"
            stream={participant.stream}
          />
        </div>
      </div>
    ) : (
      <div className="container-avatar-vumeter" width={width}>
        <img src={photoUrl} className={className} />
        {includeName && (
          <div className="avatar-vumeter-name">
            {this.props.participant.name}
          </div>
        )}
      </div>
    );
  }
}

AttendeesParticipantVuMeter.propTypes = {
  participant: PropTypes.object.isRequired,
  customClass: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  includeName: PropTypes.bool,
  isVideo: PropTypes.bool,
  isActiveSpeaker: PropTypes.bool
};

AttendeesParticipantVuMeter.defaultProps = {
  includeName: false,
  isActiveSpeaker: false,
  isVideo: false
};

export default AttendeesParticipantVuMeter;
