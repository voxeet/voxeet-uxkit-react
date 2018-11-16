import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
 en:{
   hangtight:"Hang Tight. We're waiting for other presenters to arrive."
 },
 fr: {
   hangtight:"Veuillez patienter, nous attendons l'intervenant."
 }
});

class AttendeesWaitingWebinarListener extends Component {
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

AttendeesWaitingWebinarListener.propTypes = {

}

export default AttendeesWaitingWebinarListener
