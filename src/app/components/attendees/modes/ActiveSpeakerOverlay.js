import React, { Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import { strings } from "../../../languages/localizedStrings";
import { Actions as ActiveSpeakerActions } from "../../../actions/ActiveSpeakerActions";
import cameraOff from "../../../../static/images/icons/btn-camera-off.svg";
import cameraOn from "../../../../static/images/icons/btn-camera-dark.svg";
import microphoneOn from "../../../../static/images/icons/btn-mute-dark.svg";
import microphoneOff from "../../../../static/images/icons/btn-mute-on.svg";
import {Actions as OnBoardingMessageWithActionActions} from "../../../actions/OnBoardingMessageWithActionActions";


@connect(store => {
    return {
        activeSpeakerStore: store.voxeet.activeSpeaker
    };
})
class ActiveSpeakerOverlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true
        }
        this.hideTimer = null
    }


    componentDidMount() {
        this.props.dispatch(ActiveSpeakerActions.startActiveSpeaker());
    }

    componentWillUnmount() {
        this.props.dispatch(ActiveSpeakerActions.stopActiveSpeaker());
    }


    componentDidUpdate(prevProps, prevState) {
        const {
            activeSpeaker,
            forceActiveUserEnabled
        } = this.props.activeSpeakerStore;
        const { show } = prevState;
        // if(!activeSpeaker)
        //     console.log('no active speaker')

        if (activeSpeaker && !activeSpeaker.isSpeaking) {
            if(show) {
                // console.log('no longer speaking')
                if (!this.hideTimer) {
                    this.hideTimer = setTimeout(() => {
                        this.setState(
                            {show: false}
                        );
                    }, 5000);
                }
            }
        } else if (activeSpeaker && activeSpeaker.isSpeaking ) {
            // console.log('is speaking')
            if (this.hideTimer) {
                clearTimeout(this.hideTimer)
                this.hideTimer = null;
            }
            if(!show) {
                this.setState(
                    {show: true}
                );
            }
        } else if(!activeSpeaker) {
            if (this.hideTimer) {
                clearTimeout(this.hideTimer)
                this.hideTimer = null;
            }
            if(show) {
                this.setState(
                    {show: false}
                );
            }
        }
    }
    render() {
        const {
            participants,
            currentUser,
        } = this.props;

        const {
            activeSpeaker,
            forceActiveUserEnabled
        } = this.props.activeSpeakerStore;

        let activeSpeakerChecker = activeSpeaker;
        // console.log('activeSpeakerChecker', activeSpeakerChecker)
        // if (activeSpeakerChecker == null) {
        //     activeSpeakerChecker = participants[0];
        // }
        // if (participants.length == 0) {
        //     activeSpeakerChecker = currentUser;
        // }
        // const show = activeSpeakerChecker //&& activeSpeakerChecker.isSpeaking;
        const {show} = this.state;
        return (
            <div
                // onClick={() => this.setState({show: show})}
                className={
                    show
                        ? "onactivespeakeroverlay"
                        : "onactivespeakeroverlay-hidden"
                }
            >
                { activeSpeakerChecker && activeSpeakerChecker.stream &&
                  activeSpeakerChecker.stream.active && activeSpeakerChecker.stream.getVideoTracks().length > 0 ?
                    <img src={cameraOn}/> :
                    <img src={cameraOff}/>}
                <p>{activeSpeakerChecker && `${activeSpeakerChecker.name} is speaking`}</p>
            </div>
        );
    }
}

export default ActiveSpeakerOverlay;
