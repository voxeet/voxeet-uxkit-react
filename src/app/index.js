import React from "react";
import ReactDOM from "react-dom";
import thunkMidleware from "redux-thunk";
import { combineReducers, createStore, applyMiddleware } from "redux";
import {
  VoxeetProvider,
  reducer as voxeetReducer
} from "./VoxeetReactComponents";
import Main from "./components/main/Main";

const reducers = combineReducers({
  voxeet: voxeetReducer
});

const configureStore = () =>
  createStore(reducers, applyMiddleware(thunkMidleware));

window.addEventListener("storage", function(e) {
  console.log(sessionStorage.getItem("conferenceId"));
});

ReactDOM.render(
  <VoxeetProvider store={configureStore()}>
    <div>
    <Main/>
    </div>
  </VoxeetProvider>,
  document.getElementById("app")
);
