import React, { Component } from "react";
import PropTypes from "prop-types";
import Logo from "../../../static/images/logo.svg";
import { strings } from "../../languages/localizedStrings";

class LoadingScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { logo } = this.props;
    return (
      <div className="electron-message-container">
        <div className="electron-center-container">
          <div className="electron-logo-container">
            <img src={logo != null ? logo : Logo} />
          </div>
          <div id="loader-container">
            <div className="loader"></div>
          </div>
          <div className="electron-info-container">
            {strings.electronloading}
            <span className="one">.</span>
            <span className="two">.</span>
            <span className="three">.</span>
          </div>
        </div>
      </div>
    );
  }
}

LoadingScreen.propTypes = {
  logo: PropTypes.string
};

export default LoadingScreen;
