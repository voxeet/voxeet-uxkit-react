const production = (process.env.NODE_ENV === 'production');

let sessionURI = 'https://staging-session.voxeet.com';
let photoUrl = 'https://staging-avatars.voxeet.com/';
let fileServer = 'https://staging-upload.voxeet.com/upload';

if (production) {
  sessionURI = 'https://session.voxeet.com';
  photoUrl = 'https://avatars.voxeet.com/';
  fileServer = 'https://upload.voxeet.com/upload';
}

const VoxeetApi = {
  version: '0.1',
  host: sessionURI,
  photoUrl: photoUrl,
  fileServer: fileServer,
  api: {
    params: {
      facebook: {
        method: 'GET',
        uri: '/params/facebook',
      },
      google: {
        method: 'GET',
        uri: '/params/google',
      },
      slack: {
        method: 'GET',
        uri: '/params/slack',
      },
    },
    users: {
      signup: {
        method: 'POST',
        uri: '/users/create',
      },
      resetPassword: {
        method: 'POST',
        uri: '/users/resetPassword',
      },
      login: {
        method: 'POST',
        uri: '/users/login',
      },
      logout: {
        method: 'POST',
        uri: '/users/logout',
      },
      profile: {
        method: 'GET',
        uri: '/users/{userId}',
      },
      fetch: {
        method: 'GET',
        uri: '/users/me',
      },
      edit: {
        method: 'PUT',
        uri: '/users/me',
      },
      getUploadToken: {
        method: 'GET',
        uri: '/users/me/getUploadToken',
      },
      updatePresence: {
        method: 'PUT',
        uri: '/users/me/updatePresence',
      },
      updatePassword: {
        method: 'PUT',
        uri: '/users/me/updatePassword',
      },
      addEmail: {
        method: 'PUT',
        uri: '/users/me/addEmail',
      },
      removeEmail: {
        method: 'PUT',
        uri: '/users/me/removeEmail',
      },
      setDefaultEmail: {
        method: 'PUT',
        uri: '/users/me/setDefaultEmail',
      },
    },
    contacts: {
      list: {
        method: 'GET',
        uri: '/contacts',
      },
      fetch: {
        method: 'GET',
        uri: '/contacts/{userId}',
      },
      edit: {
        method: 'PUT',
        uri: '/contacts/edit/{userId}',
      },
      invite: {
        method: 'POST',
        uri: '/contacts/invite',
      },
      delete: {
        method: 'DELETE',
        uri: '/contacts/{userId}',
      },
      addTags: {
        method: 'PUT',
        uri: '/contacts/{userId}/tags',
      },
      removeTags: {
        method: 'DELETE',
        uri: '/contacts/{userId}/tags',
      },
    },
    conferences: {
      create: {
        method: 'POST',
        uri: '/conferences/create',
      },
      invite: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/invite',
      },
      join: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/join',
      },
      answer: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/answer/{peerId}',
      },
      leave: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/leave',
      },
      present: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/present',
      },
      startRecording: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/startRecording',
      },
      stopRecording: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/stopRecording',
      },
      guestLogin: {
        method: 'POST',
        uri: '/conferences/guest',
      },
      callUserLogin: {
        method: 'POST',
        uri: '/call/user/{userId}',
      },
      callMeetingLogin: {
        method: 'POST',
        uri: '/call/meeting/{meetingId}',
      },
      getDemo: {
        method: 'GET',
        uri: '/conferences/demo',
      },
      rate: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/rate',
      },
      recall: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/recall',
      },
      sendReminder: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/sendReminder',
      },
      inviteWhisper: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/whisper/{userId}/invite',
      },
      acceptWhisper: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/whisper/{userId}/accept',
      },
      declineWhisper: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/whisper/{userId}/decline',
      },
      leaveWhisper: {
        method: 'POST',
        uri: '/conferences/{conferenceId}/whisper/leave',
      },
    },
    conversations: {
      create: {
        method: 'POST',
        uri: '/meetings/create',
      },
      list: {
        method: 'GET',
        uri: '/meetings',
      },
      fetch: {
        method: 'GET',
        uri: '/meetings/{meetingId}',
      },
      fetchFiles: {
        method: 'GET',
        uri: '/meetings/{meetingId}/files',
      },
      sendMessage: {
        method: 'PUT',
        uri: '/meetings/{meetingId}/sendMessage',
      },
      inviteUsers: {
        method: 'POST',
        uri: '/meetings/{meetingId}/invite',
      },
      broadcastCommand: {
        method: 'POST',
        uri: '/meetings/{meetingId}/broadcastCommand', // type, message, timestamp
      },
    },
    channels: {
      list: {
        method: 'GET',
        uri: '/tags',
      },
      edit: {
        method: 'POST',
        uri: '/meetings/{meetingId}/channel',
      },
    },
    meetings: {
      list: {
        method: 'GET',
        uri: '/scheduled',
      },
      fetch: {
        method: 'GET',
        uri: '/scheduled/{meetId}',
      },
      create: {
        method: 'POST',
        uri: '/scheduled/create',
      },
      edit: {
        method: 'PUT',
        uri: '/scheduled/{meetId}',
      },
      delete: {
        method: 'DELETE',
        uri: '/scheduled/{meetId}',
      },
    },
    files: {
      list: {
        method: 'GET',
        uri: '/files',
      },
      convert: {
        method: 'POST',
        uri: '/files/{fileId}/convert',
      },
      delete: {
        method: 'DELETE',
        uri: '/files',
      },
      zip: {
        method: 'GET',
        uri: '/files/zip',
      },
    },
  },
};

export default VoxeetApi;
