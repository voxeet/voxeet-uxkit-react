import React, { Fragment, Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import { strings } from "../../languages/localizedStrings";
import { Actions as ConferenceActions } from "../../actions/ConferenceActions";
import { Actions as VideoPresentationActions } from "../../actions/VideoPresentationActions";
import ReactPlayer from "react-player";
import VoxeetSDK from "@voxeet/voxeet-web-sdk";
import bowser from "bowser";

@connect(store => {
  return {
    videoPresentationStore: store.voxeet.videoPresentation
  };
})
class AttendeesParticipantVideoPresentation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      safariAutoplay: bowser.safari
    };
    this.onSeek = this.onSeek.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.startVideoForSafari = this.startVideoForSafari.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.props.dispatch(
      VideoPresentationActions.setPlayer(this.videoPresentation)
    );
  }

  onSeek(seconds) {
    const { isVideoPresentation } = this.props;
    if (isVideoPresentation)
      VoxeetSDK.videoPresentation.seek(seconds * 1000);
  }

  onPause() {
    const { isVideoPresentation } = this.props;
    if (isVideoPresentation)
      VoxeetSDK.videoPresentation.pause(
        this.videoPresentation.getCurrentTime() * 1000
      );
  }

  onPlay() {
    const { isVideoPresentation } = this.props;
    this.setState | { safariAutoplay: false };
    if (isVideoPresentation) {
      const { url } = this.props.videoPresentationStore;
      // Just for YouTube seek to current position before play (CC-1205)
      if (url && (url.indexOf('youtube.com')!==-1
          || url.indexOf('youtu.be')!==-1))
        VoxeetSDK.videoPresentation.seek(this.videoPresentation.getCurrentTime() * 1000);
      VoxeetSDK.videoPresentation.play(
          this.videoPresentation.getCurrentTime() * 1000
      );
    }
  }

  startVideoForSafari() {
    this.setState({ safariAutoplay: false });
    this.videoPresentation.getInternalPlayer().play();
  }

  render() {
    const { isVideoPresentation } = this.props;
    const { safariAutoplay } = this.state;
    const { ts, url, playing } = this.props.videoPresentationStore;
    return (
      <div className="file-presentation stream-media">
        {bowser.safari && this.state.safariAutoplay && (
          <div className="safari-autoplay-container">
            <button
              className="safari-autoplay"
              onClick={this.startVideoForSafari}
            >
              {strings.startVideoPresentationAutoplay}
            </button>
          </div>
        )}
        <ReactPlayer
          id="video-presentation"
          url={url}
          playsinline
          ref={ref => (this.videoPresentation = ref)}
          playing={playing && !safariAutoplay ? true : false}
          controls={isVideoPresentation ? true : false}
          pip={true}
          config={{
            file: {
              attributes: {
                autoPlay: true
              }
            }
          }}
          width="100%"
          height="100%"
          onSeek={this.onSeek}
          onPlay={this.onPlay}
          onPause={this.onPause}
        />
      </div>
    );
  }
}

AttendeesParticipantVideoPresentation.propTypes = {
  isVideoPresentation: PropTypes.bool
};

export default AttendeesParticipantVideoPresentation;
