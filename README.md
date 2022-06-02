# Voxeet React Components

## Installation

```
npm i @voxeet/voxeet-web-sdk @voxeet/react-components --save
yarn add @voxeet/voxeet-web-sdk @voxeet/react-components 
```

## Changelog

### 3.2.4

#### Bug fixes

- Fixed an issue where media track remains open after the end of the call

### 3.2.3

#### Bug fixes

- Fixed an issue where listeners and participants without streams are not visible in the conference
- Fixed an issue where the switch for bokeh mode is visible in web browsers

### 3.2.2

#### Bug fixes

- Fixed device selection on Safari 15
- Fixed the participantAdded event handling behavior to display all participants who are present at a conference
- Fixed an output audio device issue that occurs for participants who join a conference using the Chrome browser
- Fixed issues related to opening and closing sessions
- Fixed an issue where YouTube videos shared during a conference start from a specific times

### 3.2.1

#### Bug fixes

- Fixed video presentation seek behavior
- Fixed echo issue when the pre-configuration settings is accessed

### 3.2.0

#### Features

- Support for muting individual remote user for the participant
- Added "Retry" button to retry accessing the media devices in case of a temporary error
- Disabled autolinker unless specified in chat options.

### 3.1.0

#### Features

- Introduced the Video Forwarding feature to allow participants to dynamically control the number of transmitted video streams. The Video Forwarding article describes in detail the changes to Interactivity APIs.

### 3.0.1

#### Bug fixes

- Fixed an echo issue that occurred after switching input and output devices.

### 3.0.0

#### Features

- Support for SDK 3.0 and Dolby Voice conference, including support for Audio Transparency Mode and listen-only mode.

#### Bug fixes

- Fixed a problem where Safari does not play audio when joining the conference in listen-only mode.
- Corrected several issues related to network errors during the call.

### 2.1.5

#### Bug fixes

- Fixed an issue with ignoring logo props during loading.
- Added translation for an active speaker overlay.
- Improved the file presentation UI, which introduces cropped images and removal of a grey bar in the thumbnails area.

### 2.1.4

#### Bug fixes

- Fixed an issue with enabled participants' cameras after the end of a conference.

### 2.1.3

#### Device management overhaul

- Now in the call, if you disconnect/connect new audio devices they show up correctly in the device list so you can switch freely between devices.
- Improved device access failure error handling to provide the correct UI message to the user for troubleshooting purposes.
- Allows output device selection in listen-only mode.
- Previously used devices are saved in the device list.

#### Tile layout improvement

- In anticipation of future design of limited video users, an active speaker pop-up appears, similar to BlueJeans functionality.
- The video frames are now uniform; inconsistent aspect ratio video frames are scaled down to fit the available rectangle for the user, making the tile layout uniform.

#### Other changes

- Addition of quality indicator and mute button in the Attendees list
- Delayed active speaker switching (prevents switching too soon)
- The view refreshed/updated if the active speaker leaves the conference

### 2.1.1 / 2.1.2

#### Features

- Ability to customise sounds

#### Bug fixes

- Mobile layout improvements
- Number of participant in the bottom bar is fixed (Listeners are now included)
- Fix invite participant
- RtcpMode option has been removed

### 2.1.0

#### Features

- A new UI and mobile layout.
- Compatibility with the SDK 2.x.

#### Bug fixes

- Updated audio output.
- Fixed an issue with the `sameSite` cookie warning.
- Fixed an issue with the update of the participants list.

### 2.0.1

#### Bug fixes

- Fix webinar compatibility with SDK V2.X

### 2.0.0

- Compatibility with Voxeet Web SDK V2.X (Not working with SDK V1.X)

### 1.1.0-rc1

This version only work with Voxeet SDK V2 (Please contact us to use it)
! IMPORTANT ! This version is on alpha, some issues can appear. DO NOT PUSH IN PRODUCTION.

#### Features

