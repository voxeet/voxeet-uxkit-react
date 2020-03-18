import React from "react";
import ReactDOM from "react-dom";
import thunkMidleware from "redux-thunk";
import promiseMiddleware from "redux-promise";
import { combineReducers, createStore, applyMiddleware } from "redux";
import {
  ConferenceRoom,
  VoxeetProvider,
  reducer as voxeetReducer
} from "./VoxeetReactComponents";

const reducers = combineReducers({
  voxeet: voxeetReducer
});

const configureStore = () =>
  createStore(reducers, applyMiddleware(thunkMidleware));

window.addEventListener("storage", function(e) {
  console.log(sessionStorage.getItem("conferenceId"));
});

const conferenceId = window.conferenceId;

const settings = {
  consumerKey: "CONSUMER_KEY",
  consumerSecret: "CONSUMER_SECRET",
  conferenceAlias: "conference_name"
};

const handleOnConnect = () => {
  console.log("Participant connecting");
};

const handleOnLeave = () => {
  console.log("Participant disconnected");
};

var constraints = {
  audio: true,
  video: true
};

var videoRatio = {
  width: 1280,
  height: 720
};

ReactDOM.render(
  <VoxeetProvider store={configureStore()}>
    <div>
      <ConferenceRoom
        isWidget={false}
        autoJoin
        videoRatio={videoRatio}
        kickOnHangUp
        handleOnLeave={handleOnLeave}
        handleOnConnect={handleOnConnect}
        constraints={constraints}
        consumerKey={settings.consumerKey}
        consumerSecret={settings.consumerSecret}
        conferenceAlias={settings.conferenceAlias}
        videoCodec={"H264"}
      />
    </div>
  </VoxeetProvider>,
  document.getElementById("app")
);
