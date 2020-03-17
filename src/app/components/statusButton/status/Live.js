import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";

class Live extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { join } = this.props;
    return (
      <div className="vxt-conference-status">
        <a
          onClick={() => join()}
          className={"icn-status live"}
          title="Join"
        ></a>
      </div>
    );
  }
}

Live.propTypes = {
  join: PropTypes.func.isRequired
};

export default Live;
