import reducer from "./reducers";
import ConferenceRoom from "./components/ConferenceRoom";
import { Provider } from "@voxeet/react-redux-5.1.1";
import ConferenceSounds from "./libs/sounds";

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
  ToggleAttendeesChatButton,
  ToggleAttendeesListButton
} from "./components/actionsBar/buttons";

module.exports = {
  reducer,
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
    HangUpButtonBottomBar,
    Toggle3DAudioButton,
    ToggleAttendeesChatButton,
    TogglePSTN,
    ToggleAttendeesListButton
  },
  ConferenceSounds,
};
