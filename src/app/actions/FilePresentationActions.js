export const Types = {
  FILE_PRESENTATION_CONVERTED_START: "FILE_PRESENTATION_CONVERTED_START",
  FILE_PRESENTATION_ADD_THUMB: "FILE_PRESENTATION_ADD_THUMB",
  FILE_PRESENTATION_CONVERTED_OVER: "FILE_PRESENTATION_CONVERTED_OVER",
  FILE_PRESENTATION_START: "FILE_PRESENTATION_START",
  FILE_PRESENTATION_STOP: "FILE_PRESENTATION_STOP",
  FILE_PRESENTATION_UPDATE: "FILE_PRESENTATION_UPDATE"
};

export class Actions {
  static fileConvertStart() {
    return {
      type: Types.FILE_PRESENTATION_CONVERTED_START
    };
  }

  static addThumbnail(thumbUrl) {
    return {
      type: Types.FILE_PRESENTATION_ADD_THUMB,
      payload: { thumbUrl }
    };
  }

  static fileConvertStop(filePresentationId) {
    return {
      type: Types.FILE_PRESENTATION_CONVERTED_OVER,
      payload: { filePresentationId }
    };
  }

  static startFilePresentation(
    filePresentationId,
    fileUrl,
    position,
    imageCount
  ) {
    return {
      type: Types.FILE_PRESENTATION_START,
      payload: { filePresentationId, fileUrl, position, imageCount }
    };
  }

  static stopFilePresentation() {
    return {
      type: Types.FILE_PRESENTATION_STOP
    };
  }

  static updateFilePresentation(position, fileUrl) {
    return {
      type: Types.FILE_PRESENTATION_UPDATE,
      payload: { position, fileUrl }
    };
  }
}
