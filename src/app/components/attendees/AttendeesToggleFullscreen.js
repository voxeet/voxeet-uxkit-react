import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../languages/localizedStrings";

class AttendeesToggleFullscreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { toggleWidget, isWidgetOpened, tooltipPlace } = this.props;
    return (
      <div className="toggle-fullscreen">
        <a
          data-tip
          data-for="toggle-sidebar"
          onClick={() => toggleWidget()}
          className="icn-toggle-sidebar"
          title={isWidgetOpened ? strings.close : strings.open}
        >
          <span className="icon-arrow-next-large"></span>
        </a>
      </div>
    );
  }
}

AttendeesToggleFullscreen.propTypes = {
  toggleWidget: PropTypes.func.isRequired,
  isWidgetOpened: PropTypes.bool.isRequired,
  tooltipPlace: PropTypes.string.isRequired
};

AttendeesToggleFullscreen.defaultProps = {
  tooltipPlace: "right"
};

export default AttendeesToggleFullscreen;
