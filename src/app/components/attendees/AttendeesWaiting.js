import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
 en:{
   hangtight:"Hang Tight. We're waiting for other callers to arrive."
 },
 fr: {
   hangtight:"Veuillez patienter, nous attendons d'autres participants."
 }
});

class AttendeesWaiting extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        return (
            <div className="conference-empty">
                <p>{strings.hangtight}</p>
            </div>
        )
    }
}

AttendeesWaiting.propTypes = {

}

export default AttendeesWaiting
