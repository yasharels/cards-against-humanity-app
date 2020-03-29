import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
import sockjsClient from 'sockjs-client';

// URL for the app's SockJS server - localhost by default
const sockjsURL = 'http://localhost/sockjs';

const sock = new sockjsClient(sockjsURL);

ReactDOM.render(
  <React.StrictMode>
    <App socket={sock}/>
  </React.StrictMode>,
  document.getElementById('root')
);
