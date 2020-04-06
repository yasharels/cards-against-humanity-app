exports.handleMessage = (socket, message, users, namedSockets, gameData) => {
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
      return socket.eventEmit('gameList', gameData);
    }
    case 'getGameState': {
      let gameState = gameData.find(game => game.id === parseInt(data));
      return socket.eventEmit('gameState', gameState);
    }
    default: return;
  }
}
