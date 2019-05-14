import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactTooltip from 'react-tooltip'
import Sdk from '../../sdk'
import { connect } from 'react-redux'
import LiveIndicator from '../../../static/images/newicons/LiveIndicator.png'
import { strings } from '../../languages/localizedStrings';

@connect((store) => {
    return {
        controlsStore: store.voxeet.controls
    }
})

class AttendeesLive extends Component {

    constructor(props) {
        super(props)
        this.state = {
            runningAnimation: false,
            thirdPartyUrl: null,
            thirdPartyPassword: null
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleChangePassword = this.handleChangePassword.bind(this)
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.props.attendeesLiveOpened == true && nextProps.attendeesLiveOpened == false) {
            this.setState({ runningAnimation: true })
            setTimeout(() => { this.setState({ runningAnimation: false })}, 250);
        }
    }

    handleChange(e) {
      this.setState({ thirdPartyUrl: e.target.value });
    }

    handleChangePassword(e) {
      this.setState({ thirdPartyPassword: e.target.value });
    }

    toggleLive() {
      const { thirdPartyUrl,thirdPartyPassword } = this.state
      this.props.toggleLive(thirdPartyUrl, thirdPartyPassword)
    }

    render() {
        const { attendeesLiveOpened } = this.props
        const { isExternalLive } = this.props.controlsStore
        return (
            <div className={this.state.runningAnimation ? "attendees-live attendees-live-out" : (attendeesLiveOpened ? "attendees-live": "attendees-live-hidden")}>
                <div className="attendees-live-header">
                    <h1>{strings.externalUrl}</h1>
                </div>
                { !isExternalLive ? 
                    <div className="modal-thirdparty">
                        <ul className="ul-external-live">
                            <li>
                            1. {strings.geturl}
                            </li>
                            <li>
                            2. {strings.getpwd}
                            </li>
                            <li>
                            3. {strings.enterhere}
                            </li>
                            <li>
                            <div>
                                <label>{strings.liveurl}</label>
                                <input onChange={this.handleChange} placeholder={strings.externalUrl} name="thirdPartyUrl"/>
                            </div>
                            <div>
                                <label>{strings.passwordurl}</label>
                                <input onChange={this.handleChangePassword} type="password" placeholder={strings.externalPassword} name="thirdPartyPassword"/>
                            </div>
                            </li>
                        </ul>
                        <button onClick={this.toggleLive.bind(this)} type="submit">{strings.launchLive}</button>
                    </div>
                    :
                    <div className="live-running">
                        <div>
                            <div className="live-indicator">
                                <img src={LiveIndicator} />
                                Live is running <span className="one">.</span><span className="two">.</span><span className="three">.</span>
                            </div>
                        </div>
                        <button onClick={this.toggleLive.bind(this)} type="submit">{strings.stopLive}</button>
                    </div>
                }
            </div>
        )
    }
}

AttendeesLive.propTypes = {
    attendeesLiveOpened: PropTypes.bool.isRequired,
    toggleLive: PropTypes.func
}

export default AttendeesLive
