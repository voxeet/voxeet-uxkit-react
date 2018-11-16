import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

@connect((store) => {
    return {
        controlsStore: store.voxeet.controls
    }
})

class BottomBar extends Component {

    constructor(props) {
        super(props)
        this.state = { hide: false };
        this.renderButtons = this.renderButtons.bind(this)
    }


    renderButtons() {
        return React.createElement(this.props.actionsButtons, {
            ...this.props, isMuted: this.props.controlsStore.isMuted, isRecording: this.props.controlsStore.isRecording, audio3DEnabled: this.props.controlsStore.audio3DEnabled, videoEnabled: this.props.controlsStore.videoEnabled, isBottomBar:true,
        })
    }

    render() {
        return (
            <div className="vxt-bottom-bar">
                <div className="vxt-bottom-bar-actions">
                {this.renderButtons()}
                </div>
            </div>
        );

    }
}

BottomBar.propTypes = {
    actionsButtons: PropTypes.func,
    screenShareEnabled: PropTypes.bool,
    forceFullscreen: PropTypes.bool.isRequired,
    isMuted: PropTypes.bool.isRequired,
    isWebinar: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    isScreenshare: PropTypes.bool.isRequired,
    isJoined: PropTypes.bool.isRequired,
    videoEnabled: PropTypes.bool.isRequired,
    audio3DEnabled: PropTypes.bool.isRequired,
    displayModal: PropTypes.bool.isRequired,
    isRecording: PropTypes.bool.isRequired,
    isWidgetOpened: PropTypes.bool.isRequired,
    isWidgetFullScreenOn: PropTypes.bool.isRequired,
    toggleWidget: PropTypes.func.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    isElectron: PropTypes.bool.isRequired,
    leave: PropTypes.func.isRequired,
    isDemo: PropTypes.bool.isRequired,
    toggleMicrophone: PropTypes.func.isRequired,
    toggleAudio3D: PropTypes.func.isRequired,
    toggleRecording: PropTypes.func.isRequired,
    toggleVideo: PropTypes.func.isRequired,
    toggleScreenShare: PropTypes.func.isRequired,
    toggleModal: PropTypes.func.isRequired,
    toggleMode: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
};

BottomBar.defaultProps = {
    forceFullscreen: false,
    isWidgetFullScreenOn: false,
}


export default BottomBar
