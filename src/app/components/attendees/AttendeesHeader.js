import React, { Component } from "react";
import PropTypes from "prop-types";

import AttendeesHeaderTimer from "./AttendeesHeaderTimer";
import { strings } from "../../languages/localizedStrings";
import LiveIndicator from "../../../static/images/newicons/LiveIndicator.png";

class AttendeesHeader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header>
        <div>
          <div className="live-indicator">
            <img src={LiveIndicator} />
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
