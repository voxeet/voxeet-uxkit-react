import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "@voxeet/react-redux-5.1.1";

@connect(store => {
  return {
    inputManager: store.voxeet.inputManager
  };
})
class PreConfigVuMeter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      level: 0,
      javascriptNode: null,
      microphone: null,
      analyser: null,
      userStream: null,
      audioContext: null
    };
    this.createAnalyser = this.createAnalyser.bind(this);
  }

  componentWillUnmount() {
    if (this.state.javascriptNode) {
      this.state.javascriptNode.disconnect(this.state.audioContext.destination);
      this.state.javascriptNode.onaudioprocess = null;
      this.state.javascriptNode = null;
    }
    if (this.state.userStream)
      this.state.userStream.getTracks().forEach(t => t.stop());
    if (this.state.microphone) this.state.microphone.disconnect();
    if (this.state.analyser) this.state.analyser.disconnect();
  }

  createAnalyser() {
    if (this.props.inputManager.currentAudioDevice != null) {
      if (this.state.javascriptNode != null && this.state.userStream != null) {
        this.state.javascriptNode.disconnect(
          this.state.audioContext.destination
        );
        this.state.javascriptNode.onaudioprocess = null;
        this.state.microphone.disconnect();
        this.state.analyser.disconnect();
        this.state.userStream.getTracks().forEach(t => t.stop());
        this.setState({
          level: 0,
          javascriptNode: null,
          microphone: null,
          analyser: null,
          audioContext: null,
          userStream: null
        });
      }
      navigator.mediaDevices
        .getUserMedia({
          audio: { deviceId: this.props.inputManager.currentAudioDevice },
          video: false
        })
        .then(stream => {
          const audioCtx =
            window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext;
          const audioContext = new audioCtx();
          let analyser = audioContext.createAnalyser();
          let microphone = audioContext.createMediaStreamSource(stream);
          let javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
          javascriptNode.connect(audioContext.destination);
          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;
          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);
          javascriptNode.onaudioprocess = () => {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var values = 0;

            var length = array.length;
            for (var i = 0; i < length; i++) {
              values += array[i];
            }

            var average = values / length;
            this.setState({ level: average });
          };
          this.setState({
            audioContext: audioContext,
            microphone: microphone,
            javascriptNode: javascriptNode,
            userStream: stream,
            analyser: analyser
          });
        });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.inputManager.currentAudioDevice !=
        this.props.inputManager.currentAudioDevice &&
      this.props.inputManager.currentAudioDevice != null
    ) {
      this.createAnalyser();
    }
  }

  componentDidMount() {
    this.createAnalyser();
  }

  render() {
    const { level } = this.state;
    return (
      <ul className="loadbar">
        {[...Array(20)].map((el, i) => (
          <li key={`loadbar_${i}`}>
            <div className={`bar ${level >= i ? "ins" : ""}`}></div>
          </li>
        ))}
      </ul>
    );
  }
}

PreConfigVuMeter.propTypes = {
  userStream: PropTypes.object
};

export default PreConfigVuMeter;
