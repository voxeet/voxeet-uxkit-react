export const Types = {
  INPUT_AUDIO_CHANGE: "INPUT_AUDIO_CHANGE",
  OUTPUT_AUDIO_CHANGE: "OUTPUT_AUDIO_CHANGE",
  INPUT_VIDEO_CHANGE: "INPUT_VIDEO_CHANGE",
};

export class Actions {
  static inputAudioChange(device) {
    return {
      type: Types.INPUT_AUDIO_CHANGE,
      payload: { device },
    };
  }

  static inputVideoChange(device, isBackCamera) {
    return {
      type: Types.INPUT_VIDEO_CHANGE,
      payload: { device, isBackCamera },
    };
  }

  static outputAudioChange(device) {
    return {
      type: Types.OUTPUT_AUDIO_CHANGE,
      payload: { device },
    };
  }
}
