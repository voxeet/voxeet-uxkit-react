import React, { Component } from "react";
import PropTypes from "prop-types";

import ListItem from "./ListItem";

class List extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      participants,
      toggleMicrophone,
      kickParticipant,
      isAdmin,
      isAdminActived,
      currentUser  // TODO no usages found for this component
    } = this.props;
    return (
      <div className="SidebarList">
        <ul className="list-items">
          {participants.map((participant, i) => {
            if (participant.isConnected && participant.type == "user")
              return (
                <ListItem
                  isAdminActived={isAdminActived}
                  participant={participant}
                  isAdmin={isAdmin}
                  key={i}
                  kickParticipant={kickParticipant}
                  toggleMicrophone={toggleMicrophone}
                  currentUser={currentUser}
                />
              );
          })}
        </ul>
      </div>
    );
  }
}

List.propTypes = {
  participants: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isAdminActived: PropTypes.bool.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  kickParticipant: PropTypes.func.isRequired,
};

export default List;
