import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './containers/App';
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
  let name = localStorage.getItem("username");
  if (name) sock.send(JSON.stringify({event: "login", payload: name}));
};

sock.messageHandlers = {};

sock.on = (event, fct) => {
  sock.messageHandlers[event] = fct;
}
sock.off = event => {
  delete sock.messageHandlers[event];
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
