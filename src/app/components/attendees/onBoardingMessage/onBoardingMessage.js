import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization';
import { connect } from 'react-redux'
import { Actions as OnBoardingMessageActions } from '../../../actions/OnBoardingMessageActions'

let strings = new LocalizedStrings({
 en:{
   here: "link"
 },
 fr: {
   here: "ici"
 }
});

@connect((state) => {
  return {
    onBoardingMessage: state.voxeet.onBoardingMessage
  }
})

class OnBoardingMessage extends Component {
    constructor(props) {
        super(props)
        this.linkClicked = this.linkClicked.bind(this)
    }

    componentDidUpdate() {
      const { message, timer, displayOnBoardingMessage } = this.props.onBoardingMessage
      if (displayOnBoardingMessage) {
        setTimeout(() => {
          this.props.dispatch(OnBoardingMessageActions.hideOnBoarding())
        }, timer)
      }
    }

    linkClicked() {
      this.props.dispatch(OnBoardingMessageActions.hideOnBoarding())
    }

    render() {
        const { message, timer, displayOnBoardingMessage } = this.props.onBoardingMessage
        return (
            <div className={displayOnBoardingMessage ? "onboardingmessage" : "onboardingmessage-fadeout"}>
                {message}
            </div>
        )
    }
}

OnBoardingMessage.propTypes = {
}

export default OnBoardingMessage
