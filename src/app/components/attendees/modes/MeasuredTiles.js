import React, { Component } from "react";
import PropTypes from "prop-types";
import Measure from "react-measure";
import { updateSpatialScene } from "../../../libs/position";
import { connect } from "react-redux";
import Tiles from "./Tiles";
import { getUxKitContext } from "../../../context";

@connect(
  (store) => {
    return {
      participantStore: store.voxeet.participants,
      errorStore: store.voxeet.error,
    };
  },
  null,
  null,
  { context: getUxKitContext() }
)

class MeasuredTiles extends Component {
  onBoundsChange(size) {
    updateSpatialScene(size.bounds);
  }

  render() {
    const {
      participants,
      toggleMicrophone,
      isWidgetFullScreenOn,
      kickParticipant,
      isAdmin,
      isAdminActived,
      currentUser,
      isWebinar,
      dolbyVoiceEnabled,
      kickPermission,
      spatialAudioEnabled
    } = this.props;
    //Wrap this component if spatial is enabled to track layout changes
    return (
      <Measure bounds onResize={this.onBoundsChange}>
        {({ measureRef }) => (
              <Tiles
              forwardedRef={measureRef}
              participants={participants}
              isAdmin={isAdmin}
              isWebinar={isWebinar}
              isAdminActived={isAdminActived}
              currentUser={currentUser}
              kickParticipant={kickParticipant}
              toggleMicrophone={toggleMicrophone}
              isWidgetFullScreenOn={isWidgetFullScreenOn}
              dolbyVoiceEnabled={dolbyVoiceEnabled}
              kickPermission={kickPermission}
              spatialAudioEnabled={spatialAudioEnabled}
            />
        )}
      </Measure>
    );
  }
}

MeasuredTiles.propTypes = {
  participants: PropTypes.array.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  isWebinar: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
  kickPermission: PropTypes.bool,
};

export default MeasuredTiles;
