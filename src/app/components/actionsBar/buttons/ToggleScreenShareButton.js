import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import browser from "bowser";
import ReactTooltip from "react-tooltip";
import { connect } from "@voxeet/react-redux-5.1.1";
import { Actions as OnBoardingMessageActions } from "../../../actions/OnBoardingMessageActions";
import { strings } from "../../../languages/localizedStrings";
import ShareScreenOn from "../../../../static/images/icons/btn-share-screen-on.svg";
import ShareScreenOff from "../../../../static/images/icons/btn-share-screen-off.svg";
import EntireScreenShareOn from "../../../../static/images/icons/icon-entire-screen.svg";
import EntireScreenShareOff from "../../../../static/images/icons/icon-entire-screen-hover.svg";
import FileShareOn from "../../../../static/images/icons/icon-file.svg";
import FileShareOff from "../../../../static/images/icons/icon-file-hover.svg";
import VideoShareOn from "../../../../static/images/icons/icon-video.svg";
import VideoShareOff from "../../../../static/images/icons/icon-video-hover.svg";
import WindowShareOn from "../../../../static/images/icons/icon-window.svg";
import WindowShareOff from "../../../../static/images/icons/icon-window-hover.svg";
import dolbyLogo from "../../../../static/images/DDLoader.gif";
import { isMobile } from "../../../libs/browserDetection";

