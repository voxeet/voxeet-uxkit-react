import React, { Component } from 'react'
import PropTypes from 'prop-types'

import AttendeesHeaderTimer from './AttendeesHeaderTimer'
import LocalizedStrings from 'react-localization'
import LiveIndicator from '../../../static/images/newicons/LiveIndicator.png'

let strings = new LocalizedStrings({
 en:{
   live:"Live Call"
 },
 fr: {
   live:"Conférence en cours"
 }
});


class AttendeesHeader extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        return (
            <header>
                <div>
                  <div className="live-indicator"><img src={LiveIndicator} /></div>
                  <h1>{strings.live}</h1>
                  <div className="timer-container">
                      <AttendeesHeaderTimer />
                  </div>
                </div>
            </header>
        )
    }
}

AttendeesHeader.propTypes = {

}

export default AttendeesHeader