- First implementation in alpha of SDK V2
- Add pinCode props (Give your own pinCode to the UXKit)

#### Property update

- `pstnNumbers` is now empty, you need to use your own PSTN numbers in order to use this feature
  Format :

```javascript
[
  {
    Code: "US",
    Number: "YOUR_PSTN_NUMBER",
  },
];
```

#### Bug fixes

- Pre configuration screen in small screen

### 1.0.1

#### Bug fixes

- Fix possible CSS conflict with some classes
- Move library target from `umd` to `commonjs2`

### 1.0.0

#### Features

- Add support for `react-redux` v7.X, `VoxeetProvider` is now exposed inside the `react-components` to prevent version conflicts (Use the `VoxeetProvider` instead )

#### Property update

- `videoCodec` default is now `H264`

### 0.36.7

#### Features

- New property `closeSessionAtHangUp`, option to choose if the session should be automatically close at hang up (default: true)

### 0.36.6

#### Features

- Search engine for `invitedUsers` in order to find user easily in the `AttendeesList`

### 0.36.3-0.36.5

#### Features

- New property `invitedUsers`, add the possibilidy to give an array of users who can be invited during the conference. (externalId mandatory)

### 0.36.2

#### Features

- New property `pstnNumbers`, use http://cdn.voxeet.com/pstn/numbers to get phone numbers for PSTN and give an array of needed numbers in this property

### 0.36.1

#### Features

- You can now disable sounds using `disableSounds` props
- String customisation (See explanations below) with `customLocalizedStrings`

#### Bug fixes

- Fix camera truncated in speaker mode if the video is coming from mobile
- Fix video presentation in widget mode

### 0.35.0

#### Features

