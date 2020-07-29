const config = require('./config');
const cardData = require('./card_data');
const Deck = require('./Deck').Deck;
const Player = require('./Player').Player;

class GameRoom {
  constructor(id, host, gameOptions) {
    this.id = id;
    this.host = host;
    this.gameOptions = gameOptions;
    this.gameData = null;
    this.scoreBoard = {};
    this.joinedSockets = new Map();
    this.gamePass = null;
    this.players = {};
    this.timeouts = {};
  }
  static validateSettings(settings) {
    let {gamePoint, idleTimer} = settings;
    if (!Number.isInteger(gamePoint)) return false;
    if (gamePoint < 0 || gamePoint > 50) return false;
    if (![1, 5, 10, 15, 20, 25].includes(idleTimer) && idleTimer !== null) return false;
    return true;
  }
  joinSocket(name, socket) {
    this.joinedSockets.set(socket, name);
    this.players[name].joinSocket(socket);
  }
  removeSocket(socket) {
    let name = this.joinedSockets.get(socket);
    let player = this.players[name];
    if (player.roomSockets.length === 1) {
      this.addTimeout(name);
      this.joinedSockets.delete(socket);
      player.removeSocket(socket);
      return true;
    }
    this.joinedSockets.delete(socket);
    player.removeSocket(socket);
    return false;
  }
  getGameCardData() {
    return {
      id: this.id,
      creator: this.host,
      users: Object.keys(this.players),
      gamePoint: this.gameOptions.gamePoint
    }
  }
  getGameRoomData(playerName) {
    if (this.gameData) return {
      host: this.host,
      gameOptions: this.gameOptions,
      gameData: this.getPlayerGameData(playerName),
      scoreBoard: this.scoreBoard
    };
    return {
      host: this.host,
      gameOptions: this.gameOptions,
      scoreBoard: this.scoreBoard
    };
  }
  addPlayer(playerName, player) {
    this.scoreBoard[playerName] = 0;
    this.players[playerName] = player;
  }
  getPlayerGameData(playerName) {
    return {
      hand: this.players[playerName].hand,
      czar: this.gameData.czar,
      currentBlackCard: this.gameData.currentBlackCard
    };
  }
  startGame() {
    this.gameData = {
      whiteCards: new Deck(cardData.whiteCards),
      blackCards: new Deck(cardData.blackCards)
    };
    let gameData = this.gameData;
    gameData.whiteCards.shuffle();
    gameData.blackCards.shuffle();
    let playerNames = Object.keys(this.players);
    playerNames.forEach(name => {
      this.players[name].drawCards(gameData.whiteCards, config.cardsInHand);
    });
    gameData.czar = playerNames[Math.floor(Math.random() * playerNames.length)];
    gameData.currentBlackCard = gameData.blackCards.drawCards();
  }
  addTimeout(name) {
    this.timeouts[name] = setTimeout(() => {
      if (this.players[name].roomSockets.length > 0) {
        clearTimeout(this.timeouts[name]);
      }
      else {

      }
    }, 1000 * 60 * 3);
  }
}

exports.GameRoom = GameRoom;