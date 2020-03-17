import React, { Component } from "react";
import PropTypes from "prop-types";
import { strings } from "../../languages/localizedStrings";

class AttendeesWaiting extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { forceFullscreen, isWidgetFullScreenOn } = this.props;
    return (
      <div
        className={
          !forceFullscreen && !isWidgetFullScreenOn
            ? "conference-empty-widget"
            : "conference-empty"
        }
      >
        <p>{strings.hangtight}</p>
      </div>
    );
  }
}

AttendeesWaiting.propTypes = {
  forceFullscreen: PropTypes.bool,
  isWidgetFullScreenOn: PropTypes.bool
};

export default AttendeesWaiting;
