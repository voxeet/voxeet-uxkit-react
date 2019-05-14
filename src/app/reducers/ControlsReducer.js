import { Types } from '../actions/ControlsActions'
import modes from '../constants/DisplayModes'
import AudioUnMute from '../../static/sounds/voxeet_Exit_Mute.mp3'
import AudioMute from '../../static/sounds/voxeet_Enter_Mute.mp3'
import CallRecorded from '../../static/sounds/call-recorded.mp3'

const defaultState = {
    isWidgetOpened: false,
    isWidgetFullScreenOn: false,
    isMuted: false,
    videoEnabled: false,
    audioEnabled: true,
    displayModal: false,
    isElectron: false,
    audio3DEnabled: true,
    isScreenshare: false,
    isFilePresentation: false,
    constraints: null,
    isRecording: false,
    videoRatio: null,
    chromeExtensionId: null,
    isExternalLive: false,
    isAdminActived: false,
    isKickOnHangUpActived: false,
    recordingLocked: false,
    modalOpened: true,
    displayActions: ["mute", "recording", "share", "video", "live", "attendees", "chat", "pstn"],
    shareActions: ["screenshare", "filepresentation"],
    displayModes: ["tiles", "speaker", "list"],
    mode: 'tiles',
    modeSaveBeforePresentation: 'tiles',
    displayAttendeesList: false,
    displayAttendeesSettings: false,
    displayAttendeesChat: false,
    displayAttendeesLive: false
}

