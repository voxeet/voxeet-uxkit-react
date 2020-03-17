import React, { Component } from "react";
import PropTypes from "prop-types";
import { strings } from "../../../languages/localizedStrings";
import { connect } from "@voxeet/react-redux-5.1.1";
import { Actions as OnBoardingMessageActions } from "../../../actions/OnBoardingMessageActions";

@connect(state => {
  return {
    onBoardingMessage: state.voxeet.onBoardingMessage
  };
})
class OnBoardingMessage extends Component {
  constructor(props) {
    super(props);
    this.linkClicked = this.linkClicked.bind(this);
  }

  componentDidUpdate() {
    const {
      message,
      timer,
      displayOnBoardingMessage
    } = this.props.onBoardingMessage;
    if (displayOnBoardingMessage) {
      setTimeout(() => {
        this.props.dispatch(OnBoardingMessageActions.hideOnBoarding());
      }, timer);
    }
  }

  linkClicked() {
    this.props.dispatch(OnBoardingMessageActions.hideOnBoarding());
  }

  render() {
    const {
      message,
      timer,
      displayOnBoardingMessage
    } = this.props.onBoardingMessage;
    return (
      <div
        className={
          displayOnBoardingMessage
            ? "onboardingmessage"
            : "onboardingmessage-fadeout"
        }
      >
        {message}
      </div>
    );
  }
}

OnBoardingMessage.propTypes = {};

export default OnBoardingMessage;
