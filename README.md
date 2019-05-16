Voxeet React Components
=====================

## Installation

```
npm i @voxeet/voxeet-web-sdk @voxeet/react-components --save
yarn add @voxeet/voxeet-web-sdk @voxet/react-components
```

## Usage
### Reducer

A redux reducer needs to be added to your store.

```javascript
import { reducer as voxeetReducer } from '@voxeet/react-components';

const reducers = combineReducers({
  voxeet: voxeetReducer
});
```

### Widget

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import thunkMidleware from 'redux-thunk'
import { combineReducers, createStore, applyMiddleware } from 'redux'

import { ConferenceRoom, reducer as voxeetReducer } from '@voxeet/react-components'

// Import Style
import '@voxeet/react-components/dist/voxeet-react-components.css'; // Can you be customize, refer to https://github.com/voxeet/voxeet-assets-react-components

const reducers = combineReducers({
  voxeet: voxeetReducer
});

const configureStore = () => createStore(
  reducers,
  applyMiddleware(thunkMidleware)
)

const settings = {
  consumerKey: 'consumerKey',
  consumerSecret: 'consumerSecret',
  conferenceAlias: 'Sample'
}

ReactDOM.render(
  <Provider store={configureStore()}>
    <ConferenceRoom
      isWidget
      consumerKey={settings.consumerKey}
      consumerSecret={settings.consumerSecret}
      conferenceAlias={settings.conferenceAlias}
    />
  </Provider>,
  document.getElementById('app')
)
```

where `consumerKey` and `consumerSecret` or `oauthToken` (retrieve by backend) are your credentials and `conferenceAlias` the conference you want to join.

The Widget is translate in english and french. The language will be automatically choose base on your browser language.

## Widget Properties
| Name | Type | Default | Description|
|------|------|---------|------------|
|`sdk`|Function||VoxeetSDK if you want to use an external Voxeet SDK|
|`consumerKey`|String||The consumer key|
|`consumerSecret`|String||The consumer secret|
|`oauthToken`|String||The oauth token retrieve from your backend (prevent using consumerKey/consumerSecret in frontend) ! Make sure to use this `refreshTokenCallback props of the widget too !|
|`refreshTokenCallback`|func||Provide this function that return a promise with the refreshed token, when this one expire|
|`conferenceAlias`|String||The conference you whant to join|
|`logo`|String|Voxeet Logo|Display your logo inside the react components by using this props.|
|`chromeExtensionId`|String||Id of chrome screenshare extension, a message will be prompt when the user will try to screenshare (Inline installation is no longer supported)|
|`displayActions`|Array|["mute" ,"recording", "share", "video", "live", "attendees", "chat", "pstn"]|You can disable some actions buttons. Example : displayActions={["mute", "video"]} will allow to video and mute button (Strings : "mute", "video", "share", "recording", "live", "attendees", "chat")|
|`shareActions`|Array|["screenshare" ,"filepresentation"]|You can choose which button will be display, it's possible to do a screenshare, or a file presentation ! If you set the displayActions you need to add the 'share' button to allow actions !|
|`liveRecordingEnabled`|Boolean|false|Ability to record a conference in live. Generate an MP4 video of the conference. Can be retrieve by a webhook (a small delay might be necessary for process the video)|
|`isWidget`|Boolean|true|Indicate if component used like widget or embedded in your app|
|`chromeExtensionId`|String|null|The Id from your Chrome Web Extension to screenshare (needed only on Chrome)|
|`isModal`|Boolean|false|Indicate if component displayed like modal|
|`loadingScreen`|Component|LoadingScreen|Put your own loading screen instead of Voxeet loading screen|
|`isWebinar`|Boolean|false|Launch the widget in Webinar mode, only admin can speak (Restriction in "tiles" mode)|
|`autoJoin`|Boolean|false|Join automatically conference|
|`preConfig`|Boolean|false|Show a pop up before entering inside the Conference to configure your devices (audio, video)|
|`videoCodec`|String|VP8|Specify video codec "H264" or "VP8" => H264 is needed for video on Safari|
|`isListener`|Boolean|false|Enter in conference in listener mode|
|`displayModes`|Array|["list", "tiles", "speaker"]|Indicate which mode is allowed (modes will be in the same order as the array)|
|`isManualKickAllowed`|Boolean|false|Authorize admin (conference creator) to kick users in conference|
|`isAdmin`|Boolean|false|Current user who join the conference is the admin|
|`kickOnHangUp`|Boolean|false|Kick all users when admin (conference creator) leave the conference|
|`userInfo`|Object|{</br>&nbsp;&nbsp;name: 'Guest ' + Math.floor((Math.random() * 100) + 1),</br>&nbsp;&nbsp;externalId: '',</br>&nbsp;&nbsp;avatarUrl: ''</br>}|User informations for voxeet sdk|
|`conferenceReplayId`|String||Replay automatically a conference|
|`constraints`|Object|{</br>&nbsp;&nbsp;audio: true,</br>&nbsp;&nbsp;video: false</br>}|The webrtc constraints for the sdk|
|`actionsButtons`|React Component|ActionsButtons - All buttons|A react component to customize the actions buttons|
|`handleOnLeave`|Function||Function call on leave conference|
|`handleOnConnect`|Function||Function call when the current user is connected to the conference|

