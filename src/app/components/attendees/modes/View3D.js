import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import ReactDOM from "react-dom";
import View3DItem from "./View3DItem";

class View3D extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      toggleMicrophone,
      setUserPosition,
      kickParticipant,
      isAdmin,
      isAdminActived,
      saveUserPosition,
      participants,
      dolbyVoiceEnabled
    } = this.props;
    const participantsConnected = [];
    let size = 0;
    for (var i = 0; i < participants.length; i++) {
      if (participants[i].isConnected === true) {
        size = size + 1;
        participantsConnected.push(participants[i]);
      }
    }

    return (
      <div className="Sidebar3D" id="Sidebar3D">
        {participantsConnected.map((participant, i) => {
          return (
            <View3DItem
              key={i}
              index={i}
              isAdmin={isAdmin}
              isAdminActived={isAdminActived}
              participant={participant}
              size={size}
              setUserPosition={setUserPosition}
              saveUserPosition={saveUserPosition}
              kickParticipant={kickParticipant}
              toggleMicrophone={toggleMicrophone}
              dolbyVoiceEnabled={dolbyVoiceEnabled}
            />
          );
        })}
      </div>
    );
  }
}

View3D.propTypes = {
  participants: PropTypes.array.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  setUserPosition: PropTypes.func.isRequired,
  saveUserPosition: PropTypes.func.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
};

export default View3D;
