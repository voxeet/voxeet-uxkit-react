import { combineReducers } from "redux";
import ErrorReducer from "./ErrorReducer";
import ConferenceReducer from "./ConferenceReducer";
import TimerReducer from "./TimerReducer";
import ChatReducer from "./ChatReducer";
import ControlsReducer from "./ControlsReducer";
import InputManagerReducer from "./InputManagerReducer";
import OnBoardingMessageReducer from "./OnBoardingMessageReducer";
import OnBoardingMessageWithActionReducer from "./OnBoardingMessageWithActionReducer";
import ParticipantsReducer from "./ParticipantsReducer";
import ParticipantsWaitingReducer from "./ParticipantsWaitingReducer";
import ActiveSpeakerReducer from "./ActiveSpeakerReducer";
import FilePresentationReducer from "./FilePresentationReducer";
import VideoPresentationReducer from "./VideoPresentationReducer";
import ForwardedVideoReducer from "./ForwardedVideoReducer";

const reducers = combineReducers({
  error: ErrorReducer,
  conference: ConferenceReducer,
  inputManager: InputManagerReducer,
  onBoardingMessage: OnBoardingMessageReducer,
  onBoardingMessageWithAction: OnBoardingMessageWithActionReducer,
  timer: TimerReducer,
  controls: ControlsReducer,
  participants: ParticipantsReducer,
  chat: ChatReducer,
  participantsWaiting: ParticipantsWaitingReducer,
  filePresentation: FilePresentationReducer,
  activeSpeaker: ActiveSpeakerReducer,
  videoPresentation: VideoPresentationReducer,
  forwardedVideo: ForwardedVideoReducer
});

export default reducers;