- Implementation of video presentation (If you use `shareActions` you can add `videopresentation`), a video can now be shared to other attendees. Only the video presenter can control the video, other attendees will receive actions (Play/Pause/Seek).
- You can now customize "We're waiting for other callers to arrive." with component `attendeesWaiting`.
- Automatically start a recording when joining a conference with `autoRecording` (if it's not already start).
- Automatically start HLS when joining a conference with `autoHls` (if it's not already start).
- When starting HLS in Live Broadcast right panel, a link is displayed to watch the live conference.

#### Bug fixes

- Pre-configuration screen, error if access denied to your devices (microphone and/or camera)
- UI improvements
- Responsive improvements

## Usage

### Reducer

A redux reducer needs to be added to your store.

```javascript
import { reducer as voxeetReducer } from "@voxeet/react-components";

const reducers = combineReducers({
  voxeet: voxeetReducer,
});
```

### Widget

```javascript
import React from "react";
import ReactDOM from "react-dom";
import thunkMidleware from "redux-thunk";
import { combineReducers, createStore, applyMiddleware } from "redux";

import {
  ConferenceRoom,
  VoxeetProvider,
  reducer as voxeetReducer,
} from "@voxeet/react-components";

// Import Style
import "@voxeet/react-components/dist/voxeet-react-components.css"; // Can be customized, refer to https://github.com/voxeet/voxeet-assets-react-components

const reducers = combineReducers({
  voxeet: voxeetReducer,
});

const configureStore = () =>
  createStore(reducers, applyMiddleware(thunkMidleware));

const settings = {
  consumerKey: "consumerKey",
  consumerSecret: "consumerSecret",
  conferenceAlias: "Sample",
};

ReactDOM.render(
  <VoxeetProvider store={configureStore()}>
    <ConferenceRoom
      isWidget
      consumerKey={settings.consumerKey}
      consumerSecret={settings.consumerSecret}
      conferenceAlias={settings.conferenceAlias}
    />
  </VoxeetProvider>,
  document.getElementById("app")
);
```

where `consumerKey` and `consumerSecret` or `oauthToken` (retrieve by backend) are your credentials and `conferenceAlias` the conference you want to join.

The Widget is translate in english and french. The language will be automatically choose base on your browser language.

## Widget Properties

| Name                     | Type            | Default                                                                                                                                        | Description                                                                                                                                                                                                  |
| ------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sdk`                    | Function        |                                                                                                                                                | VoxeetSDK if you want to use an external Voxeet SDK                                                                                                                                                          |
| `consumerKey`            | String          |                                                                                                                                                | The consumer key                                                                                                                                                                                             |
| `consumerSecret`         | String          |                                                                                                                                                | The consumer secret                                                                                                                                                                                          |
| `oauthToken`             | String          |                                                                                                                                                | The oauth token retrieve from your backend (prevent using consumerKey/consumerSecret in frontend) ! Make sure to use this `refreshTokenCallback props of the widget too !                                    |
| `refreshTokenCallback`   | func            |                                                                                                                                                | Provide this function that return a promise with the refreshed token, when this one expire                                                                                                                   |
| `conferenceAlias`        | String          |                                                                                                                                                | The conference you whant to join                                                                                                                                                                             |
| `logo`                   | String          | Voxeet Logo                                                                                                                                    | Display your logo inside the react components by using this props.                                                                                                                                           |
| `chromeExtensionId`      | String          |                                                                                                                                                | Id of chrome screenshare extension, a message will be prompt when the user will try to screenshare (Inline installation is no longer supported)                                                              |
| `displayActions`         | Array           | ["mute" ,"recording", "share", "video", "live", "attendees", "chat", "pstn"]                                                                   | You can disable some actions buttons. Example : displayActions={["mute", "video"]} will allow to video and mute button (Strings : "mute", "video", "share", "recording", "live", "attendees", "chat")        |
| `shareActions`           | Array           | ["screenshare" ,"filepresentation", "videopresentation"]                                                                                       | You can choose which button will be display, it's possible to do a screenshare, file presentation or video presentation ! If you set the displayActions you need to add the 'share' button to allow actions. |
| `liveRecordingEnabled`   | Boolean         | false                                                                                                                                          | Ability to record a conference in live. Generate an MP4 video of the conference. Can be retrieve by a webhook (a small delay might be necessary for process the video)                                       |
| `disableSounds`          | Boolean         | false                                                                                                                                          | Disable sounds during the conference (mute/unmute, record, conference join, conference left)                                                                                                                 |
| `customLocalizedStrings` | Object          | Custom strings, described below                                                                                                                |
| `pstnNumbers`            | Array           | Custom PSTN Numbers                                                                                                                            |
| `pinCode`                | String          | Pin code for PSTN call                                                                                                                         |
| `isWidget`               | Boolean         | true                                                                                                                                           | Indicate if component used like widget or embedded in your app                                                                                                                                               |
| `chromeExtensionId`      | String          | null                                                                                                                                           | The Id from your Chrome Web Extension to screenshare (needed only on Chrome)                                                                                                                                 |
| `autoRecording`          | Boolean         | false                                                                                                                                          | Automatically record the conference when joining the conference (if it's not already start)                                                                                                                  |
| `closeSessionAtHangUp`   | Boolean         | true                                                                                                                                           | Automatically close the session of the current user when hang up                                                                                                                                             |
| `isModal`                | Boolean         | false                                                                                                                                          | Indicate if component displayed like modal                                                                                                                                                                   |
| `loadingScreen`          | Component       | LoadingScreen                                                                                                                                  | Put your own loading screen instead of Voxeet loading screen                                                                                                                                                 |
| `isWebinar`              | Boolean         | false                                                                                                                                          | Launch the widget in Webinar mode, only admin can speak (Restriction in "tiles" mode)                                                                                                                        |
| `autoJoin`               | Boolean         | false                                                                                                                                          | Join automatically conference                                                                                                                                                                                |
| `preConfig`              | Boolean         | false                                                                                                                                          | Show a pop up before entering inside the Conference to configure your devices (audio, video)                                                                                                                 |
| `videoCodec`             | String          | H264                                                                                                                                           | Specify video codec "H264" or "VP8" => H264 is needed for video on Safari                                                                                                                                    |
| `isListener`             | Boolean         | false                                                                                                                                          | Enter in conference in listener mode                                                                                                                                                                         |
| `displayModes`           | Array           | ["list", "tiles", "speaker"]                                                                                                                   | Indicate which mode is allowed (modes will be in the same order as the array)                                                                                                                                |
| `invitedUsers`           | Array           | [{name: "USERNAME", externalId:"EXTERNAL_ID", title: "TITLE"}]                                                                                 | Array of people who can be invited during the conference. If the other side, people need to be subscribe to the conference to receive the invitation                                                         |
| `isManualKickAllowed`    | Boolean         | false                                                                                                                                          | Authorize admin (conference creator) to kick users in conference                                                                                                                                             |
| `isAdmin`                | Boolean         | false                                                                                                                                          | Current user who join the conference is the admin                                                                                                                                                            |
| `kickOnHangUp`           | Boolean         | false                                                                                                                                          | Kick all users when admin (conference creator) leave the conference                                                                                                                                          |
| `userInfo`               | Object          | {</br>&nbsp;&nbsp;name: 'Guest ' + Math.floor((Math.random() \* 100) + 1),</br>&nbsp;&nbsp;externalId: '',</br>&nbsp;&nbsp;avatarUrl: ''</br>} | User informations for voxeet sdk                                                                                                                                                                             |
| `conferenceReplayId`     | String          |                                                                                                                                                | Replay automatically a conference                                                                                                                                                                            |
| `constraints`            | Object          | {</br>&nbsp;&nbsp;audio: true,</br>&nbsp;&nbsp;video: false</br>}                                                                              | The webrtc constraints for the sdk                                                                                                                                                                           |
| `actionsButtons`         | React Component | ActionsButtons - All buttons                                                                                                                   | A react component to customize the actions buttons                                                                                                                                                           |
| `handleOnLeave`          | Function        |                                                                                                                                                | Function call on leave conference                                                                                                                                                                            |
| `handleOnConnect`        | Function        |                                                                                                                                                | Function call when the current user is connected to the conference                                                                                                                                           |

For more documentation on userInfo and constraints you can look at [Voxeet Sdk](https://www.npmjs.com/package/@voxeet/voxeet-web-sdk)

## Actions buttons

The default control buttons component is below, you can customize it for you needs. Just replace

```javascript
import React, { Component } from "react";
import PropTypes from "prop-types";
import bowser from "bowser";
import { Buttons } from "@voxeet/react-components";

class ActionsButtons extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isBottomBar,
      forceFullscreen,
      isMuted,
      isRecording,
      isWidgetFullScreenOn,
      toggleVideoPresentation,
      videoEnabled,
      isVideoPresentation,
      videoPresentationEnabled,
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
      toggleAttendeesChat,
      recordingLocked,
      toggleModal,
      toggleAudio3D,
      participants,
      isWebinar,
      isAdmin,
      displayActions,
      shareActions,
      leave,
      audio3DEnabled,
      displayExternalLiveModal,
      currentUser,
      isFilePresentation,
      isScreenshare,
      isDemo,
    } = this.props;
    let nbParticipants = 0;
    if (participants && participants.length) {
      nbParticipants = participants.filter((p) => p.isConnected).length;
    }
    if ((!isWebinar && !currentUser.isListener) || (isWebinar && isAdmin))
      nbParticipants += 1;

    return (
      <div>
        <ul className="controls-left">
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("mute") > -1 &&
            !isDemo && (
              <ToggleMicrophoneButton
                isMuted={isMuted}
                toggle={toggleMicrophone}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("video") > -1 &&
            !isDemo && (
              <ToggleVideoButton
                videoEnabled={videoEnabled}
                toggle={toggleVideo}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
        </ul>
        <ul className="controls-center">
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("recording") > -1 &&
            !isDemo && (
              <ToggleRecordingButton
                isRecording={isRecording}
                recordingLocked={recordingLocked}
                toggle={toggleRecording}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("share") > -1 &&
            !isDemo &&
            shareActions.length > 0 && (
              <ToggleScreenShareButton
                screenShareEnabled={screenShareEnabled}
                filePresentationEnabled={filePresentationEnabled}
                videoPresentationEnabled={videoPresentationEnabled}
                currentUserScreenShare={isScreenshare}
                currentUserFilePresentation={isFilePresentation}
                currentUserVideoPresentation={isVideoPresentation}
                toggle={toggleScreenShare}
                toggleVideoPresentation={toggleVideoPresentation}
                convertFilePresentation={convertFilePresentation}
                shareActions={shareActions}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {isBottomBar && (!isWebinar || (isWebinar && isAdmin)) && !isDemo && (
            <li className="separator"></li>
          )}
          {isBottomBar && (
            <HangUpButtonBottomBar leave={leave} tooltipPlace="top" />
          )}
        </ul>
        <ul className="controls-right">
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            displayActions.indexOf("pstn") > -1 &&
            conferencePincode.length > 0 &&
            !isDemo && (
              <TogglePSTN
                conferencePincode={conferencePincode}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {!isWidgetFullScreenOn &&
            !forceFullscreen &&
            (!isWebinar || (isWebinar && isAdmin)) &&
            !bowser.msie &&
            !currentUser.isListener && (
              <ToggleSettingsButton
                attendeesSettingsOpened={attendeesSettingsOpened}
                toggle={toggleAttendeesSettings}
                isBottomBar={isBottomBar}
                tooltipPlace={isBottomBar ? "top" : "right"}
              />
            )}
          {displayActions.indexOf("attendees") > -1 && (
            <ToggleAttendeesListButton
              nbParticipants={nbParticipants}
              tooltipPlace={isBottomBar ? "top" : "right"}
              toggle={toggleAttendeesList}
              isBottomBar={isBottomBar}
              isOpen={attendeesListOpened}
            />
          )}
          {displayActions.indexOf("chat") > -1 && (
            <ToggleAttendeesChatButton
              tooltipPlace={isBottomBar ? "top" : "right"}
              toggle={toggleAttendeesChat}
              isBottomBar={isBottomBar}
              isOpen={attendeesChatOpened}
            />
          )}
        </ul>
      </div>
    );
  }
}

ActionsButtons.propTypes = {
  isBottomBar: PropTypes.bool.isRequired,
  forceFullscreen: PropTypes.bool.isRequired,
  isMuted: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  isWebinar: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  videoEnabled: PropTypes.bool.isRequired,
  screenShareEnabled: PropTypes.bool.isRequired,
  filePresentationEnabled: PropTypes.bool.isRequired,
  videoPresentationEnabled: PropTypes.bool.isRequired,
  displayModal: PropTypes.bool.isRequired,
  isScreenshare: PropTypes.bool.isRequired,
  isVideoPresentation: PropTypes.bool.isRequired,
  isFilePresentation: PropTypes.bool.isRequired,
  displayActions: PropTypes.array.isRequired,
  toggleAudio3D: PropTypes.func.isRequired,
  recordingLocked: PropTypes.bool.isRequired,
  audio3DEnabled: PropTypes.bool.isRequired,
  isRecording: PropTypes.bool.isRequired,
  isWidgetFullScreenOn: PropTypes.bool.isRequired,
  toggleMicrophone: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired,
  toggleRecording: PropTypes.func.isRequired,
  toggleVideo: PropTypes.func.isRequired,
  toggleScreenShare: PropTypes.func.isRequired,
  toggleVideoPresentation: PropTypes.func.isRequired,
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
};

ActionsButtons.defaultProps = {
  isBottomBar: false,
  forceFullscreen: false,
};

export default ActionsButtons;
```

### Localized strings

You can add languages by updating the file `src/app/languages/localizedStrings.js` with new languages. Today, we have English and French.
