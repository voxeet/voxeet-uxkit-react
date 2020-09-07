import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";
import { Actions as OnBoardingMessageWithActionActions } from "../../../actions/OnBoardingMessageWithActionActions";

@connect(state => {
    return {
        onBoardingMessageWithAction: state.voxeet.onBoardingMessageWithAction
    };
})
class OnBoardingMessageOverlay extends Component {
    constructor(props) {
        super(props);
        this.linkClicked = this.linkClicked.bind(this);
    }

    // componentDidUpdate() {
    //     const { displayOnBoardingMessageOverlay } = this.props.onBoardingMessageWithAction;
    //     if (displayOnBoardingMessageOverlay) {
    //         setTimeout(() => {
    //             this.props.dispatch(
    //                 OnBoardingMessageWithActionActions.hideOnBoardingMessageOverlay()
    //             );
    //         }, 1000000000000000000000);
    //     }
    // }

    linkClicked() {
        this.props.dispatch(
            OnBoardingMessageWithActionActions.hideOnBoardingMessageOverlay()
        );
        this.props.dispatch(
            OnBoardingMessageWithActionActions.hideOnBoardingMessageWithDescription()
        );
    }

    render() {
        const {
            description,
            title,
            displayOnBoardingMessageOverlay,
        } = this.props.onBoardingMessageWithAction;
        //console.log('this.props', this.props.onBoardingMessageWithAction);
        return (
            <div
                className={
                    displayOnBoardingMessageOverlay
                        ? "onboardingmessageoverlay"
                        : "onboardingmessageoverlay-hidden"
                }
            >
                <div className='overlay-wrapper'>
                    {title &&
                    <div className='overlay-title'>
                        <div className='title-text'>{title}</div>
                        <a
                            data-tip="true"
                            onClick={() => this.linkClicked()}
                            data-for="toggle-close"
                            className="icon-close"
                            title="Fermer"
                            currentitem="false"
                        ></a>
                    </div>}
                    <div className='overlay-text'>{description || 'No message'}</div>
                </div>
            </div>
        );
    }
}

OnBoardingMessageOverlay.propTypes = {};

export default OnBoardingMessageOverlay;
