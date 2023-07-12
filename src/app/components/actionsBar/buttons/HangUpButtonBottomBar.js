import React, { Component } from "react";
import PropTypes from "prop-types";
import { strings } from "../../../languages/localizedStrings";
import Hangup from "../../../../static/images/icons/btn-hang-up.svg";

class HangUpButtonBottomBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    if (this.state.disabled) return;
    this.setState({ disabled: true });
    this.props.leave();
  }

  render() {
    const { disabled } = this.state;

    return (
      <li className="hangup-bottom-bar">
        <a
          data-tip
          data-for="leave"
          title={strings.leave}
          onClick={this.handleClick}
        >
          <img src={Hangup} />
          <div>
            <span>{disabled ? strings.leaving : strings.leave}</span>
          </div>
        </a>
      </li>
    );
  }
}

HangUpButtonBottomBar.propTypes = {
  leave: PropTypes.func.isRequired,
  tooltipPlace: PropTypes.string.isRequired,
};

HangUpButtonBottomBar.defaultProps = {
  tooltipPlace: "right",
};

export default HangUpButtonBottomBar;
