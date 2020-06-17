const GameRoom = require('./GameRoom').GameRoom;
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
        gameList.push({...{id}, ...room.getGameRoomData()});
      });
      return socket.eventEmit('gameList', gameList);
    }
    case 'joinGameRoom': {
      let id = parseInt(data.id);
      let room = gameRooms.get(id);
      if (room.gamePass) {
        if (!data.pass) return socket.eventEmit('gameRoomData', {needsGamePass: true});
        if (data.pass === room.gamePass) {
          let userRooms = users.get(sockets.get(socket).name).gameRooms;
          if (!userRooms.includes(id)) userRooms.push(id);
          room.joinedSockets.push(socket);
          return socket.eventEmit('gameRoomData', room.getGameRoomData());
        }
        return socket.eventEmit('gameAccessDenied');
      }
      let userRooms = users.get(sockets.get(socket).name).gameRooms;
      if (!userRooms.includes(id)) userRooms.push(id);
      room.joinedSockets.push(socket);
      return socket.eventEmit('gameRoomData', room.getGameRoomData());
    }
    case 'getGameData': {
      let room = gameRooms.get(parseInt(data));
      return socket.eventEmit('gameData', roomData.gameData);
    }
    case 'getSetupData': {
      let room = gameRooms.get(parseInt(data));
      return socket.eventEmit('gameSetupData', room.setupData);
    }
    case 'createGame': {
      if (!sockets.get(socket).name) return socket.eventEmit('gameCreateFailure', 'You must be logged in to create a game.');
      const newGameId = gameRooms.size + 1;
      let setupData = {
        idleTimer: defaultIdleTimer,
        gamePoint: defaultGamePoint
      };
      let room = new GameRoom(sockets.get(socket).name, setupData);
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
      room.setupData.idleTimer =  isNumber ? parseInt(data.timer) : null;
      room.joinedSockets.forEach(socket => {
        socket.eventEmit('gameSetupData', {idleTimer: room.setupData.idleTimer});
      });
    }
    break;
    case 'gamePoint': {
      let id = parseInt(data.id);
      let room = gameRooms.get(id);
      if (room.host !== sockets.get(socket).name) return;
      room.setupData.gamePoint = parseInt(data.gamePoint);
      room.joinedSockets.forEach(socket => {
        socket.eventEmit('gameSetupData', {gamePoint: room.setupData.gamePoint});
      });
    }
    default: return;
  }
}