For more documentation on userInfo and constraints you can look at [Voxeet Sdk](https://www.npmjs.com/package/@voxeet/voxeet-web-sdk)

## Actions buttons

The default control buttons component is below, you can customize it for you needs. Just replace

```javascript
import React, { Component } from "react";
import PropTypes from "prop-types";

import { Buttons } from "@voxeet/react-components";

class ActionsButtons extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { isBottomBar, 
            forceFullscreen, 
            isMuted, 
            isRecording, 
            isWidgetFullScreenOn,
            videoEnabled, 
            displayModal,
            conferencePincode, 
            convertFilePresentation, 
            toggleMicrophone, 
            screenShareEnabled, 
            filePresentationEnabled, 
            toggleRecording, 
            toggleVideo, 
            toggleScreenShare, 
            attendeesSettingsOpened, 
            toggleAttendeesSettings, 
            toggleAttendeesList, 
            attendeesListOpened, 
            attendeesChatOpened, 
            attendeesLiveOpened,
            toggleAttendeesChat, 
            toggleAttendeesLive, 
            recordingLocked, 
            toggleModal, 
            toggleAudio3D, 
            isWebinar, 
            isAdmin, 
            displayActions, 
            shareActions, 
            leave, 
            audio3DEnabled, 
            isElectron, 
            displayExternalLiveModal, 
            isExternalLive, 
            isFilePresentation, 
            isScreenshare, 
            isDemo } = this.props;

    return (
            <div>
                <ul className="controls-left">
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("mute") > -1 && !isDemo &&
                        <ToggleMicrophoneButton
                            isMuted={isMuted}
                            toggle={toggleMicrophone}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("video") > -1 && !isDemo &&
                        <ToggleVideoButton
                            videoEnabled={videoEnabled}
                            toggle={toggleVideo}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && isBottomBar && isElectron &&
                        <Toggle3DAudioButton
                            audio3DEnabled={audio3DEnabled}
                            toggleAudio3D={toggleAudio3D}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                </ul>
                <ul className="controls-center">
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("recording") > -1 && !isDemo &&
                        <ToggleRecordingButton
                            isRecording={isRecording}
                            recordingLocked={recordingLocked}
                            toggle={toggleRecording}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("share") > -1 && !isDemo && shareActions.length > 0 &&
                        <ToggleScreenShareButton
                            screenShareEnabled={screenShareEnabled}
                            filePresentationEnabled={filePresentationEnabled}
                            currentUserScreenShare={isScreenshare}
                            currentUserFilePresentation={isFilePresentation}
                            isElectron={isElectron}
                            toggle={toggleScreenShare}
                            convertFilePresentation={convertFilePresentation}
                            shareActions={shareActions}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {isBottomBar && (!isWebinar || isWebinar && isAdmin) && !isDemo &&
                        <li className="separator">
                        </li>
                    }
                    {isBottomBar &&
                        <HangUpButtonBottomBar
                            leave={leave}
                            tooltipPlace='top'
                        />
                    }

                </ul>
                <ul className="controls-right">
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("pstn") > -1 && !isDemo &&
                        <TogglePSTN
                            conferencePincode={conferencePincode}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || (isWebinar && isAdmin)) && displayActions.indexOf("live") > -1 && !isDemo &&
                        <ToggleExternalLiveButton
                            attendeesLiveOpened={attendeesLiveOpened}
                            toggle={toggleAttendeesLive}
                            isExternalLive={isExternalLive}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {!isWidgetFullScreenOn && !forceFullscreen && (!isWebinar || isWebinar && isAdmin) &&
                        <ToggleSettingsButton
                            attendeesSettingsOpened={attendeesSettingsOpened}
                            toggle={toggleAttendeesSettings}
                            isBottomBar={isBottomBar}
                            tooltipPlace={isBottomBar ? 'top' : 'right'}
                        />
                    }
                    {displayActions.indexOf("attendees") > -1  &&
                        <ToggleAttendeesListButton tooltipPlace={isBottomBar ? 'top' : 'right'} toggle={toggleAttendeesList} isBottomBar={isBottomBar} isOpen={attendeesListOpened}/>
                    }
                    {displayActions.indexOf("chat") > -1  &&
                        <ToggleAttendeesChatButton tooltipPlace={isBottomBar ? 'top' : 'right'} toggle={toggleAttendeesChat} isBottomBar={isBottomBar} isOpen={attendeesChatOpened}/>
                    }
                </ul>
            </div>
        )
    }
}

ActionsButtons.propTypes = {
    isBottomBar: PropTypes.bool.isRequired,
    forceFullscreen: PropTypes.bool.isRequired,
    isMuted: PropTypes.bool.isRequired,
    isWebinar: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    videoEnabled: PropTypes.bool.isRequired,
    screenShareEnabled: PropTypes.bool.isRequired,
    filePresentationEnabled: PropTypes.bool.isRequired,
    displayModal: PropTypes.bool.isRequired,
    isScreenshare: PropTypes.bool.isRequired,
    isFilePresentation: PropTypes.bool.isRequired,
    displayActions: PropTypes.array.isRequired,
    toggleAudio3D: PropTypes.func.isRequired,
    recordingLocked: PropTypes.bool.isRequired,
    isElectron: PropTypes.bool.isRequired,
    isExternalLive: PropTypes.bool.isRequired,
    audio3DEnabled: PropTypes.bool.isRequired,
    isRecording: PropTypes.bool.isRequired,
    isWidgetFullScreenOn: PropTypes.bool.isRequired,
    toggleMicrophone: PropTypes.func.isRequired,
    leave: PropTypes.func.isRequired,
    toggleRecording: PropTypes.func.isRequired,
    toggleVideo: PropTypes.func.isRequired,
    toggleScreenShare: PropTypes.func.isRequired,
    convertFilePresentation: PropTypes.func.isRequired,
    toggleModal: PropTypes.func.isRequired,
    toggleMode: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    toggleAttendeesList: PropTypes.func.isRequired,
    attendeesListOpened: PropTypes.bool.isRequired,
    toggleAttendeesChat: PropTypes.func.isRequired,
    attendeesChatOpened: PropTypes.bool.isRequired,
    toggleAttendeesSettings: PropTypes.func.isRequired,
    attendeesSettingsOpened: PropTypes.bool.isRequired,
    toggleAttendeesLive: PropTypes.func.isRequired,
    attendeesLiveOpened: PropTypes.bool.isRequired
}

ActionsButtons.defaultProps = {
    isBottomBar: false,
    forceFullscreen: false
}

export default ActionsButtons

```
