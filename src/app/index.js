import React from "react";
import ReactDOM from "react-dom";
import thunkMiddleware from "redux-thunk";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { Provider } from "react-redux";

import {
  reducer as voxeetReducer,
  getUxKitContext,
} from "./VoxeetReactComponents";

import Main from "./components/main/Main";

const configureStore = () => {
  const reducers = combineReducers({
    voxeet: voxeetReducer,
  });

  const composeEnhancers =
    typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // Specify extension’s options like name, actionsDenylist, actionsCreators, serialize...
          actionsBlacklist: ["SILENCE", "INCREMENT_TIMER"],
        })
      : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(thunkMiddleware)
    // other store enhancers if any
  );
  return createStore(reducers, enhancer);
};

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