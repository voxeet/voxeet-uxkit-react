import { Types } from '../actions/ControlsActions'
import modes from '../constants/DisplayModes'

const defaultState = {
    isWidgetOpened: false,
    isWidgetFullScreenOn: false,
    isMuted: false,
    videoEnabled: false,
    displayModal: false,
    isElectron: false,
    audio3DEnabled: true,
    isScreenshare: false,
    constraints: null,
    isRecording: false,
    videoRatio: null,
    chromeExtensionId: null,
    isExternalLive: false,
    isAdminActived: false,
    isKickOnHangUpActived: false,
    modalOpened: true,
    displayActions: ["mute", "recording", "screenshare", "video", "live"],
    displayModes: ["list", "tiles", "speaker"],
    mode: 'tiles',
    displayAttendeesList: false,
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
        case Types.KICK_ON_HANG_UP:
            return {
                ...state,
                isKickOnHangUpActived: true,
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
            const audio = new Audio((!currentStatus ? '/sounds/voxeet_Exit_Mute.mp3' : '/sounds/voxeet_Enter_Mute.mp3'))
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
        case Types.TOGGLE_MODAL: {
            const currentStatus = state.displayModal
            return {
                ...state,
                displayModal: !currentStatus
            }
        }
        case Types.TOGGLE_RECORDING: {
            const currentStatus = state.isRecording
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
        case Types.TOGGLE_ATTENDEES_LIST: {
            return { ...state, displayAttendeesList: !state.displayAttendeesList }
        }
        default:
            return state
    }
}

export default ControlsReducer
