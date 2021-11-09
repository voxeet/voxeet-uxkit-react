import React, { Component } from "react";
import { strings } from "../../languages/localizedStrings";

class AttendeesWaitingWebinarListener extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="conference-empty">
        <p>{strings.hangtight}</p>
      </div>
    );
  }
}

AttendeesWaitingWebinarListener.propTypes = {};

export default AttendeesWaitingWebinarListener;
