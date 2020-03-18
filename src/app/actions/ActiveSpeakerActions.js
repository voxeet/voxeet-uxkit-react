import VoxeetSDK from "@voxeet/voxeet-web-sdk";

export const Types = {
  START_ACTIVE_SPEAKER: "START_ACTIVE_SPEAKER",
  STOP_ACTIVE_SPEAKER: "STOP_ACTIVE_SPEAKER",
  PARTICIPANT_SPEAKING: "PARTICIPANT_SPEAKING",
  DISABLE_FORCE_ACTIVE_SPEAKER: "DISABLE_FORCE_ACTIVE_SPEAKER",
  FORCE_ACTIVE_SPEAKER: "FORCE_ACTIVE_SPEAKER"
};

export class Actions {
  static startActiveSpeaker() {
    return (dispatch, getState) => {
      const {
        voxeet: { participants }
      } = getState();
      let interval = participants.interval;
      if (!interval) {
        interval = setInterval(() => {
          const {
            voxeet: { participants, activeSpeaker }
          } = getState();
          if (participants.screenShareEnabled) return;
          if (!activeSpeaker.forceActiveUserEnabled) {
            for (let participant of participants.participants) {
              if (participant.participant_id)
                VoxeetSDK.conference.isSpeaking(
                  participant.participant_id,
                  status => {
                    participant.isSpeaking = status;
                  }
                );
            }
            const participantsConnected = participants.participants.filter(
              p => p.isConnected
            );
            const participant =
              participantsConnected.length === 1
                ? participantsConnected[0]
                : participants.participants.find(p => p.isSpeaking) ||
                  activeSpeaker.activeSpeaker;

            if (activeSpeaker.activeSpeaker != participant) {
              dispatch({
                type: Types.PARTICIPANT_SPEAKING,
                payload: { participant }
              });
            }
          }
        }, 500);
      }

      dispatch({
        type: Types.START_ACTIVE_SPEAKER,
        payload: {
          interval
        }
      });
    };
  }

  static stopActiveSpeaker() {
    return {
      type: Types.STOP_ACTIVE_SPEAKER
    };
  }

  static disableForceActiveSpeaker() {
    return {
      type: Types.DISABLE_FORCE_ACTIVE_SPEAKER
    };
  }

  static forceActiveSpeaker(participant) {
    return {
      type: Types.FORCE_ACTIVE_SPEAKER,
      payload: { participant }
    };
  }
}
