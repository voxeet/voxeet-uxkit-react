export const Types = {
  INPUT_AUDIO_CHANGE: "INPUT_AUDIO_CHANGE",
  OUTPUT_AUDIO_CHANGE: "OUTPUT_AUDIO_CHANGE",
  INPUT_VIDEO_CHANGE: "INPUT_VIDEO_CHANGE"
};

export class Actions {
  static inputAudioChange(deviceId) {
    return {
      type: Types.INPUT_AUDIO_CHANGE,
      payload: { deviceId }
    };
  }

  static inputVideoChange(deviceId) {
    return {
      type: Types.INPUT_VIDEO_CHANGE,
      payload: { deviceId }
    };
  }

  static outputAudioChange(deviceId) {
    return {
      type: Types.OUTPUT_AUDIO_CHANGE,
      payload: { deviceId }
    };
  }
}
