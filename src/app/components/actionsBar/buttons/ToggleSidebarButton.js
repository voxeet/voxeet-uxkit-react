import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { strings } from "../../../languages/localizedStrings";

class ToggleSidebarButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { toggleWidget, isWidgetOpened, tooltipPlace } = this.props;
    return (
      <li>
        <a
          data-tip
          data-for="toggle-sidebar"
          onClick={() => toggleWidget()}
          className="icn-toggle-sidebar"
          title={isWidgetOpened ? strings.close : strings.open}
        >
          <span className="icon-arrow-back-large"></span>
        </a>
        <ReactTooltip
          id="toggle-sidebar"
          place={tooltipPlace}
          effect="solid"
          className="tooltip"
        >
          {isWidgetOpened ? strings.close : strings.open}
        </ReactTooltip>
      </li>
    );
  }
}

ToggleSidebarButton.propTypes = {
  toggleWidget: PropTypes.func.isRequired,
  isWidgetOpened: PropTypes.bool.isRequired,
  tooltipPlace: PropTypes.string.isRequired
};

ToggleSidebarButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleSidebarButton;
