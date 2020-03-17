import React, { Component } from "react";
import PropTypes from "prop-types";

import Tile from "./Tile";
import AttendeesWaitingWebinarListener from "../AttendeesWaitingWebinarListener";

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
      isWebinar
    } = this.props;
    let nbParticipants = participants.filter(p => p.isConnected).length;
    if ((!isWebinar && !currentUser.isListener) || (isWebinar && isAdmin))
      nbParticipants += 1;
    let count = -1;
    return (
      <div className="SidebarTiles" data-number-user={nbParticipants}>
        <div className="tiles-list">
          {((!isWebinar && !currentUser.isListener) ||
            (isWebinar && isAdmin)) && (
            <Tile
              participant={currentUser}
              isAdminActived={isAdminActived}
              mySelf={true}
              kickParticipant={kickParticipant}
              isAdmin={isAdmin}
              toggleMicrophone={toggleMicrophone}
              isWidgetFullScreenOn={isWidgetFullScreenOn}
            />
          )}
          {participants.map((participant, i) => {
            if (participant.isConnected) {
              count = count + 1;
              return (
                <Tile
                  participant={participant}
                  nbParticipant={count}
                  mySelf={false}
                  isAdminActived={isAdminActived}
                  key={i}
                  kickParticipant={kickParticipant}
                  isAdmin={isAdmin}
                  toggleMicrophone={toggleMicrophone}
                  isWidgetFullScreenOn={isWidgetFullScreenOn}
                />
              );
            }
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
  isAdminActived: PropTypes.bool.isRequired
};

export default Tiles;
