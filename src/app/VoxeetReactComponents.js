import reducer from "./reducers";
import StatusButton from "./components/statusButton/StatusButton";
import ReplayButton from "./components/statusButton/ReplayButton";
import StatusCard from "./components/statusCard/StatusCard";
import ConferenceRoom from "./components/ConferenceRoom";
import { Provider } from "@voxeet/react-redux-5.1.1";

import {
  ToggleMicrophoneButton,
  ToggleModeButton,
  ToggleRecordingButton,
  ToggleScreenShareButton,
  ToggleSettingsButton,
  TogglePSTN,
  ToggleVideoButton,
  HangupButton,
  ToggleFullScreenButton,
  HangUpButtonBottomBar,
  Toggle3DAudioButton,
  ToggleExternalLiveButton,
  ToggleAttendeesChatButton,
  ToggleAttendeesListButton
} from "./components/actionsBar/buttons";

module.exports = {
  reducer,
  StatusButton,
  ReplayButton,
  StatusCard,
  ConferenceRoom,
  VoxeetProvider: Provider,
  Buttons: {
    ToggleMicrophoneButton,
    ToggleModeButton,
    ToggleRecordingButton,
    ToggleScreenShareButton,
    ToggleSettingsButton,
    ToggleVideoButton,
    HangupButton,
    ToggleFullScreenButton,
    ToggleModeButton,
    HangUpButtonBottomBar,
    Toggle3DAudioButton,
    ToggleExternalLiveButton,
    ToggleAttendeesChatButton,
    TogglePSTN,
    ToggleAttendeesListButton
  }
};
