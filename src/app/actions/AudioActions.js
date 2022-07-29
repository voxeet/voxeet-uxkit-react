import VoxeetSDK from "@voxeet/voxeet-web-sdk";

export class Actions {
    static setCaptureMode(captureMode, noiseReductionLevel) {
        return () => {
            return VoxeetSDK.audio.setCaptureMode({audioMode: captureMode, audioModeOptions: {noiseReductionLevel}});
          };
    }
}