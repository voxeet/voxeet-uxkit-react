import React, { Component } from "react";
import PropTypes from "prop-types";
import VuMeter from "./VuMeter";

class PreConfigVuMeter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      level: 0,
      javascriptNode: null,
      microphone: null,
      analyser: null,
      audioContext: null,
    };
    this.createAnalyser = this.createAnalyser.bind(this);
  }

  componentWillUnmount() {
    if (this.state.javascriptNode) {
      this.state.javascriptNode.disconnect(this.state.audioContext.destination);
      this.state.javascriptNode.onaudioprocess = null;
      this.state.javascriptNode = null;
    }
    if (this.state.microphone) this.state.microphone.disconnect();
    if (this.state.analyser) this.state.analyser.disconnect();
  }

  async createAnalyser() {
    if (this.props.stream == null) return;

    if (this.state.javascriptNode != null) {
      this.state.javascriptNode.disconnect(this.state.audioContext.destination);
      this.state.javascriptNode.onaudioprocess = null;
      this.state.microphone.disconnect();
      this.state.analyser.disconnect();
      this.setState({
        level: 0,
        javascriptNode: null,
        microphone: null,
        analyser: null,
        audioContext: null,
      });
    }
    try {
      const audioCtx =
        window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext;
      const audioContext = new audioCtx();
      let analyser = audioContext ? audioContext.createAnalyser() : null;
      let microphone = audioContext
        ? audioContext.createMediaStreamSource(this.props.stream)
        : null;
      let javascriptNode = audioContext
        ? audioContext.createScriptProcessor(2048, 1, 1)
        : null;
      if (analyser) {
        javascriptNode.connect(audioContext.destination);
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;
        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          const sum = array.reduce((total, next) => total + next);
          const average = sum / array.length;
          this.setState({ level: average });
        };
      }
      this.setState({
        audioContext: audioContext,
        microphone: microphone,
        javascriptNode: javascriptNode,
        analyser: analyser,
      });
    } catch (e) {
      console.error("Could not create analyzer", e.message);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.stream !== null && prevProps.stream !== this.props.stream)
      this.createAnalyser();
  }

  componentDidMount() {
    this.createAnalyser();
  }

  render() {
    return <VuMeter level={this.state.level} maxLevel={this.props.maxLevel} />;
  }
}

PreConfigVuMeter.propTypes = {
  stream: PropTypes.object,
  maxLevel: PropTypes.number,
};

export default PreConfigVuMeter;
