import VoxeetSDK from "@voxeet/voxeet-web-sdk";

export const Types = {
  START_ACTIVE_SPEAKER: "START_ACTIVE_SPEAKER",
  STOP_ACTIVE_SPEAKER: "STOP_ACTIVE_SPEAKER",
  PARTICIPANT_SPEAKING: "PARTICIPANT_SPEAKING",
  DISABLE_FORCE_ACTIVE_SPEAKER: "DISABLE_FORCE_ACTIVE_SPEAKER",
  FORCE_ACTIVE_SPEAKER: "FORCE_ACTIVE_SPEAKER",
  SILENCE: "SILENCE",
};

export class Actions {
  static startActiveSpeaker() {
    return (dispatch, getState) => {
      const {
        voxeet: { participants },
      } = getState();
      let interval = participants.interval;
      if (!interval) {
        interval = setInterval(() => {
          const {
            voxeet: { participants, activeSpeaker },
          } = getState();
          if (participants.screenShareEnabled) return;
          if (!activeSpeaker.forceActiveUserEnabled) {
            for (let participant of participants.participants) {
              if (participant.participant_id)
                VoxeetSDK.conference.isSpeaking(
                  VoxeetSDK.conference.participants.get(
                    participant.participant_id
                  ),
                  (status) => {
                    participant.isSpeaking = status;
                  }
                );
            }
            const participantsConnected = participants.participants.filter(
              (p) => p.isConnected
            );
            const activeParticipantConnected = activeSpeaker.activeSpeaker?
                participantsConnected.find(participant =>
                  activeSpeaker.activeSpeaker.participant_id === participant.participant_id
                ):
                false;
            const participant =
              participantsConnected.length === 1
                ? participantsConnected[0]
                : participantsConnected.find((p) => p.isSpeaking) ||
                  null;
            if(participant) {
              // Set new active speaker if there is none
              if(!activeParticipantConnected || !activeSpeaker.activeSpeaker || !activeSpeaker.activeSpeakerSince
                  || activeSpeaker.activeSpeaker.participant_id == participant.participant_id) {
                if(activeSpeaker.activeSpeaker && activeSpeaker.activeSpeaker.participant_id === participant.participant_id) {
                  dispatch({
                    type: Types.PARTICIPANT_SPEAKING,
                    payload: { participant },
                  });
                } else {
                  // console.log('New active speaker', participant);
                  // console.log('!activeParticipantConnected, !activeSpeaker.activeSpeaker, !activeSpeaker.activeSpeakerSince',
                  //    !activeParticipantConnected, !activeSpeaker.activeSpeaker, !activeSpeaker.activeSpeakerSince);
                  dispatch({
                    type: Types.PARTICIPANT_SPEAKING,
                    payload: { participant, activeSpeakerSince: Date.now() },
                  });
                }
              }
              // Set new active speaker
              else if(activeSpeaker.activeSpeaker.participant_id != participant.participant_id &&
                  ( !activeSpeaker.activeSpeakerSince || Date.now()-activeSpeaker.activeSpeakerSince>3000) ) {
                // console.log('Switch to next active speaker', participant);
                dispatch({
                  type: Types.PARTICIPANT_SPEAKING,
                  payload: { participant, activeSpeakerSince: Date.now() },
                });
              } //else {
                // console.log('Delay next active speaker', participant);
              //}
            } else {
              //console.log('No speakers');
              dispatch(this.startSilence())
            }
          }
        }, 500);
      }

      dispatch({
        type: Types.START_ACTIVE_SPEAKER,
        payload: {
          interval,
        },
      });
    };
  }

  static stopActiveSpeaker() {
    return {
      type: Types.STOP_ACTIVE_SPEAKER,
    };
  }

  static startSilence() {
    return {
      type: Types.SILENCE,
    };
  }

  static disableForceActiveSpeaker() {
    return {
      type: Types.DISABLE_FORCE_ACTIVE_SPEAKER,
    };
  }

  static forceActiveSpeaker(participant) {
    return {
      type: Types.FORCE_ACTIVE_SPEAKER,
      payload: { participant },
    };
  }
}
