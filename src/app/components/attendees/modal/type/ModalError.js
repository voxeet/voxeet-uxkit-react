import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";

class ModalError extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { toggle, error } = this.props;
    const contentError = JSON.parse(error);
    return (
      <div>
        <h3>Oops, an error occurred</h3>
        <p>Error : {contentError.name}</p>
        <div className="hint-text">
          <p>
            If you are having problems, try restarting your browser and check
            your devices (Headphone and microphone)
          </p>
        </div>
      </div>
    );
  }
}

ModalError.defaultProps = {};

ModalError.propTypes = {
  error: PropTypes.string,
  toggle: PropTypes.func
};

export default ModalError;
