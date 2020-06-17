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
    for (const room of sockets.get(socket).gameRooms) gameRooms.get(room).removeSocket(socket);
    let user = sockets.get(socket).name;
    if (user) {
      if (users.get(user).sockets.length === 1) users.delete(user);
      else {
        let index = users.get(user).sockets.indexOf(socket);
        users.get(user).sockets.splice(index, 1);
      }
    }
    sockets.delete(socket);
  });
});
