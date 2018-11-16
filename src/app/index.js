import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import thunkMidleware from 'redux-thunk'
import promiseMiddleware from 'redux-promise'
import { combineReducers, createStore, applyMiddleware } from 'redux'

import { ConferenceRoom, reducer as voxeetReducer } from './VoxeetReactComponents'
import StatusButton from './components/statusButton/StatusButton';
import ReplayButton from './components/statusButton/ReplayButton';
import StatusCard from './components/statusCard/StatusCard';

const reducers = combineReducers({
  voxeet: voxeetReducer
})


const configureStore = () => createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunkMidleware, promiseMiddleware)
)

window.addEventListener('storage', function(e) {
  console.log(sessionStorage.getItem('conferenceId'))
});

const conferenceId = window.conferenceId

const settings = {
  consumerKey: 'CONSUMER_KEY',
  consumerSecret: 'CONSUMER_SECRET',
  conferenceAlias: 'conference_name'
}

const handleOnConnect = () => {
  console.log("Participant connecting")
}

const handleOnLeave = () => {
  console.log("Participant disconnected")
}

var constraints = {
  audio: true,
  video: true
};

var videoRatio = {
  width: 1280,
  height: 720
}

ReactDOM.render(
  <Provider store={configureStore()}>
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
  </Provider>,
  document.getElementById('app')
)
