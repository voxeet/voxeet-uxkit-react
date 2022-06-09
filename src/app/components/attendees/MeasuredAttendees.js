import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Measure from "react-measure";
import { updateSpatialScene } from "../../libs/position";

import Attendees from "./Attendees";

import { getUxKitContext } from "../../context";

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
class MeasuredAttendees extends Component {
  onBoundsChange(size) {
    updateSpatialScene(size.bounds);
  }

  render() {
    const {
      mode,
      conferenceId,
      toggleMode,
      forceFullscreen,
      toggleWidget,
      isWidgetOpened,
      isModalExternalLive,
      videoEnabled,
      isWidgetFullScreenOn,
      displayModal,
      isAdminActived,
      displayModes,
      isScreenshare,
      isVideoPresentation,
      isFilePresentation,
      attendeesWaiting,
      attendeesListOpened,
      attendeesChatOpened,
      attendeesSettingsOpened,
      attendeesChat,
      attendeesList,
      dolbyVoiceEnabled,
      conferencePermissions,
      chatOptions,
      spatialAudioEnabled,
    } = this.props;
    //Wrap this component if spatial is enabled to track layout changes
    return (
      <Measure bounds onResize={this.onBoundsChange}>
        {({ measureRef }) => (
          <Attendees
            forwardedRef={measureRef}
            mode={mode}
            conferenceId={conferenceId}
            toggleMode={toggleMode}
            forceFullscreen={forceFullscreen}
            toggleWidget={toggleWidget}
            isWidgetOpened={isWidgetOpened}
            isModalExternalLive={isModalExternalLive}
            videoEnabled={videoEnabled}
            isWidgetFullScreenOn={isWidgetFullScreenOn}
            displayModal={displayModal}
            isAdminActived={isAdminActived}
            displayModes={displayModes}
            isScreenshare={isScreenshare}
            isVideoPresentation={isVideoPresentation}
            isFilePresentation={isFilePresentation}
            attendeesWaiting={attendeesWaiting}
            attendeesListOpened={attendeesListOpened}
            attendeesChatOpened={attendeesChatOpened}
            attendeesSettingsOpened={attendeesSettingsOpened}
            attendeesChat={attendeesChat}
            attendeesList={attendeesList}
            dolbyVoiceEnabled={dolbyVoiceEnabled}
            conferencePermissions={conferencePermissions}
            chatOptions={chatOptions}
            spatialAudioEnabled={spatialAudioEnabled}
          />
        )}
      </Measure>
    );
  }
}

MeasuredAttendees.propTypes = {
  mode: PropTypes.string.isRequired,
  conferenceId: PropTypes.string,
  toggleMode: PropTypes.func.isRequired,
  isWidgetOpened: PropTypes.bool.isRequired,
  toggleWidget: PropTypes.func.isRequired,
  attendeesListOpened: PropTypes.bool.isRequired,
  attendeesChatOpened: PropTypes.bool.isRequired,
  attendeesSettingsOpened: PropTypes.bool.isRequired,
  forceFullscreen: PropTypes.bool,
  videoEnabled: PropTypes.bool,
  isWidgetFullScreenOn: PropTypes.bool,
  displayModal: PropTypes.bool,
  isAdminActived: PropTypes.bool,
  displayModes: PropTypes.array,
  isScreenshare: PropTypes.bool,
  isVideoPresentation: PropTypes.bool,
  videoPresentationEnabled: PropTypes.bool,
  isFilePresentation: PropTypes.bool,
  attendeesWaiting: PropTypes.func,
  attendeesChat: PropTypes.object,
  attendeesList: PropTypes.object,
  dolbyVoiceEnabled: PropTypes.bool,
  conferencePermissions: PropTypes.object,
  chatOptions: PropTypes.object,
};

export default MeasuredAttendees;
