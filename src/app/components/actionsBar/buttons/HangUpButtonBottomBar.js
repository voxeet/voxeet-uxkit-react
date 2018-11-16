import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization';
import Hangup from '../../../../static/images/newicons/icon-hang-up.svg'

let strings = new LocalizedStrings({
 en:{
   leave: "End"
 },
 fr: {
   leave: "Quitter"
 }
});

class HangUpButtonBottomBar extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { leave , tooltipPlace } = this.props

        return (
            <li className="hangup-bottom-bar">
              <a data-tip data-for="leave"
                  title={strings.leave}
                  onClick={() => leave()}>
                  <img src={Hangup} />
                  <div><span>{strings.leave}</span></div>
              </a>
            </li>
        )
    }
}

HangUpButtonBottomBar.propTypes = {
  leave: PropTypes.func.isRequired,
  tooltipPlace: PropTypes.string.isRequired,
};

HangUpButtonBottomBar.defaultProps = {
    tooltipPlace: "right"
};

export default HangUpButtonBottomBar
