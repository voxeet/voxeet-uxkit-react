import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import ModalError from "./type/ModalError";
import { strings } from "../../../languages/localizedStrings";

class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { toggle, isModalError, error } = this.props;

    return (
      <div className="settings">
        <div className="content">
          <span className="close">
            <a
              data-tip
              data-for="toggle-close"
              className="icon-close"
              onClick={() => toggle()}
              title={strings.close}
            ></a>
          </span>
          <ReactTooltip
            id="toggle-close"
            place="left"
            effect="solid"
            className="tooltip"
          >
            {strings.close}
          </ReactTooltip>
          {isModalError && <ModalError toggle={toggle} error={error} />}
        </div>
      </div>
    );
  }
}

Modal.defaultProps = {
  isModalError: false
};

Modal.propTypes = {
  isModalError: PropTypes.bool,
  error: PropTypes.string,
  toggle: PropTypes.func
};

export default Modal;
