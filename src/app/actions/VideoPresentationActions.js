export const Types = {
  VIDEO_PRESENTATION_PLAY: "VIDEO_PRESENTATION_PLAY",
  VIDEO_PRESENTATION_PAUSE: "VIDEO_PRESENTATION_PAUSE",
  VIDEO_PRESENTATION_SEEK: "VIDEO_PRESENTATION_SEEK",
  VIDEO_PRESENTATION_START: "VIDEO_PRESENTATION_START",
  VIDEO_PRESENTATION_STOP: "VIDEO_PRESENTATION_STOP",
  VIDEO_PRESENTATION_PLAYER: "VIDEO_PRESENTATION_PLAYER"
};

export class Actions {
  static startVideoPresentation(url, ts) {
    return {
      type: Types.VIDEO_PRESENTATION_START,
      payload: {
        url: url,
        ts: ts
      }
    };
  }

  static setPlayer(player) {
    return {
      type: Types.VIDEO_PRESENTATION_PLAYER,
      payload: {
        player: player
      }
    };
  }

  static stopVideoPresentation() {
    return {
      type: Types.VIDEO_PRESENTATION_STOP
    };
  }

  static play() {
    return {
      type: Types.VIDEO_PRESENTATION_PLAY
    };
  }

  static pause() {
    return {
      type: Types.VIDEO_PRESENTATION_PAUSE
    };
  }

  static seek(ts) {
    return {
      type: Types.VIDEO_PRESENTATION_SEEK,
      payload: {
        ts: ts
      }
    };
  }
}
