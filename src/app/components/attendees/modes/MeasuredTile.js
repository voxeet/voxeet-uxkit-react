import { useEffect } from "react";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import Measure from "react-measure";
import { useState } from "react";
import Tile from "./Tile";

import { excludeParticipant, includeParticipant } from "../../../libs/position";

export default function MeasuredTile(props) {

  const {
    participant,
    toggleMicrophone,
    isWidgetFullScreenOn,
    isAdmin,
    kickParticipant,
    isAdminActived,
    nbParticipant,
    mySelf,
    dolbyVoiceEnabled,
    kickPermission,
    currentUser,
  } = props;

  //Store position to monitor changes
  const [positionState, setPositionState] = useState(0);

  // Do not generate automatic layout for the participant when this component is mounted
  useEffect(() => {excludeParticipant(props.participant.participant_id)}, []);

  //Start generating automatic layout for the participant when this component is unmounted
  useEffect(
    () => () => {includeParticipant(props.participant.participant_id)},
    []
  );

  const onBoundsUpdate = (size) => {
    const currentBounds = size.bounds;
    if (currentBounds) {
      const participant = VoxeetSDK.conference.current.participants.get(
        props.participant.participant_id
      );
      const position = {
        x: currentBounds.left + currentBounds.width / 2,
        y: currentBounds.top + currentBounds.height / 2,
        z: 0,
      };
      if (position !== positionState) {
        setPositionState(position);
        // Set the position for this participant to be the middle of the tile
        VoxeetSDK.conference.setSpatialPosition(participant, position);
      }
    }
  };

  return (
    <Measure bounds onResize={onBoundsUpdate}>
    {({ measureRef }) => (
              <Tile
              forwardedRef={measureRef}
              participant={participant}
              nbParticipant={nbParticipant}
              mySelf={mySelf}
              isAdminActived={isAdminActived}
              kickParticipant={kickParticipant}
              isAdmin={isAdmin}
              toggleMicrophone={toggleMicrophone}
              isWidgetFullScreenOn={isWidgetFullScreenOn}
              dolbyVoiceEnabled={dolbyVoiceEnabled}
              kickPermission={kickPermission}
              currentUser={currentUser}
            />
    )}
  </Measure>)
}
