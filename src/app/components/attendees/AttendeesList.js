import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import { strings } from "../../languages/localizedStrings";
import { connect } from "@voxeet/react-redux-5.1.1";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import userPlaceholder from "../../../static/images/user-placeholder.png";
import { Actions as ParticipantActions } from "../../actions/ParticipantActions";

@connect(store => {
  return {
    participantStore: store.voxeet.participants,
    participantWaiting: store.voxeet.participantsWaiting
  };
})
class AttendeesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      runningAnimation: false,
      q: "",
      filteredUsers: this.props.participantStore.invitedUsers
    };
    this.inviteUserSelected = this.inviteUserSelected.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this.props.attendeesListOpened == true &&
      nextProps.attendeesListOpened == false
    ) {
      this.setState({ runningAnimation: true });
      setTimeout(() => {
        this.setState({ runningAnimation: false });
      }, 250);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      { filteredUsers: nextProps.participantStore.invitedUsers, q: "" },
      () => this.filterList()
    );
  }

  onChange(event) {
    const q = event.target.value.toLowerCase();
    this.setState({ q }, () => this.filterList());
  }

  filterList() {
    if (this.props.participantStore.invitedUsers != null) {
      let q = this.state.q;
      let users = this.props.participantStore.invitedUsers;
      users = this.props.participantStore.invitedUsers.filter(function(user) {
        return user.name.toLowerCase().indexOf(q) != -1; // returns true or false
      });
      this.setState({ filteredUsers: users });
    }
  }

  inviteUserSelected(externalId) {
    const tmpArray = [];
    tmpArray.push(externalId);
    const test = {"externalIds": tmpArray}
    this.props.dispatch(ParticipantActions.userInvited(externalId));
    VoxeetSDK.notification.invite(VoxeetSDK.conference.current, test);
  }

  render() {
    const {
      participants,
      currentUser,
      invitedUsers
    } = this.props.participantStore;
    const { isWebinar, isAdmin, attendeesListOpened } = this.props;
    const { filteredUsers } = this.state;
    const participantsConnected = participants.filter(p => p.isConnected);
    let userNotYetInvitedWithoutFilter = null;
    let userNotYetInvitedWithFilter = null;
    const participantsListener = this.props.participantWaiting.participants.filter(
      p => p.stream == null && p.isConnected && p.status == "Connecting"
    );
    const participantsInvited = this.props.participantWaiting.participants.filter(
      p => p.status == "Reserved"
    );
    const participantsInactive = this.props.participantWaiting.participants.filter(
      p => p.status == "Inactive"
    );
    const participantsLeft = this.props.participantWaiting.participants.filter(
      p => p.status == "Left"
    );
    if (invitedUsers != null) {
      userNotYetInvitedWithoutFilter = invitedUsers.filter(
        p => p.invited == false
      );
      userNotYetInvitedWithFilter = filteredUsers.filter(
        p => p.invited == false
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
                  {participantsConnected.map((participant, i) => {
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
                  {!currentUser.isListener && (
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
                  {participantsConnected.map((participant, i) => {
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
                        <a
                          className="invite-user"
                          onClick={() =>
                            this.inviteUserSelected(user.externalId)
                          }
                        >
                          {strings.inviteUser}
                        </a>
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
  isAdmin: PropTypes.bool.isRequired
};

export default AttendeesList;
