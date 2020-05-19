import { Types } from "../actions/FilePresentationActions";
const defaultState = {
  fileConverted: false,
  filePresentationRunning: false,
  filePresentationId: null,
  filePresentationPosition: 0,
  imageCount: 0,
  fileUrl: null,
  thumbnails: [],
  filePresentationName: null
};

const FilePresentationReducer = (state = defaultState, action) => {
  switch (action.type) {
    case Types.FILE_PRESENTATION_CONVERTED_START:
      return {
        ...state,
        fileConverted: true
      };
    case Types.FILE_PRESENTATION_ADD_THUMB: {
      let thumbnails = [...state.thumbnails];
      thumbnails.push(action.payload.thumbUrl);
      return {
        ...state,
        thumbnails: [...thumbnails]
      };
    }
    case Types.FILE_PRESENTATION_CONVERTED_OVER:
      return {
        ...state,
        fileConverted: false,
        filePresentationId: action.payload.filePresentationId
      };
    case Types.FILE_PRESENTATION_START:
      return {
        ...state,
        fileUrl: action.payload.fileUrl,
        filePresentationId: action.payload.filePresentationId,
        filePresentationPosition: action.payload.position,
        imageCount: action.payload.imageCount,
        filePresentationRunning: true
      };
    case Types.FILE_PRESENTATION_STOP:
      return {
        ...state,
        filePresentationId: null,
        filePresentationName: null,
        filePresentationPosition: 0,
        imageCount: 0,
        fileUrl: null,
        thumbnails: [],
        filePresentationRunning: false
      };
    case Types.FILE_PRESENTATION_UPDATE:
      return {
        ...state,
        fileUrl: action.payload.fileUrl,
        filePresentationPosition: action.payload.position
      };
    default:
      return state;
  }
};

export default FilePresentationReducer;
