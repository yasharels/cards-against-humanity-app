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

let gameRoomData = [];


let users = new Map();
let namedSockets = new Map();

server.on('connection', socket => {
  socket.eventEmit = (event, payload) => {
    socket.write(JSON.stringify({event, payload}));
  };
  socket.on('data', message => {
    handleMessage(socket, JSON.parse(message), users, namedSockets, gameRoomData);
  });
});
