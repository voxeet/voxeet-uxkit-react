import React from "react";
import ReactDOM from "react-dom";
import thunkMiddleware from "redux-thunk";
import { combineReducers, createStore, applyMiddleware } from "redux";

import {
  VoxeetProvider,
  reducer as voxeetReducer,
} from "./VoxeetReactComponents";
import Main from "./components/main/Main";

const reducers = combineReducers({
  voxeet: voxeetReducer,
});

const configureStore = () =>
  createStore(reducers, applyMiddleware(thunkMiddleware));

window.addEventListener("storage", function (e) {
  console.log(sessionStorage.getItem("conferenceId"));
});

const settings = {
  authentication: {
    credentials: {
      key: "CONSUMER_KEY",
      secret: "CONSUMER_SECRET",
    },
    serverUrl: "AUTHENTICATION_SERVER_URL",
  },
  conferenceAlias: "CONFERENCE_NAME",
};

ReactDOM.render(
  <VoxeetProvider store={configureStore()}>
    <div>
      <Main settings={settings} />
    </div>
  </VoxeetProvider>,
  document.getElementById("app")
);
