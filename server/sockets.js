const {defaultGamePoint, defaultIdleTimer} = require('./config');

exports.handleMessage = (socket, message, users, namedSockets, gameRoomData) => {
  let data = message.payload;
  switch (message.event) {
    case 'login': {
      let user = users.get(data);
      if (!user) {
        users.set(data, {sockets: [socket], Ip: socket.remoteAddress});
        namedSockets.set(socket, data);
        return socket.eventEmit('loginSuccess', data);
      }
      if (user.Ip !== socket.remoteAddress) {
        return socket.eventEmit('loginFailure', `${data} is already in use. Please pick another name.`);
      }
      users.set(data, {sockets: user.sockets.concat([socket]), Ip: socket.remoteAddress});
      namedSockets.set(socket, data);
      return socket.eventEmit('loginSuccess', data);
    }
    case 'logout': {
      if (namedSockets.has(socket)) {
        let name = namedSockets.get(socket);
        let userSockets = users.get(name).sockets;
        if (userSockets.length === 1) users.delete(name);
        else {
          let index = userSockets.indexOf(socket);
          userSockets.splice(index, 1);
        }
        namedSockets.delete(socket);
        return socket.eventEmit('logoutSuccess');
      }
      return socket.eventEmit('logoutFailure', 'You are not currently logged in.');
    }
    case 'getGameList': {
      return socket.eventEmit('gameList', gameRoomData);
    }
    case 'joinGameRoom': {
      let roomData = gameRoomData.find(room => room.id === parseInt(data));
      roomData = Object.assign({}, roomData);
      delete roomData.id;
      return socket.eventEmit('gameRoomData', roomData);
    }
    case 'getGameData': {
      let roomData = gameRoomData.find(room => room.id === parseInt(data));
      return socket.eventEmit('gameData', roomData.gameData);
    }
    case 'getSetupData': {
      let roomData = gameRoomData.find(room => room.id === parseInt(data));
      return socket.eventEmit('gameSetupData', roomData.setupData);
    }
    case 'createGame': {
      if (!namedSockets.has(socket)) return socket.eventEmit('gameCreateFailure', 'You must be logged in to create a game.');
      const newGameId = gameRoomData.length;
      const newGameRoomData = {
        id: newGameId,
        host: namedSockets.get(socket),
        setupData: {
          idleTimer: defaultIdleTimer,
          gamePoint: defaultGamePoint,
          gamePass: null
        },
        scoreBoard: {}
      };
      gameRoomData.push(newGameRoomData);
      return socket.eventEmit('gameRedirect', newGameId);
    }
    default: return;
  }
}
