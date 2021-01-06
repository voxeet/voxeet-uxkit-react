import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import { strings } from "../../languages/localizedStrings";
import CameraOff from "../../../static/images/icons/btn-camera-off.svg";
import CameraOn from "../../../static/images/icons/btn-camera-dark.svg";
import CameraPinned from "../../../static/images/icons/btn-camera-green.svg";

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
    const { participantIds } = forwardedVideoStore;
    const { requestedVideos } = controlsStore;
    let active = (participantIds && participantIds.indexOf(participant.participant_id) > -1)
    let pinned = (requestedVideos && requestedVideos.indexOf(participant.participant_id) > -1)
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
          <img
            src={pinned ? CameraPinned : (active ? CameraOn : CameraOn)}
            width={25}
            height={25}
            title={pinned ? strings.pinnedCameraOn : (active ? strings.pinnedCameraOff : strings.pinnedCameraOff)}
          />
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
