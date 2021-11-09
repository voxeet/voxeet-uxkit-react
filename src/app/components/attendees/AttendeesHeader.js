import React, { Component } from "react";
import LiveIndicatorOn from "../../../static/images/icons/btn-live-on.svg";
import { strings } from "../../languages/localizedStrings";
import AttendeesHeaderTimer from "./AttendeesHeaderTimer";

class AttendeesHeader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header>
        <div>
          <div className="live-indicator">
            <img src={LiveIndicatorOn} />
          </div>
          <h1>{strings.liveCall}</h1>
          <div className="timer-container">
            <AttendeesHeaderTimer />
          </div>
        </div>
      </header>
    );
  }
}

AttendeesHeader.propTypes = {};

export default AttendeesHeader;
