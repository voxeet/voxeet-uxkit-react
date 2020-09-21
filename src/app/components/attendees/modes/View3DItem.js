import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Draggable from "react-draggable";

import AttendeesParticipantVuMeter from "../AttendeesParticipantVuMeter";
import AttendeesParticipantVideo from "../AttendeesParticipantVideo";
import AttendeesParticipantBar from "../AttendeesParticipantBar";

import { Actions as ParticipantActions } from "../../../actions/ParticipantActions";

import {
  getOrganizedPosition,
  getRelativePosition
} from "../../../libs/position";

class View3DItem extends Component {
  constructor(props) {
    super(props);
    const { participant, size } = this.props;
    this.state = {
      parent: null,
      posX: participant.x,
      size: size,
      posY: participant.y,
      participant: participant,
      timeout: true
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { participant, setUserPosition, size, index } = this.props;
    const el = this.node;
    const parent = ReactDOM.findDOMNode(el).parentNode;
    const height = window.innerHeight - 85;
    const width = window.innerWidth;
    if (
      (nextProps.size != this.state.size && !nextProps.participant.isMoved) ||
      (this.state.posX == -1 && this.state.posY == -1)
    ) {
      const { size, index } = this.props;
      const position = getOrganizedPosition({
        width: width,
        height: height,
        size: size,
        index: index
      });

      const relativePosition = getRelativePosition(
        parent.clientWidth,
        parent.clientHeight,
        position.posX,
        position.posY
      );
      setUserPosition(
        participant.participant_id,
        relativePosition,
        position,
        false
      );
      this.setState({
        parent: parent,
        participant: participant,
        posX: position.posX,
        posY: position.posY,
        size: size
      });
      return true;
    } else if (
      nextState.posX != this.state.posX ||
      nextState.posY != this.state.posY
    ) {
      this.setState({
        parent: parent,
        posX: nextProps.participant.x,
        posY: nextProps.participant.y,
        size: size,
        participant: participant
      });
      return true;
    }
    return true;
  }

  componentDidMount() {
    const el = this.node;
    const parent = ReactDOM.findDOMNode(el).parentNode;
    this.setState({ parent: parent });
  }

  render() {
    const {
      participant,
      toggleMicrophone,
      kickParticipant,
      isAdmin,
      isAdminActived,
      dolbyVoiceEnabled
    } = this.props;
    const { posX, posY } = this.state;
    return (
      <Draggable
        ref={r => (this.node = r)}
        position={{ x: posX, y: posY }}
        onStart={(e, ui) => this.handleStart(e, ui)}
        onDrag={(e, ui) => this.handleDrag(e, ui)}
        onStop={(e, ui) => this.handleStop(e, ui)}
      >
        <div>
          <div className="participant-bubble">
            {participant.stream ? (
              <AttendeesParticipantVuMeter
                participant={participant}
                isVideo={true}
              />
            ) : (
              <AttendeesParticipantVuMeter participant={participant} />
            )}
          </div>
          <AttendeesParticipantBar
            kickParticipant={kickParticipant}
            isAdminActived={isAdminActived}
            isAdmin={isAdmin}
            participant={participant}
            toggleMicrophone={toggleMicrophone}
            is3D={true}
            dolbyVoiceEnabled={dolbyVoiceEnabled}
          />
        </div>
      </Draggable>
    );
  }

  handleStart(event, ui) {}

  handleDrag(event, ui) {
    if (!this._canMove(ui)) return false;

    const { posX, posY, parent } = this.state;
    const { participant, setUserPosition } = this.props;

    const relativePosition = getRelativePosition(
      parent.clientWidth,
      parent.clientHeight,
      ui.x,
      ui.y
    );

    const newPosition = {
      posX: ui.x,
      posY: ui.y
    };
    if (this.state.timeout == true) {
      this.setState({ timeout: false });
      setTimeout(() => {
        setUserPosition(
          participant.participant_id,
          relativePosition,
          newPosition,
          true
        );
        this.setState({ timeout: true });
      }, 150);
    }
  }

  handleStop(event, ui) {
    if (!this._canMove(ui)) return false;

    const { posX, posY, parent } = this.state;
    const { participant, saveUserPosition } = this.props;

    const relativePosition = getRelativePosition(
      parent.clientWidth,
      parent.clientHeight,
      ui.x,
      ui.y
    );

    const newPosition = {
      posX: ui.x,
      posY: ui.y
    };
    saveUserPosition(participant.participant_id, relativePosition, newPosition);
    this.setState({ posX: ui.x, posY: ui.y });
  }

  _canMove(ui) {
    const { parent } = this.state;
    return (
      ui.x < parent.clientWidth - 140 &&
      ui.x > 10 &&
      ui.y < parent.clientHeight - 35 - 120 &&
      ui.y > 0
    );
  }
}

View3DItem.propTypes = {
  participant: PropTypes.object.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  setUserPosition: PropTypes.func.isRequired,
  saveUserPosition: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  kickParticipant: PropTypes.func.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
};

export default View3DItem;
