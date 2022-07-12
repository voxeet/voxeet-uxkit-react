## Changelog

### 3.5.1

#### Bug fixes

- Fix an issue when using redux devtools.

### 3.5.0

#### Features

- Support for [SDK 3.5.0](https://github.com/voxeet/voxeet-sdk-web/releases/tag/3.5.0) that supports the Dolby Voice Codec in Dolby Voice conferences to improve audio processing and offer higher audio quality.

#### Bug fixes

- Fixed an issue where a file presentation started by a participant without audio and video was not visible to the rest of conference participants ([#214](https://github.com/voxeet/voxeet-uxkit-react/issues/214))
- Fixed an issue where UXKit did not use the customLocalizedStrings property ([#229](https://github.com/voxeet/voxeet-uxkit-react/issues/229))

### 3.3.0

#### Features

- Support for SDK 3.4 and [Spatial Audio](https://docs.dolby.io/communications-apis/docs/guides-spatial-audio) with Audio/Video congruence
- Support for React 17

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

- New property `invitedUsers`, add the possibility to give an array of users who can be invited during the conference. (externalId mandatory)

### 0.36.2

#### Features

- New property `pstnNumbers`, use http://cdn.voxeet.com/pstn/numbers to get phone numbers for PSTN and give an array of needed numbers in this property

### 0.36.1

#### Features

- You can now disable sounds using `disableSounds` props
- String customization (See explanations below) with `customLocalizedStrings`

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
