import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import { strings } from "../../languages/localizedStrings";
import { connect } from "react-redux";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import userPlaceholder from "../../../static/images/user-placeholder.png";
import iconPlus from "../../../static/images/icons/icon-plus.svg";
import iconSlideLeft from "../../../static/images/icons/icon-slide-left.svg";
import { Actions as ParticipantActions } from "../../actions/ParticipantActions";
import AttendeesParticipantMute from "./AttendeesParticipantMute";
import AttendeesParticipantCamera from "./AttendeesParticipantCamera";
import {getUxKitContext} from "../../context";

@connect((store) => {
  return {
    participantStore: store.voxeet.participants,
    participantWaiting: store.voxeet.participantsWaiting,
    activeSpeakerStore: store.voxeet.activeSpeaker,
  };
}, null, null, { context: getUxKitContext() })
class AttendeesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      runningAnimation: false,
      attendeesListOpened: props.attendeesListOpened,
      q: "",
      // view: 'participants',
      filteredUsers: this.props.participantStore.invitedUsers,
    };
    this.filterList = this.filterList.bind(this);
    this.inviteUserSelected = this.inviteUserSelected.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Check if it should stop animation
    if (
        prevProps.attendeesListOpened == true &&
        this.props.attendeesListOpened == false
    ) {
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState){
    let stateUpdate = {attendeesListOpened: nextProps.attendeesListOpened};
    // Check if it should run animation
    if (
        prevState.attendeesListOpened == true &&
        nextProps.attendeesListOpened == false
    ) {
      stateUpdate.runningAnimation = true;
    }
    // Filter invited users
    if (nextProps.participantStore.invitedUsers != null) {
      let q = prevState.q;
      let users = nextProps.participantStore.invitedUsers.filter( (user) => {
        return user.name.toLowerCase().indexOf(q) != -1; // returns true or false
      });
      stateUpdate.filteredUsers = users;
    } else {
      stateUpdate.filteredUsers = nextProps.participantStore.invitedUsers;
      stateUpdate.q = "";
    }
    return stateUpdate;
  }

  onChange(event) {
    const q = event.target.value.toLowerCase();
    this.setState({ q }, this.filterList);
  }

  filterList() {
    if (this.props.participantStore.invitedUsers != null) {
      let q = this.state.q;
      let users = this.props.participantStore.invitedUsers.filter( (user) => {
        return user.name.toLowerCase().indexOf(q) != -1; // returns true or false
      });
      this.setState({ filteredUsers: users });
    }
  }

  inviteUserSelected(externalId) {
    const tmpArray = [];
    tmpArray.push(externalId);
    const participantsArray = { externalIds: tmpArray };
    this.props.dispatch(ParticipantActions.userInvited(externalId));
    VoxeetSDK.conference.invite(
      VoxeetSDK.conference.current,
      participantsArray
    );
  }

  render() {
    const {
      activeSpeaker,
      forceActiveUserEnabled
    } = this.props.activeSpeakerStore;
    const {
      participants,
      currentUser,
      invitedUsers,
      quality
    } = this.props.participantStore;
    let audioq = 0,
      videoq = 0,
      avquality = 0;
    if (quality && quality[currentUser.participant_id]) {
      audioq = quality[currentUser.participant_id].audio;
      videoq = quality[currentUser.participant_id].video;
      if (audioq > 0 && videoq > 0) avquality = (audioq + videoq) / 2;
      if ((audioq == 0 || audioq == -1) && videoq > 0) avquality = videoq;
      if (audioq > 0 && (videoq == 0 || videoq == -1)) avquality = audioq;
      //avquality = Math.max(audioq, videoq);
    }
    const { isWebinar, isAdmin, attendeesListOpened, toggleMicrophone, toggleForwardedVideo, dolbyVoiceEnabled, invitePermission } = this.props;
    const { filteredUsers } = this.state;
    const participantsConnected = participants.filter(
      (p) => p.isConnected
    );
    let userNotYetInvitedWithoutFilter = null;
    let userNotYetInvitedWithFilter = null;
    const participantsListener = this.props.participantWaiting.participants.filter(
      (p) => p.stream == null && p.isConnected && p.type == "listener"
    );
    const participantsInvited = this.props.participantWaiting.participants.filter(
      (p) => p.status == "Reserved"
    );
    const participantsInactive = this.props.participantWaiting.participants.filter(
      (p) => p.status == "Inactive"
    );
    const participantsLeft = this.props.participantWaiting.participants.filter(
      (p) => p.status == "Left"
    );
    if (invitedUsers != null) {
      userNotYetInvitedWithoutFilter = invitedUsers.filter(
        (p) => p.invited == false
      );
      userNotYetInvitedWithFilter = filteredUsers.filter(
        (p) => p.invited == false
      );
    }
    return (
      <div
        className={
          this.state.runningAnimation
            ? "attendees-list attendees-list-out"
            : attendeesListOpened
              ? "attendees-list"
              : "attendees-list-hidden"
        }
      >
        <div className="attendees-list-header">
          <h1>{strings.attendees}</h1>
        </div>
        {isWebinar ? (
          <div>
            {(participantsConnected.length > 0 || isAdmin) && (
              <div>
                <div className="title-section">
                  {strings.presenter}{" "}
                  <span>
                    (
                    {isAdmin
                      ? participantsConnected.length + 1
                      : participantsConnected.length}
                    )
                  </span>
                </div>
                <ul>
                  {isAdmin && (
                    <li>
                      <span className={"participant-details " +
                        ((activeSpeaker && currentUser.participant_id == activeSpeaker.participant_id && activeSpeaker.isSpeaking) ? "speaking" : "")}>
                        <img
                          src={currentUser.avatarUrl || userPlaceholder}
                          className="participant-avatar"
                        />
                        <span className="participant-username">
                          {currentUser.name}
                        </span>
                      </span>
                    </li>
                  )}
                  {participantsConnected.map((participant, i) => {
                    return (
                      <li key={i}>
                        <span className={"participant-details " +
                          ((activeSpeaker && participant.participant_id == activeSpeaker.participant_id && activeSpeaker.isSpeaking) ? "speaking" : "")}>
                          <img
                            src={participant.avatarUrl || userPlaceholder}
                            className="participant-avatar"
                          />
                          <span className="participant-username">
                            {participant.name}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {(participantsListener.length > 0 || !isAdmin) && (
              <div>
                <div className="title-section">
                  {strings.listener}{" "}
                  <span>
                    (
                    {!isAdmin
                      ? participantsListener.length + 1
                      : participantsListener.length}
                    )
                  </span>
                </div>
                <ul>
                  {!isAdmin && (
                    <li>
                      <span className={"participant-details " +
                        ((activeSpeaker && currentUser.participant_id == activeSpeaker.participant_id && activeSpeaker.isSpeaking) ? "speaking" : "")}>
                        <img
                          src={currentUser.avatarUrl || userPlaceholder}
                          className="participant-avatar"
                        />
                        <span className="participant-username">
                          {currentUser.name}
                        </span>
                      </span>
                    </li>
                  )}
                  {participantsListener.map((participant, i) => {
                    return (
                      <li key={i}>
                        <span className={"participant-details " +
                          ((activeSpeaker && participant.participant_id == activeSpeaker.participant_id && activeSpeaker.isSpeaking) ? "speaking" : "")}>
                          <img
                            src={participant.avatarUrl || userPlaceholder}
                            className="participant-avatar"
                          />
                          <span className="participant-username">
                            {participant.name}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ) : (
            <Fragment>
              {(participantsConnected.length > 0 || !currentUser.isListener) && (
                <div>
                  <div className="title-section">
                    {strings.joined}{" "}
                    <span>
                      (
                    {!currentUser.isListener
                        ? participantsConnected.length + 1
                        : participantsConnected.length}
                      )
                  </span>
                  </div>
                  <ul>
                    {/* <li>
                        <span className="participant-details">
                          <img
                            src={iconPlus}
                            className="participant-avatar active"
                            onClick={() => this.setView('invited')}
                          />
                          <span className="participant-username add-participant">
                            {strings.addParticipant}
                          </span>
                        </span>
                      </li> */}
                    {!currentUser.isListener && (
                      <li>
                        <span className={"participant-details " +
                          ((activeSpeaker && currentUser.participant_id == activeSpeaker.participant_id && activeSpeaker.isSpeaking) ? "speaking" : "")}>
                          <img
                            src={currentUser.avatarUrl || userPlaceholder}
                            className="participant-avatar"
                          />
                          <div className="quality">
                            <div className={avquality >= 0.5 ? "on" : "off"} />
                            <div className={avquality >= 1.5 ? "on" : "off"} />
                            <div className={avquality >= 2.5 ? "on" : "off"} />
                            <div className={avquality >= 3.5 ? "on" : "off"} />
                            <div className={avquality >= 4.5 ? "on" : "off"} />
                          </div>
                          <span className="participant-username">
                            {currentUser.name}
                          </span>
                        </span>
                      </li>
                    )}
                    {participantsConnected.map((participant, i) => {
                      let audioq = 0,
                        videoq = 0,
                        avquality = 0;
                      if (quality && quality[participant.participant_id]) {
                        audioq = quality[participant.participant_id].audio;
                        videoq = quality[participant.participant_id].video;
                        if (audioq > 0 && videoq > 0) avquality = (audioq + videoq) / 2;
                        if ((audioq == 0 || audioq == -1) && videoq > 0) avquality = videoq;
                        if (audioq > 0 && (videoq == 0 || videoq == -1)) avquality = audioq;
                        //avquality = Math.max(audioq, videoq);
                      }
                      return (
                        <li key={i}>
                          <span className={"participant-details " +
                            ((activeSpeaker && participant.participant_id == activeSpeaker.participant_id && activeSpeaker.isSpeaking) ? "speaking" : "")}>
                            <img
                              src={participant.avatarUrl || userPlaceholder}
                              className="participant-avatar"
                            />
                            <div className="quality">
                              <div className={avquality >= 0.5 ? "on" : "off"} />
                              <div className={avquality >= 1.5 ? "on" : "off"} />
                              <div className={avquality >= 2.5 ? "on" : "off"} />
                              <div className={avquality >= 3.5 ? "on" : "off"} />
                              <div className={avquality >= 4.5 ? "on" : "off"} />
                            </div>
                            <span className="participant-username">
                              {participant.name}
                            </span>
                            {toggleMicrophone != null && !participant.isMyself && !(dolbyVoiceEnabled && currentUser.isListener) && (
                              <AttendeesParticipantMute
                                participant={participant}
                                toggleMicrophone={toggleMicrophone}
                              />
                            )}
                            <AttendeesParticipantCamera
                              participant={participant}
                              toggleForwardedVideo={toggleForwardedVideo}
                            />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {(participantsInactive.length > 0 ||
                participantsListener.length > 0 ||
                currentUser.isListener) && (
                  <div>
                    <div className="title-section">
                      {strings.listener}{" "}
                      <span>
                        (
                    {currentUser.isListener
                          ? participantsInactive.length +
                          participantsListener.length +
                          1
                          : participantsInactive.length +
                          participantsListener.length}
                        )
                  </span>
                    </div>
                    <ul>
                      {currentUser.isListener && (
                        <li>
                          <span className="participant-details">
                            <img
                              src={currentUser.avatarUrl || userPlaceholder}
                              className="participant-avatar"
                            />
                            <span className="participant-username">
                              {currentUser.name}
                            </span>
                          </span>
                        </li>
                      )}
                      {participantsListener.map((participant, i) => {
                        return (
                          <li key={i}>
                            <span className="participant-details">
                              <img
                                src={participant.avatarUrl || userPlaceholder}
                                className="participant-avatar"
                              />
                              <span className="participant-username">
                                {participant.name}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                      {participantsInactive.map((participant, i) => {
                        return (
                          <li key={i}>
                            <span className="participant-details">
                              <img
                                src={participant.avatarUrl || userPlaceholder}
                                className="participant-avatar"
                              />
                              <span className="participant-username">
                                {participant.name}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
            </Fragment>
          )}
        {participantsInvited.length > 0 && (
          <div>
            <div className="title-section">
              {strings.invited} <span>({participantsInvited.length})</span>
            </div>
            <ul className="participant-invited">
              {participantsInvited.map((participant, i) => {
                return (
                  <li key={i}>
                    <span className="participant-details">
                      <img
                        src={participant.avatarUrl || userPlaceholder}
                        className="participant-avatar"
                      />
                      <span className="participant-username">
                        {participant.name}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {participantsLeft.length > 0 && (
          <div>
            <div className="title-section">
              {strings.left} <span>({participantsLeft.length})</span>
            </div>
            <ul className="participant-invited">
              {participantsLeft.map((participant, i) => {
                return (
                  <li key={i}>
                    <span className="participant-details">
                      <img
                        src={participant.avatarUrl || userPlaceholder}
                        className="participant-avatar"
                      />
                      <span className="participant-username">
                        {participant.name}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {userNotYetInvitedWithFilter != null &&
          currentUser.externalId &&
          invitedUsers.length > 0 &&
          (!currentUser.isListener || (isWebinar && isAdmin)) && (
            <div className="invite-user-container">
              <div className="title-section">
                {strings.invitedUsers}{" "}
                <span>({userNotYetInvitedWithoutFilter.length})</span>
              </div>
              <input
                type="search"
                id="search-user"
                value={this.state.q}
                onChange={this.onChange}
                name="q"
                placeholder="Search invited users"
                aria-label="Search invited user"
              />
              <ul className="participant-waiting-for-invite">
                {userNotYetInvitedWithFilter.map((user, i) => {
                  return (
                    <li key={i}>
                      <span className="participant-details">
                        <img
                          src={user.avatarUrl || userPlaceholder}
                          className="participant-avatar"
                        />
                        <span className="participant-username">
                          {user.name}
                          {user.title && (
                            <span className="participant-email">
                              {user.title}
                            </span>
                          )}
                        </span>
                        { invitePermission && (
                        <a
                          className="invite-user"
                          onClick={() =>
                            this.inviteUserSelected(user.externalId)
                          }
                        >
                          {strings.inviteUser}
                        </a> )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
      </div>
    );
  }
}

AttendeesList.propTypes = {
  attendeesListOpened: PropTypes.bool.isRequired,
  isWebinar: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  dolbyVoiceEnabled: PropTypes.bool,
  invitePermission: PropTypes.bool
};

export default AttendeesList;