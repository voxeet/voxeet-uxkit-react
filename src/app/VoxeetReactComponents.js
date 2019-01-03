import reducer from './reducers'
import StatusButton from './components/statusButton/StatusButton'
import ReplayButton from './components/statusButton/ReplayButton'
import StatusCard from './components/statusCard/StatusCard'
import ConferenceRoom from './components/ConferenceRoom'

import {
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
    ToggleExternalLiveButton,
    ToggleAttendeesChatButton,
    ToggleAttendeesListButton,
} from './components/actionsBar/buttons'

module.exports = {
    reducer,
    StatusButton,
    ReplayButton,
    StatusCard,
    ConferenceRoom,
    Buttons:{
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
        ToggleAttendeesListButton
    }
}
