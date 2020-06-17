class GameRoom {
  constructor(host, setupData) {
    this.host = host;
    this.setupData = setupData;
    this.gameData = null;
    this.scoreBoard = {};
    this.joinedSockets = [];
    this.gamePass = null;
  }
  joinSocket(socket) {
    this.joinedSockets.push(socket);
  }
  removeSocket(socket) {
    let socketIdx = this.joinedSockets.indexOf(socket);
    this.joinedSockets.splice(socketIdx, 1);
  }
  getGameRoomData() {
    if (this.setupData) return {
      host: this.host,
      setupData: this.setupData,
      scoreBoard: this.scoreBoard
    };
    return {
      host: this.host,
      gameData: this.gameData,
      scoreBoard: this.scoreBoard
    };
  }
}

exports.GameRoom = GameRoom;
