import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";

class ModalClose extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { toggle, tooltipPlace } = this.props;
    return (
      <div className="vxt-modal-close-btn">
        <a
          data-tip
          data-for="toggle-close"
          className="icon-close"
          onClick={() => toggle()}
          title="Close"
        ></a>
        <ReactTooltip
          id="toggle-close"
          place={tooltipPlace}
          effect="solid"
          className="tooltip"
        >
          Close
        </ReactTooltip>
      </div>
    );
  }
}

ModalClose.propTypes = {
  tooltipPlace: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired
};

ModalClose.defaultProps = {
  tooltipPlace: "left"
};

export default ModalClose;