const ControlsReducer = (state = defaultState, action) => {
    switch (action.type) {
        case Types.TOGGLE_WIDGET:
            return {
                ...state,
                isWidgetOpened: !state.isWidgetOpened,
                isWidgetFullScreenOn: false
            }
        case Types.FORCE_MODE:
            return {
                ...state,
                mode: action.payload.mode
            }
        case Types.SET_CHROME_EXTENSION_ID:
            return {
                ...state,
                chromeExtensionId: action.payload.chromeExtensionId
            }
        case Types.SET_VIDEO_RATIO:
            return {
                ...state,
                videoRatio: action.payload.videoRatio
            }
        case Types.SAVE_CONSTRAINTS:
            return {
                ...state,
                constraints: action.payload.constraints
            }
        case Types.TOGGLE_SCREEN_SHARE_MODE:
            return {
                ...state,
                isScreenshare: action.payload.isScreenshare,
                mode: action.payload.isScreenshare ? state.mode : state.displayModes[0]
            }
        case Types.TOGGLE_FILE_PRESENTATION_MODE:
            return {
                ...state,
                isFilePresentation: action.payload.isFilePresentation,
                mode: action.payload.isFilePresentation ? state.mode : state.displayModes[0]
            }
        case Types.TOGGLE_FULLSCREEN:
            const fullScreenStatus = !state.isWidgetFullScreenOn;
            return {
                ...state,
                isWidgetOpened: fullScreenStatus || state.isWidgetOpened,
                isWidgetFullScreenOn: fullScreenStatus
            }

        case Types.ADMIN_ACTIVED:
            return {
                ...state,
                isAdminActived: true,
            }
        case Types.DISPLAY_MODES_ALLOWED:
            return {
                ...state,
                displayModes: action.payload.displayModes,
                mode: action.payload.displayModes[0]
            }
        case Types.DISPLAY_ACTIONS_ALLOWED:
            return {
                ...state,
                displayActions: action.payload.displayActions
            }
        case Types.SHARE_ACTIONS_ALLOWED:
            return {
                ...state,
                shareActions: action.payload.shareActions
            }
        case Types.KICK_ON_HANG_UP:
            return {
                ...state,
                isKickOnHangUpActived: true,
            }
        case Types.UNLOCK_RECORDING:
            return {
                ...state,
                recordingLocked: false
            }
        case Types.LOCK_RECORDING: {
            const audio = new Audio(CallRecorded)
            audio.play()
            return {
                ...state,
                recordingLocked: true
            }
        }
        case Types.TOGGLE_LIVE_EXTERNAL: {
            const currentStatus = state.isExternalLive
            return {
                ...state,
                isExternalLive: !currentStatus
            }
        }
        case Types.TOGGLE_MODE:
            let currentModeIndex = state.displayModes.findIndex(m => m === state.mode)
            if (currentModeIndex + 1 == state.displayModes.length || (!state.isElectron && state.displayModes[currentModeIndex + 1] == 'list')) {
                currentModeIndex = 0
                if (!state.isElectron && state.displayModes[currentModeIndex] == 'list') {
                    currentModeIndex++
                }
            } else {
                currentModeIndex++
            }
            return {
                ...state,
                mode: state.displayModes[currentModeIndex] || state.displayModes[0],
            }
        case Types.TOGGLE_MICROPHONE: {
            const currentStatus = state.isMuted
            const audio = new Audio((!currentStatus ? AudioUnMute : AudioMute))
            audio.play()
            return {
                ...state,
                isMuted: !currentStatus
            }
        }
        case Types.TOGGLE_VIDEO: {
            const currentStatus = action.payload.state
            return {
                ...state,
                videoEnabled: currentStatus
            }
        }
        case Types.TOGGLE_AUDIO: {
            const currentStatus = action.payload.state
            return {
                ...state,
                audioEnabled: currentStatus,
                isMuted: !currentStatus
            }
        }
        case Types.TOGGLE_MODAL: {
            const currentStatus = state.displayModal
            return {
                ...state,
                displayModal: !currentStatus
            }
        }
        case Types.TOGGLE_RECORDING: {
            const currentStatus = state.isRecording
            if (!currentStatus) {
                const audio = new Audio(CallRecorded)
                audio.play()
            }
            return {
                ...state,
                isRecording: !currentStatus
            }
        }
        case Types.ELECTRON_MODE_ACTIVATED: {
            return {
                ...state,
                isElectron: true
            }
        }
        case Types.TOGGLE_AUDIO3D: {
            const currentStatus = state.audio3DEnabled
            return {
                ...state,
                audio3DEnabled: !currentStatus
            }
        }
        case Types.TOGGLE_MODAL_WIDGET: {
            const currentStatus = state.modalOpened
            return {
                ...state,
                modalOpened: !currentStatus
            }
        }
        case Types.RESET_WIDGET_CONTROLS: {
            return {
                ...state,
                isWidgetOpened: false,
                isWidgetFullScreenOn: false,
                isMuted: false,
                videoEnabled: false,
                displayModal: false,
                constraints: null,
                recordingLocked: false,
                isElectron: false,
                audio3DEnabled: true,
                isScreenshare: false,
                isRecording: false,
                isExternalLive: false,
                isAdminActived: false,
                isKickOnHangUpActived: false,
                modalOpened: true
            }
        }
        case Types.TOGGLE_ATTENDEES_CHAT: {
            return { 
                ...state,
                displayAttendeesChat: !state.displayAttendeesChat,
                displayAttendeesList: false,
                displayAttendeesLive: false,
                displayAttendeesSettings: false
            }
        }
        case Types.TOGGLE_ATTENDEES_LIST: {
            return { 
                ...state, 
                displayAttendeesList: !state.displayAttendeesList, 
                displayAttendeesChat: false,
                displayAttendeesLive: false,
                displayAttendeesSettings: false 
            }
        }
        case Types.TOGGLE_ATTENDEES_SETTINGS: {
            return { 
                ...state, 
                displayAttendeesSettings: !state.displayAttendeesSettings, 
                displayAttendeesChat: false,
                displayAttendeesLive: false,
                displayAttendeesList: false
            }
        }
        case Types.TOGGLE_ATTENDEES_LIVE: {
            return { 
                ...state, 
                displayAttendeesLive: !state.displayAttendeesLive, 
                displayAttendeesChat: false,
                displayAttendeesList: false,
                displayAttendeesSettings: false 
            }
        }
        default:
            return state
    }
}

export default ControlsReducer
