import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Sdk from '../../../../sdk'

class ModalSettingsVuMeter extends Component {

    constructor(props) {
        super(props)
        this.state = {
            level: 0,
        }
    }

    componentDidMount() {
        this._interval = setInterval(() => {
            Sdk.instance.getUserLevel(Sdk.instance.userId, level => {
                this.setState({ level: Math.round(level * 20) })
            })
        }, 200)
    }

    componentWillUnmount() {
        clearInterval(this._interval)
    }

    render() {
        const { level } = this.state
        return (
            <ul className="loadbar">
                {[...Array(20)].map((el, i) =>
                    <li key={`loadbar_${i}`}>
                        <div className={`bar ${(level >= i ? 'ins' : '')}`}></div>
                    </li>
                )}
            </ul>
        )
    }
}

ModalSettingsVuMeter.propTypes = {}

export default ModalSettingsVuMeter
