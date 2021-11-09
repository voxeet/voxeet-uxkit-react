import React, { Component } from "react";
import PropTypes from "prop-types";

class VuMeter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { level, maxLevel } = this.props;
    return (
      <ul className="loadbar">
        {[...Array(maxLevel)].map((el, i) => (
          <li key={`loadbar_${i}`}>
            <div className={`bar ${level >= i ? "ins" : ""}`}></div>
          </li>
        ))}
      </ul>
    );
  }
}

VuMeter.propTypes = {
  level: PropTypes.number,
  maxLevel: PropTypes.number,
};

export default VuMeter;
