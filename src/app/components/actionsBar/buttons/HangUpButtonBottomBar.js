import React, { Component } from "react";
import PropTypes from "prop-types";
import { strings } from "../../../languages/localizedStrings";
import Hangup from "../../../../static/images/icons/btn-hang-up.svg";

class HangUpButtonBottomBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { leave, tooltipPlace } = this.props;

    return (
      <li className="hangup-bottom-bar">
        <a
          data-tip
          data-for="leave"
          title={strings.leave}
          onClick={() => leave()}
        >
          <img src={Hangup} />
          <div>
            <span>{strings.leave}</span>
          </div>
        </a>
      </li>
    );
  }
}

HangUpButtonBottomBar.propTypes = {
  leave: PropTypes.func.isRequired,
  tooltipPlace: PropTypes.string.isRequired
};

HangUpButtonBottomBar.defaultProps = {
  tooltipPlace: "right"
};

export default HangUpButtonBottomBar;
