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

const store = createStore(rootReducer);

sock.onopen = () => {
  store.dispatch({type: "SOCKET_CONNECTED"});
};

sock.messageHandlers = {};

sock.on = (event, fct) => {
  sock.messageHandlers[event] = fct;
}
sock.onmessage = message => {
  let data = JSON.parse(message.data);
  let event = data.event;
  if (!sock.messageHandlers[event]) return;
  sock.messageHandlers[event](data.payload);
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App socket={sock}/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
