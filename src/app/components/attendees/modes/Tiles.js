import React, { Component } from "react";
import PropTypes from "prop-types";

import Tile from "./Tile";
import OwnTile from "./OwnTile";
import MeasuredTile from "./MeasuredTile";

class Tiles extends Component {
  constructor(props) {
    super(props);
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
      spatialAudioEnabled,
      forwardedRef,
    } = this.props;
    let tilesParticipants = participants.filter(
        (p) => p.isConnected
    );
    let videoParticipants = tilesParticipants.filter(
        (p) => p.isConnected &&
            ((p.stream !== null) &&
                (p.stream.active) &&
                (p.stream.getVideoTracks().length > 0)
            )
    );
    let hasVideoParticipants = videoParticipants && videoParticipants.length>0;
    let IHaveVideo = (!currentUser || (currentUser.stream && currentUser.stream.getVideoTracks().length > 0));
    if(hasVideoParticipants || IHaveVideo)
      tilesParticipants = videoParticipants;
    let showOwnTile = ((!isWebinar && !currentUser.isListener) ||
        (isWebinar && isAdmin)) &&
        (IHaveVideo || !hasVideoParticipants);

    let nbParticipants = tilesParticipants.length;
    // if (showOwnTile)
    //   nbParticipants += 1;

    let count = 0;
    return (
      <div
        className="SidebarTiles"
        data-number-user={nbParticipants <= 16 ? nbParticipants : 16}
      >
        <div className={"tiles-list list" + nbParticipants}
             ref={forwardedRef}
        >
          { showOwnTile && (
            <OwnTile
              participant={currentUser}
              isAdminActived={isAdminActived}
              mySelf={true}
              kickParticipant={kickParticipant}
              isAdmin={isAdmin}
              toggleMicrophone={toggleMicrophone}
              isWidgetFullScreenOn={isWidgetFullScreenOn}
              dolbyVoiceEnabled={dolbyVoiceEnabled}
              key={currentUser.participant_id}
              currentUser={currentUser}
            />
          )}
          {tilesParticipants.map((participant, i) => {
            count = count + 1;
            return (
              (!spatialAudioEnabled && <Tile
                participant={participant}
                nbParticipant={count}
                mySelf={false}
                isAdminActived={isAdminActived}
                key={participant.participant_id}
                kickParticipant={kickParticipant}
                isAdmin={isAdmin}
                toggleMicrophone={toggleMicrophone}
                isWidgetFullScreenOn={isWidgetFullScreenOn}
                dolbyVoiceEnabled={dolbyVoiceEnabled}
                kickPermission={kickPermission}
                currentUser={currentUser}
                spatialAudioEnabled={spatialAudioEnabled}
              />) ||
              (spatialAudioEnabled && <MeasuredTile
                participant={participant}
                nbParticipant={count}
                mySelf={false}
                isAdminActived={isAdminActived}
                key={participant.participant_id}
                kickParticipant={kickParticipant}
                isAdmin={isAdmin}
                toggleMicrophone={toggleMicrophone}
                isWidgetFullScreenOn={isWidgetFullScreenOn}
                dolbyVoiceEnabled={dolbyVoiceEnabled}
                kickPermission={kickPermission}
                currentUser={currentUser}
                spatialAudioEnabled={spatialAudioEnabled}
              />)
            )
          })}
        </div>
      </div>
    );
  }
}

Tiles.propTypes = {
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

export default Tiles;
