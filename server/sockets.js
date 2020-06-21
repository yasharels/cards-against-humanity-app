const GameRoom = require('./GameRoom').GameRoom;
const Player = require("./Player").Player;
const {defaultGamePoint, defaultIdleTimer} = require('./config');

exports.handleMessage = (socket, message, users, sockets, gameRooms) => {
  let data = message.payload;
  switch (message.event) {
    case 'login': {
      let user = users.get(data);
      if (!user) {
        users.set(data, {sockets: [socket], Ip: socket.remoteAddress, gameRooms: []});
        sockets.get(socket).name = data;
        return socket.eventEmit('loginSuccess', data);
      }
      if (user.Ip !== socket.remoteAddress) {
        return socket.eventEmit('loginFailure', `${data} is already in use. Please pick another name.`);
      }
      user.sockets.push(socket);
      sockets.get(socket).name = data;
      return socket.eventEmit('loginSuccess', data);
    }
    case 'logout': {
      if (sockets.get(socket).name) {
        let name = sockets.get(socket).name
        let userSockets = users.get(name).sockets;
        if (userSockets.length === 1) users.delete(name);
        else {
          let index = userSockets.indexOf(socket);
          userSockets.splice(index, 1);
        }
        sockets.get(socket).name = null;
        return socket.eventEmit('logoutSuccess');
      }
      return socket.eventEmit('logoutFailure', 'You are not currently logged in.');
    }
    case 'getGameList': {
      let gameList = [];
      gameRooms.forEach((room, id) => {
        gameList.push({...{id}, ...room.getGameCardData()});
      });
      return socket.eventEmit('gameList', gameList);
    }
    case 'joinGameRoom': {
      let id = parseInt(data.id);
      let room = gameRooms.get(id);
      if (room.gamePass) {
        if (!data.pass) return socket.eventEmit('gameRoomData', {needsGamePass: true});
        if (data.pass === room.gamePass) {
          sockets.get(socket).gameRooms.push(id);
          let userRooms = users.get(sockets.get(socket).name).gameRooms;
          if (!userRooms.includes(id)) {
            userRooms.push(id);
            room.addPlayer(sockets.get(socket).name, new Player());
          }
          room.joinSocket(socket);
          return socket.eventEmit('gameRoomData', room.getGameRoomData(sockets.get(socket).name));
        }
        return socket.eventEmit('gameAccessDenied');
      }
      sockets.get(socket).gameRooms.push(id);
      let name = sockets.get(socket).name;
      let userRooms = users.get(name).gameRooms;
      if (!userRooms.includes(id)) {
        userRooms.push(id);
        room.addPlayer(name, new Player());
      }
      room.joinSocket(socket);
      return socket.eventEmit('gameRoomData', room.getGameRoomData(name));
    }
    case 'getGameData': {
      let room = gameRooms.get(parseInt(data));
      let name = sockets.get(socket).name;
      return socket.eventEmit('gameData', room.getPlayerGameData(name));
    }
    case 'getGameOptions': {
      let room = gameRooms.get(parseInt(data));
      return socket.eventEmit('gameOptions', room.gameOptions);
    }
    case 'createGame': {
      if (!sockets.get(socket).name) return socket.eventEmit('gameCreateFailure', 'You must be logged in to create a game.');
      const newGameId = gameRooms.size + 1;
      let gameOptions = {
        idleTimer: defaultIdleTimer,
        gamePoint: defaultGamePoint
      };
      let room = new GameRoom(newGameId, sockets.get(socket).name, gameOptions);
      gameRooms.set(newGameId, room);
      return socket.eventEmit('gameRedirect', newGameId);
    }
    case 'setGamePass': {
      let {id, pass} = data;
      let room = gameRooms.get(parseInt(id));
      if (sockets.get(socket).name !== room.host) return;
      else room.gamePass = pass;
    }
    break;
    case 'idleTimer': {
      let id = parseInt(data.id);
      let room = gameRooms.get(id);
      if (room.host !== sockets.get(socket).name) return;
      let isNumber = !isNaN(parseInt(data.timer));
      room.gameOptions.idleTimer =  isNumber ? parseInt(data.timer) : null;
      room.joinedSockets.forEach(socket => {
        socket.eventEmit('gameOptions', {idleTimer: room.gameOptions.idleTimer});
      });
    }
    break;
    case 'gamePoint': {
      let id = parseInt(data.id);
      let room = gameRooms.get(id);
      if (room.host !== sockets.get(socket).name) return;
      room.gameOptions.gamePoint = parseInt(data.gamePoint);
      room.joinedSockets.forEach(socket => {
        socket.eventEmit('gameOptions', {gamePoint: room.gameOptions.gamePoint});
      });
    }
    break;
    case 'startGame': {
      let id = parseInt(data.id);
      let room = gameRooms.get(id);
      if (sockets.get(socket).name === room.host) {
        if (!GameRoom.validateSettings(data.gameSettings) || Object.keys(room.scoreBoard).length < 3) return;
        room.gamePoint = parseInt(data.gamePoint);
        room.idleTimer = parseInt(data.idleTimer);
        room.startGame();
        room.joinedSockets.forEach(socket => {
          let name = sockets.get(socket).name;
          socket.eventEmit('gameStart', room.getPlayerGameData(name));
        });
      }
    }
    break;
    default: return;
  }
}
