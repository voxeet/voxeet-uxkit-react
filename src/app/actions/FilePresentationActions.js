
export const Types = {
    FILE_PRESENTATION_CONVERTED_START: 'FILE_PRESENTATION_CONVERTED_START',
    FILE_PRESENTATION_ADD_THUMB: 'FILE_PRESENTATION_ADD_THUMB',
    FILE_PRESENTATION_CONVERTED_OVER: 'FILE_PRESENTATION_CONVERTED_OVER',
    FILE_PRESENTATION_STARTED: "FILE_PRESENTATION_STARTED",
    FILE_PRESENTATION_STOPPED: "FILE_PRESENTATION_STOPPED",
    FILE_PRESENTATION_UPDATED: "FILE_PRESENTATION_UPDATED"
}

export class Actions {

    static fileConvertStart() {
        return {
            type: Types.FILE_PRESENTATION_CONVERTED_START
        }
    }

    static addThumbnail(thumbUrl) {
        return {
            type: Types.FILE_PRESENTATION_ADD_THUMB,
            payload: { thumbUrl }
        }
    }

    static fileConvertStop(filePresentationId) {
        return {
            type: Types.FILE_PRESENTATION_CONVERTED_OVER,
            payload: { filePresentationId }
        }
    }

    static startFilePresentation(filePresentationId, fileUrl, position, imageCount) {
      return {
          type: Types.FILE_PRESENTATION_STARTED,
          payload: { filePresentationId, fileUrl, position, imageCount }
      }
    }

    static stopFilePresentation() {
        return {
            type: Types.FILE_PRESENTATION_STOPPED
        }
      }

    static updateFilePresentation(position, fileUrl) {
        return {
          type: Types.FILE_PRESENTATION_UPDATED,
          payload: { position, fileUrl }
        }
    }
}
