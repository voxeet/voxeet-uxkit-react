import VoxeetSDK from "@voxeet/voxeet-web-sdk";

export const Types = {
  UPDATE_FORWARDED_VIDEOS: "UPDATE_FORWARDED_VIDEOS",
};

export class Actions {

  static updateForwsrdedVideos(participantIds) {
    return {
      type: Types.UPDATE_FORWARDED_VIDEOS,
      payload: { participantIds },
    };
  }
}
