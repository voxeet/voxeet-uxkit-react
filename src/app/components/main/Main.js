import React, { useEffect, useState, Component } from "react";

import { ConferenceRoom } from "../../VoxeetReactComponents";

const constraints = {
  audio: true,
  video: true,
};

const videoRatio = {
  width: 1280,
  height: 720,
};

const Main = ({ settings }) => {
  const [token, setToken] = useState();
  const [error, setError] = useState();

  function getToken() {
    if (settings.authentication.serverUrl === "") return;

    const headers = new Headers();

    const params = {
      method: "GET",
      headers,
      mode: "cors",
      cache: "default",
    };

    fetch(settings.authentication.serverUrl, params)
      .then((response) => response.json().then((json) => ({ json, response })))
      .then(({ json, response }) => {
        if (!response.ok) {
          return Promise.reject(json);
        } else if (response.status >= 200 && response.status <= 299) {
          return json;
        }
        return Promise.reject(json);
      })
      .then(
        ({ access_token }) => {
          setToken(access_token);
        },
        (error) => {
          setError(error.message || "Something bad happened");
        }
      );
  }

  useEffect(() => {
    getToken();
  }, []);

  return settings.authentication.serverUrl !== "" ? (
    !!token && !error && (
      <ConferenceRoom
        isWidget={false}
        autoJoin
        videoRatio={videoRatio}
        kickOnHangUp
        handleOnLeave={() => console.log("participant disconnected")}
        handleOnConnect={() => console.log("participant connecting")}
        constraints={constraints}
        conferenceAlias={settings.conferenceAlias}
        videoCodec={"H264"}
        oauthToken={token && token}
        refreshTokenCallback={token && getToken}
      />
    )
  ) : (
    <ConferenceRoom
      isWidget={false}
      autoJoin
      videoRatio={videoRatio}
      kickOnHangUp
      handleOnLeave={() => console.log("participant disconnected")}
      handleOnConnect={() => console.log("participant connecting")}
      constraints={constraints}
      conferenceAlias={settings.conferenceAlias}
      videoCodec={"H264"}
      consumerKey={settings.authentication.credentials.key}
      consumerSecret={settings.authentication.credentials.secret}
    />
  );
};

export default Main;
