import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";

class Offline extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { join } = this.props;
    return (
      <div className="vxt-conference-status">
        <a onClick={() => join()} className="icn-status offline" title="Join">
          <span className="icon-phone"></span>
        </a>
      </div>
    );
  }
}

Offline.propTypes = {
  join: PropTypes.func.isRequired
};

export default Offline;
