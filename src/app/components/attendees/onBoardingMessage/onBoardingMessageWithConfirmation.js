import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Actions as OnBoardingMessageWithConfirmationActions } from "../../../actions/OnBoardingMessageWithConfirmationActions";
import {getUxKitContext} from "../../../context";

@connect(state => {
  return {
    onBoardingMessageWithAction: state.voxeet.onBoardingMessageWithAction
  };
}, null, null, { context: getUxKitContext() })
class OnBoardingMessageWithConfirmation extends Component {
  constructor(props) {
    super(props);
    this.linkClicked = this.linkClicked.bind(this);
    this.confirmed = this.confirmed.bind(this);
  }

  componentDidUpdate() {
    const {
      displayOnBoardingMessageWithConfirmation,
      isError
    } = this.props.onBoardingMessageWithAction;
    if (displayOnBoardingMessageWithConfirmation && isError) {
      this.timeout = setTimeout(() => {
        this.props.dispatch(
          OnBoardingMessageWithConfirmationActions.hideOnBoardingWithConfirmation()
        );
      }, 20000);
    }
  }

  linkClicked() {
    this.props.dispatch(
      OnBoardingMessageWithConfirmationActions.hideOnBoardingWithConfirmation()
    );
    this.props.dispatch(
      OnBoardingMessageWithConfirmationActions.hideOnBoardingMessageOverlay()
    );
  }


  confirmed() {
    const {
      actionCallback
    } = this.props.onBoardingMessageWithAction;

    actionCallback();

    this.props.dispatch(
      OnBoardingMessageWithConfirmationActions.hideOnBoardingWithConfirmation()
    );
    this.props.dispatch(
      OnBoardingMessageWithConfirmationActions.hideOnBoardingMessageOverlay()
    );
  }


  render() {
    const {
      messageWithConfirmation,
      confirmButtonTitle,
      withCancelOption,
      displayOnBoardingMessageWithConfirmation,
    } = this.props.onBoardingMessageWithAction;
    return (
      <div
        className={
          displayOnBoardingMessageWithConfirmation
            ? "onboardingmessagewithconfirmation"
            : "onboardingmessagewithconfirmation-hidden"
        }
      >
        <div className='overlay-wrapper'>
          {messageWithConfirmation &&
            <div className='overlay-title'>
              <div className='title-text'>{messageWithConfirmation}</div>
            </div>}
          <div className='overlay-text'>
            <button
              className="button"
              onClick={() => this.confirmed()}
            >{confirmButtonTitle}</button>
            {withCancelOption &&
              <button
              className="button"
              onClick={() => this.linkClicked()}
            >No</button>
            }
          </div>
        </div>

      </div>
    );
  }
}

OnBoardingMessageWithConfirmation.propTypes = {};

export default OnBoardingMessageWithConfirmation;
