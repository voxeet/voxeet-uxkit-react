import reducer from "./reducers";
import ConferenceRoom from "./components/ConferenceRoom";
import Provider from "./components/VoxeetProvider";
import ConferenceSounds from "./libs/sounds";
import {getUxKitContext, setUxKitContext} from "./context";

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

const UxKitVersion = __VERSION__;

module.exports = {
  reducer,
  ConferenceRoom,
  VoxeetProvider: Provider,
  getUxKitContext,
  setUxKitContext,
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
  UxKitVersion
};
