import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";

class Replay extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { replay } = this.props;
    return (
      <div className="vxt-conference-status-replay">
        <a
          className={"icon-record on"}
          title="Replay conference"
          onClick={() => replay()}
        ></a>
      </div>
    );
  }
}

Replay.propTypes = {
  replay: PropTypes.func.isRequired
};

export default Replay;
