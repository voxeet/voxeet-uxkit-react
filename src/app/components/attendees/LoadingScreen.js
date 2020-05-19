import React, { Component } from "react";
import PropTypes from "prop-types";
import { strings } from "../../languages/localizedStrings";

class LoadingScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { logo } = this.props;
    return (
      <div className="voxeet-loading-message-container">
        <div className="voxeet-loading-center-container">
          <div className="voxeet-loading-logo-container">
            {/* <img src={dolbyLogo != null ? dolbyLogo : dolbyLogo} /> */}
            <div className='ddloader' />
          </div>
          {/* <div id="loader-container">
            <img src={dolbyLogo} />
            <div className="loader"></div>
          </div> */}
          <div className="voxeet-loading-info-container">
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
