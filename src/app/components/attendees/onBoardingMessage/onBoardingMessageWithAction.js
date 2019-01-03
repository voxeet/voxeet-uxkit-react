import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization';
import { connect } from 'react-redux'
import { Actions as OnBoardingMessageWithActionActions } from '../../../actions/OnBoardingMessageWithActionActions'

let strings = new LocalizedStrings({
 en:{
   here: "link"
 },
 fr: {
   here: "içi"
 }
});

@connect((state) => {
  return {
    onBoardingMessageWithAction: state.voxeet.onBoardingMessageWithAction
  }
})

class OnBoardingMessageWithAction extends Component {
    constructor(props) {
        super(props)
        this.linkClicked = this.linkClicked.bind(this)
    }

    componentDidUpdate() {
      const { displayOnBoardingMessageWithAction, isError } = this.props.onBoardingMessageWithAction
      if (displayOnBoardingMessageWithAction && isError) {
        setTimeout(() => {
          this.props.dispatch(OnBoardingMessageWithActionActions.hideOnBoardingWithAction())
        }, 4000)
      }
    }

    linkClicked() {
      this.props.dispatch(OnBoardingMessageWithActionActions.hideOnBoardingWithAction())
    }

    render() {
        const { messageWithAction, linkWithAction, displayOnBoardingMessageWithAction, isError } = this.props.onBoardingMessageWithAction
        return (
            <div className={ isError ? (displayOnBoardingMessageWithAction ? "onboardingmessagewithaction-error" : "onboardingmessagewithaction-hidden") : (displayOnBoardingMessageWithAction ? "onboardingmessagewithaction" : "onboardingmessagewithaction-hidden")}>
                {messageWithAction}
                { linkWithAction &&
                  <a onClick={() => this.linkClicked()} href={linkWithAction} target="_blank"> {strings.here}.</a>
                }
                { !isError &&
                  <a data-tip="true" onClick={() => this.linkClicked()} data-for="toggle-close" className="icon-close" title="Fermer" currentitem="false"></a>
                }
            </div>
        )
    }
}

OnBoardingMessageWithAction.propTypes = {
}

export default OnBoardingMessageWithAction