@connect(store => {
  return {
    filePresentationStore: store.voxeet.filePresentation
  };
})
class ToggleScreenShareButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      contentUrlVideoPresentation: "",
      openedVideoPresentation: false,
      isMobile: isMobile(),
      hover_screen: false,
      hover_window: false,
      hover_file: false,
      hover_video: false
    };
    this.togglePopUp = this.togglePopUp.bind(this);
    this.handleClickFilePresentation = this.handleClickFilePresentation.bind(
      this
    );
    this.handleChange = this.handleChange.bind(this);
    this.toggleScreenShare = this.toggleScreenShare.bind(this);
    this.handleChangeInputVideoPresentation = this.handleChangeInputVideoPresentation.bind(
      this
    );
  }

  toggleScreenShare() {
    this.props.toggle("screenshare");
    this.setState({
      opened: !this.state.opened,
      openedVideoPresentation: false
    });
  }

  toggleBubbleVideoPresentation() {
    this.setState({ opened: false, openedVideoPresentation: true });
  }

  toggleVideoPresentation() {
    this.props.toggleVideoPresentation(this.state.contentUrlVideoPresentation);
    this.setState({ opened: false, openedVideoPresentation: false });
  }

  togglePopUp() {
    const {
      screenShareEnabled,
      filePresentationEnabled,
      videoPresentationEnabled
    } = this.props;
    if (
      !screenShareEnabled &&
      !filePresentationEnabled &&
      !videoPresentationEnabled
    ) {
      if (this.state.openedVideoPresentation) {
        this.setState({ opened: false, openedVideoPresentation: false });
      } else {
        this.setState({
          opened: !this.state.opened,
          openedVideoPresentation: false
        });
      }
    } else {
      if(!this.state.opened) {
        this.props.dispatch(
            OnBoardingMessageActions.onBoardingDisplay(
                strings.shareAlreadyStarted,
                2000
            )
        );
      }
      this.setState({
        opened: false,
        openedVideoPresentation: false
      });
    }
  }

  handleClickFilePresentation(e) {
    document.getElementById("filePresentationUpload").click();
  }

  handleChange(e) {
    this.props.convertFilePresentation(e.target.files[0]);
    this.setState({ opened: !this.state.opened });
  }

  handleChangeInputVideoPresentation(e) {
    let content = e.target.value;
    this.setState({ contentUrlVideoPresentation: content });
  }

  render() {
    const {
      screenShareEnabled,
      toggle,
      toggleVideoPresentation,
      tooltipPlace,
      isBottomBar,
      filePresentationEnabled,
      currentUserFilePresentation,
      currentUserVideoPresentation,
      currentUserScreenShare,
      shareActions,
      videoPresentationEnabled
    } = this.props;
    const {
      opened,
      openedVideoPresentation,
      contentUrlVideoPresentation,
      isMobile,
      hover_screen,
      hover_window,
      hover_file,
      hover_video
    } = this.state;
    const { fileConverted } = this.props.filePresentationStore;
    return (
      <li
        id="screenshare-container"
        className={
          filePresentationEnabled ||
            screenShareEnabled ||
            videoPresentationEnabled ||
            opened ||
            openedVideoPresentation
            ? "active"
            : fileConverted
              ? "conversion-running"
              : ""
        }
      >
        {fileConverted ? (
          <Fragment>
            <div id="loader-container-file-presentation">
              <img src={dolbyLogo} />
              {/* <div className="loader-file-presentation"></div> */}
            </div>
            {isBottomBar && (
              <a>
                <div>
                  <span>{strings.share}</span>
                </div>
              </a>
            )}
          </Fragment>
        ) : (
            <Fragment>
              <a
                data-tip
                data-for="toggle-screenshare"
                className={
                  "" + (opened || openedVideoPresentation ? "on" : "off")
                }
                title={strings.screenshare}
                onClick={() => {
                  currentUserScreenShare ||
                    currentUserFilePresentation ||
                    currentUserVideoPresentation
                    ? toggle()
                    : this.togglePopUp();
                }}
              >
                <img
                  src={
                    filePresentationEnabled ||
                      screenShareEnabled ||
                      videoPresentationEnabled
                      ? ShareScreenOn
                      : ShareScreenOff
                  }
                />
                {isBottomBar && (
                  <div>
                    <span>{strings.screenshare}</span>
                  </div>
                )}
              </a>
            </Fragment>
          )}
        {openedVideoPresentation && (
          <div className="bubble-tip bubble-video-presentation">
            <a
              className="icon-close"
              title="Close"
              currentitem="false"
              onClick={() => this.togglePopUp()}
            ></a>
            <span className="title">{strings.videopresentation}</span>
            <input
              placeholder={strings.placeholderVideoPresentation}
              value={contentUrlVideoPresentation}
              onChange={this.handleChangeInputVideoPresentation}
              type="text"
              id="video-presentation-input"
            ></input>
            <button onClick={() => this.toggleVideoPresentation()}>
              Start
            </button>
            <div className="anchor-popup"></div>
          </div>
        )}
        {opened && (
          <div className="bubble-tip">
            <a
              className="icon-close"
              title="Close"
              currentitem="false"
              onClick={() => this.togglePopUp()}
            ></a>
            <span className="title">{strings.screenshareOption}</span>
            {shareActions.indexOf("screenshare") > -1 &&
              !browser.msie && (
                <div>
                  <Fragment>
                    <a
                      onClick={() =>
                        this.toggleScreenShare()
                      }
                      onMouseEnter={() => {
                        !isMobile && this.setState({ hover_screen: true });
                      }}
                      onMouseLeave={() => {
                        !isMobile && this.setState({ hover_screen: false });
                      }}
                    >
                      <img src={hover_screen ? EntireScreenShareOff : EntireScreenShareOn} />
                      {strings.screenshareEntireScreen}
                    </a>
                  </Fragment>
                </div>
              )}
            {shareActions.indexOf("windowpresentation") > -1 && (
              <Fragment>
                <a
                  // onClick={this.handleClickFilePresentation}
                  onMouseEnter={() => {
                    !isMobile && this.setState({ hover_window: true });
                  }}
                  onMouseLeave={() => {
                    !isMobile && this.setState({ hover_window: false });
                  }}
                >
                  <img src={hover_window ? WindowShareOff : WindowShareOn} />
                  {strings.screenshareAWindow}
                </a>
                <input
                  type="window"
                  id="windowPresentationUpload"
                  accept="application/pdf"
                  onChange={this.handleChange}
                  style={{ display: "none" }}
                />
              </Fragment>
            )}
            {shareActions.indexOf("filepresentation") > -1 && (
              <Fragment>
                <a
                  onClick={this.handleClickFilePresentation}
                  onMouseEnter={() => {
                    !isMobile && this.setState({ hover_file: true });
                  }}
                  onMouseLeave={() => {
                    !isMobile && this.setState({ hover_file: false });
                  }}
                >
                  <img src={hover_file ? FileShareOff : FileShareOn} />
                  {strings.filepresentation}
                </a>
                <input
                  type="file"
                  id="filePresentationUpload"
                  accept="application/pdf"
                  onChange={this.handleChange}
                  style={{ display: "none" }}
                />
              </Fragment>
            )}

            {shareActions.indexOf("videopresentation") > -1 && (
              <Fragment>
                <a
                  onClick={() => this.toggleBubbleVideoPresentation()}
                  onMouseEnter={() => {
                    !isMobile && this.setState({ hover_video: true });
                  }}
                  onMouseLeave={() => {
                    !isMobile && this.setState({ hover_video: false });
                  }}
                >
                  <img src={hover_video ? VideoShareOff : VideoShareOn} />
                  {strings.videopresentation}
                </a>
              </Fragment>
            )}

            <div className="anchor-popup"></div>
          </div>
        )}
        {!isBottomBar && (
          <ReactTooltip
            id="toggle-screenshare"
            place={tooltipPlace}
            effect="solid"
            className="tooltip"
          >
            {strings.screenshare}
          </ReactTooltip>
        )}
      </li>
    );
  }
}

ToggleScreenShareButton.propTypes = {
  shareActions: PropTypes.array.isRequired,
  screenShareEnabled: PropTypes.bool.isRequired,
  filePresentationEnabled: PropTypes.bool.isRequired,
  videoPresentationEnabled: PropTypes.bool.isRequired,
  currentUserScreenShare: PropTypes.bool.isRequired,
  currentUserFilePresentation: PropTypes.bool.isRequired,
  currentUserVideoPresentation: PropTypes.bool.isRequired,
  convertFilePresentation: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  toggleVideoPresentation: PropTypes.func.isRequired,

  tooltipPlace: PropTypes.string.isRequired,
  isBottomBar: PropTypes.bool.isRequired
};

ToggleScreenShareButton.defaultProps = {
  tooltipPlace: "right"
};

export default ToggleScreenShareButton;
