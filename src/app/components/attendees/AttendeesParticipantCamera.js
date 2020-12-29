import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import CameraOff from "../../../static/images/icons/btn-camera-off.svg";
import CameraOn from "../../../static/images/icons/btn-camera-dark.svg";
import CameraPinned from "../../../static/images/icons/icon-camera-on-green.svg";

@connect(store => {
  return {
    //participantStore: store.voxeet.participants,
    forwardedVideoStore: store.voxeet.forwardedVideo,
    controlsStore: store.voxeet.controls,
  };
})
class AttendeesParticipantCamera extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { participant, toggleForwardedVideo, forwardedVideoStore, controlsStore } = this.props;
    const {participantIds} = forwardedVideoStore;
    const {requestedVideos} = controlsStore;
    let active = (participantIds && participantIds.indexOf(participant.participant_id)>-1)
    let pinned = (requestedVideos && requestedVideos.indexOf(participant.participant_id)>-1)
    return (
      <span className="participant-camera">
        <a
          className={
            "icon-camera-participant-" + (active ? "on" : "off") + (pinned ? "pinned" : "")
          }
          onClick={e => {
            e.stopPropagation();
            toggleForwardedVideo(participant.participant_id);
          }}
        >
          <img src={pinned? CameraPinned: (active ? CameraOn : CameraOff)} width={25} height={25}/>
        </a>
      </span>
    );
  }
}

AttendeesParticipantCamera.propTypes = {
  participant: PropTypes.object,
  toggleForwardedVideo: PropTypes.func
};

export default AttendeesParticipantCamera;
