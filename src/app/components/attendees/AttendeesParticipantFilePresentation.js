import React, { Fragment, Component } from "react";
import { connect } from "@voxeet/react-redux-5.1.1";
import PropTypes from "prop-types";
import { strings } from "../../languages/localizedStrings";
import { Actions as ConferenceActions } from "../../actions/ConferenceActions";

@connect((store) => {
  return {
    filePresentationStore: store.voxeet.filePresentation,
  };
})
class AttendeesParticipantFilePresentation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseMoving: false,
      mouseIn: false,
      timeout: null,
    };
    this.nextFilePresentation = this.nextFilePresentation.bind(this);
    this.prevFilePresentation = this.prevFilePresentation.bind(this);
    this.updateFilePresentation = this.updateFilePresentation.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.scrollToPosition = this.scrollToPosition.bind(this);
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.state.timeout);
  }

  componentDidMount() {
    this.mounted = true;
  }

  scrollToPosition(position) {
    var thumbnail = document.getElementById("thumbnail-" + position);
    var element = document.getElementById("thumbnails");
    element.scrollTop = thumbnail.offsetTop - 20;
  }

  updateFilePresentation(position) {
    const { filePresentationId } = this.props.filePresentationStore;
    this.props.dispatch(
      ConferenceActions.updateFilePresentation(filePresentationId, position)
    );
  }

  nextFilePresentation() {
    const {
      imageCount,
      filePresentationPosition,
      filePresentationId,
    } = this.props.filePresentationStore;
    if (filePresentationPosition < imageCount - 1) {
      this.props.dispatch(
        ConferenceActions.updateFilePresentation(
          filePresentationId,
          filePresentationPosition + 1
        )
      );
      this.scrollToPosition(filePresentationPosition + 1);
    }
  }

  prevFilePresentation() {
    const {
      imageCount,
      filePresentationPosition,
      filePresentationId,
    } = this.props.filePresentationStore;
    if (filePresentationPosition > 0) {
      this.props.dispatch(
        ConferenceActions.updateFilePresentation(
          filePresentationId,
          filePresentationPosition - 1
        )
      );
      this.scrollToPosition(filePresentationPosition - 1);
    }
  }

  handleMouseEnter() {
    if (this.mounted) this.setState({ mouseIn: true });
  }

  handleMouseMove(e) {
    e.preventDefault();
    if (this.mounted) this.setState({ mouseMoving: true });
    clearTimeout(this.state.timeout);
    if (!this.state.mouseIn)
      this.state.timeout = setTimeout(
        () => this.setState({ mouseMoving: false }),
        2000
      );
  }

  handleMouseLeave() {
    if (this.mounted) this.setState({ mouseIn: false });
  }

  render() {
    const { isFilePresentation } = this.props;
    const {
      fileUrl,
      imageCount,
      filePresentationPosition,
      thumbnails,
    } = this.props.filePresentationStore;
    const { mouseMoving } = this.state;
    return (
      <div
        className="file-presentation stream-media"
        onMouseMove={this.handleMouseMove}
      >
        <img
          className={
            isFilePresentation && thumbnails.length > 1
              ? "file-presentation-img-presenter"
              : "file-presentation-img"
          }
          src={fileUrl}
        />
        {isFilePresentation && thumbnails.length > 1 && (
          <Fragment>
            <div className="thumbnails" id="thumbnails">
              {thumbnails.map((thumb, i) => {
                return (
                  <a
                    key={i}
                    id={"thumbnail-" + i}
                    onClick={() => {
                      this.updateFilePresentation(i);
                    }}
                  >
                    <div
                      className={
                        i == filePresentationPosition
                          ? "thumbnail-container current"
                          : "thumbnail-container"
                      }
                    >
                      <span className="number">{i}</span>
                      <img src={thumb} />
                    </div>
                  </a>
                );
              })}
            </div>
            <div
              onMouseEnter={this.handleMouseEnter}
              onMouseLeave={this.handleMouseLeave}
              className={
                mouseMoving
                  ? "controls-file-presentation"
                  : "controls-file-presentation hidden-controls"
              }
            >
              <a
                className={
                  filePresentationPosition == 0 ? "prev disabled" : "prev"
                }
                onClick={this.prevFilePresentation}
              >
                {strings.prev}
              </a>
              <a
                className={
                  filePresentationPosition == imageCount - 1
                    ? "next disabled"
                    : "next"
                }
                onClick={this.nextFilePresentation}
              >
                {strings.next}
              </a>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}

AttendeesParticipantFilePresentation.propTypes = {
  isFilePresentation: PropTypes.bool,
};

export default AttendeesParticipantFilePresentation;
