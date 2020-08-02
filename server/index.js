const handleMessage = require('./sockets').handleMessage;
const sockjs = require('sockjs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const server = sockjs.createServer();

server.installHandlers(http, {prefix: '/sockjs'});


app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/game/:id', (req, res) => {
  res.sendFile('index.html', {root: path.join(__dirname, '../client/build')});
});

http.listen(80, () => {
  console.log('listening on port 80');
});

let gameRooms = new Map();


let users = new Map();
let sockets = new Map();

server.on('connection', socket => {
  sockets.set(socket, {
    gameRooms: [], name: null
  });
  socket.eventEmit = (event, payload) => {
    socket.write(JSON.stringify({event, payload}));
  };
  socket.on('data', message => {
    handleMessage(socket, JSON.parse(message), users, sockets, gameRooms);
  });
  socket.on('close', () => {
    let name = sockets.get(socket).name;
    if (name) {
      let shouldDeleteUser = false;
      let user = users.get(name);
      if (user.sockets.length === 1) {
        if (user.gameRooms.length > 0) {
          user.timeout = setTimeout(() => {
            users.delete(user);
          }, 1000 * 60 * 3);
          user.isOnline = false;
          user.sockets = [];
        }
        else shouldDeleteUser = true;
      }
      else {
        let socketIdx = user.sockets.indexOf(socket);
        user.sockets.splice(socketIdx, 1);
      }
      for (const room of sockets.get(socket).gameRooms) {
        if (gameRooms.get(room).removeSocket(socket)) {
          let roomIdx = user.gameRooms.indexOf(room);
          user.gameRooms.splice(roomIdx, 1);
        }
      }
      if (shouldDeleteUser) users.delete(name);
    }
    sockets.delete(socket);
  });
});
