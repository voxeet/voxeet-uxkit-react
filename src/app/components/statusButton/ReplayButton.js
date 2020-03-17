import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";

import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import { Actions as ControlsActions } from "../../actions/ControlsActions";
import { Actions as ErrorActions } from "../../actions/ErrorActions";

import Modal from "../attendees/modal/Modal";

import { Replay } from "./status";

@connect(state => {
  return {
    conferenceStore: state.voxeet.conference,
    errorStore: state.voxeet.error,
    controlsStore: state.voxeet.controls
  };
})
class ReplayButton extends Component {
  constructor(props) {
    super(props);
    this.toggleErrorModal = this.toggleErrorModal.bind(this);
  }

  replayConference(conferenceId) {
    const { isModal } = this.props;
    const { isJoined } = this.props.conferenceStore;
    if (!isJoined) {
      this.props.dispatch(ConferenceActions.replay(conferenceId, 0));
    } else if (isModal) {
      this.props.dispatch(ControlsActions.toggleModal());
    }
  }

  toggleErrorModal() {
    this.props.dispatch(ControlsActions.toggleModal());
    this.props.dispatch(ErrorActions.onClearError());
  }

  render() {
    const { isJoined, initialized } = this.props.conferenceStore;
    const { errorMessage, isError } = this.props.errorStore;

    const conferenceId = this.props.conferenceId;
    if (conferenceId == null) return null;
    if (conferenceId != null && !isJoined) {
      return <Replay replay={this.replayConference.bind(this, conferenceId)} />;
    } else if (initialized) {
      const { displayModal } = this.props.controlsStore;
      if (displayModal && isError) {
        return (
          <div>
            <Modal
              error={JSON.stringify(errorMessage)}
              isModalError={true}
              toggle={this.toggleErrorModal}
            />
          </div>
        );
      }
    }
    return null;
  }
}

ReplayButton.propTypes = {
  isModal: PropTypes.bool,
  conferenceId: PropTypes.string
};

ReplayButton.defaultProps = {
  conferenceId: null,
  isModal: false
};

export default ReplayButton;
