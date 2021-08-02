import React from "react";
import ReactDOM from "react-dom";
import thunkMiddleware from "redux-thunk";
import { combineReducers, createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";

import {
  reducer as voxeetReducer,
  getUxKitContext,
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
  <Provider store={configureStore()} context={getUxKitContext()}>
    <div>
      <Main settings={settings} />
    </div>
  </Provider>,
  document.getElementById("app")
);


if (module.hot) {
  module.hot.accept();
}