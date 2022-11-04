import React from "react";
import ReactDOM from "react-dom";
import thunkMiddleware from "redux-thunk";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { Provider } from "react-redux";

import { reducer, getUxKitContext } from "./VoxeetReactComponents";

import Main from "./components/main/Main";

const configureStore = () => {
  const reducers = combineReducers({
    voxeet: reducer,
  });

  const composeEnhancers =
    typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // Specify extension’s options like name, actionsDenylist, actionsCreators, serialize...
          actionsBlacklist: [
            "SILENCE",
            "INCREMENT_TIMER",
            "PARTICIPANT_SPEAKING",
            "PARTICIPANT_QUALITY_UPDATED",
          ],
        })
      : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(thunkMiddleware)
    // other store enhancers if any
  );
  return createStore(reducers, enhancer);
};

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

const store = configureStore();
const context = getUxKitContext();

ReactDOM.render(
  <Provider store={store} context={context}>
    <Main settings={settings} />
  </Provider>,
  document.getElementById("app")
);

if (module.hot) {
  module.hot.accept();
}
