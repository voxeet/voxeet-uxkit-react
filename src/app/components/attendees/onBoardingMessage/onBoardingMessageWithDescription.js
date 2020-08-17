import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import { Actions as OnBoardingMessageWithActionActions } from "../../../actions/OnBoardingMessageWithActionActions";

@connect(state => {
  return {
    onBoardingMessageWithAction: state.voxeet.onBoardingMessageWithAction
  };
})
class OnBoardingMessageWithDescription extends Component {
  constructor(props) {
    super(props);
    this.linkClicked = this.linkClicked.bind(this);
    this.questionMarkClicked = this.questionMarkClicked.bind(this);
  }

  componentDidUpdate() {
    const {
      displayOnBoardingMessageWithDescription,
      isError
    } = this.props.onBoardingMessageWithAction;
    if (displayOnBoardingMessageWithDescription && isError) {
      this.timeout = setTimeout(() => {
        this.props.dispatch(
          OnBoardingMessageWithActionActions.hideOnBoardingMessageWithDescription()
        );
      }, 20000);
    }
  }

  linkClicked() {
    this.props.dispatch(
      OnBoardingMessageWithActionActions.hideOnBoardingMessageWithDescription()
    );
    this.props.dispatch(
      OnBoardingMessageWithActionActions.hideOnBoardingMessageOverlay()
    );
  }

  questionMarkClicked() {
    if(this.timeout) {
      console.log('CLEAR TIMEOUT');
      clearTimeout(this.timeout);
    }

    const {
      title,
      description,
      linkWithHelp,
      isError
    } = this.props.onBoardingMessageWithAction;

    this.props.dispatch(
        OnBoardingMessageWithActionActions.onBoardingMessageOverlay(
            description,
            title
        )
    );
  }

  render() {
    const {
      title,
      description,
      linkWithHelp,
      displayOnBoardingMessageWithDescription,
      isError
    } = this.props.onBoardingMessageWithAction;
    return (
      <div
        className={
          isError
            ? displayOnBoardingMessageWithDescription
              ? "onboardingmessagewithdescription-error"
              : "onboardingmessagewithdescription-hidden"
            : displayOnBoardingMessageWithDescription
              ? "onboardingmessagewithdescription"
              : "onboardingmessagewithdescription-hidden"
        }
      >
        {title}
        <a
          onClick={() => this.questionMarkClicked()}
          href={linkWithHelp}
          className='question-icon'
        >
          {"?"}
        </a>
        <a
          data-tip="true"
          onClick={() => this.linkClicked()}
          data-for="toggle-close"
          className="icon-close"
          title="Fermer"
          currentitem="false"
        ></a>
      </div>
    );
  }
}

OnBoardingMessageWithDescription.propTypes = {};

export default OnBoardingMessageWithDescription;
