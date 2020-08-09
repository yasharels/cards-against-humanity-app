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
    this.savedPlayerData = {};
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
      this.savedPlayerData[name] = player;
      delete this.players[name];
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
    if (this.savedPlayerData[playerName]) {
      clearTimeout(this.timeouts[playerName]);
      delete this.timeouts[playerName];
      this.players[playerName] = this.savedPlayerData[playerName];
      delete this.savedPlayerData[playerName];
    }
    else {
      this.scoreBoard[playerName] = 0;
      this.players[playerName] = player;
      if (this.gameData) {
        player.drawCards(this.gameData.whiteCards, config.cardsInHand);
        this.gameData.currentWhiteCardsPlayed[playerName] = [];
        if (Object.keys(this.players).length === 0) {
          this.gameData.czar = playerName;
          player.roomSockets.forEach(socket => {
            socket.eventEmit("gameData", {id: this.id, data: {czar: playerName}});
          });
        }
      }
      this.joinedSockets.forEach((_, socket) => {
        socket.eventEmit("gameRoomData", {id: this.id, data: {scoreBoard: this.scoreBoard}});
      });
    }
  }
  removePlayer(playerName) {
    if (!this.gameData) {
      delete this.scoreBoard[playerName];
      if (this.players[playerName]) delete this.players[playerName];
      else delete this.savedPlayerData[playerName];
      this.joinedSockets.forEach((_, socket) => {
        socket.eventEmit("gameRoomData", {id: this.id, data: {scoreBoard: this.scoreBoard}});
      });
    }
    else {
      let czar = this.gameData.czar;
      if (czar === playerName) {
        let names = Object.keys(this.players);
        if (names.indexOf(playerName) === names.length - 1) czar = names[0];
        else czar = names[names.indexOf(czar) + 1];
      }
      delete this.scoreBoard[playerName];
      if (this.players[playerName]) {
        this.gameData.whiteCards.addCards(this.players[playerName].hand).shuffle();
        delete this.players[playerName];
      }
      else {
        this.gameData.whiteCards.addCards(this.savedPlayerData[playerName].hand).shuffle();
        delete this.savedPlayerData[playerName];
      }
      if (Object.keys(this.gameData.currentWhiteCardsPlayed).includes(playerName)) delete this.gameData.currentWhiteCardsPlayed[playerName];
      this.joinedSockets.forEach((_, socket) => {
        socket.eventEmit("gameRoomData", {id: this.id, data: {scoreBoard: this.scoreBoard, gameData: this.gameData}});
      });
    }
  }
  getPlayerGameData(playerName) {
    let names = Object.keys(this.gameData.currentWhiteCardsPlayed);
    let allPlayersPlayed = names.length === Object.keys(this.players).length && names.every(name => this.gameData.currentWhiteCardsPlayed[name].length === this.gameData.currentBlackCard.pick);
    let roundWhiteCards = [];
    if (allPlayersPlayed) names.forEach(name => roundWhiteCards.push(this.gameData.currentWhiteCardsPlayed[name]));
    return {
      hand: this.players[playerName].hand,
      czar: this.gameData.czar,
      currentBlackCard: this.gameData.currentBlackCard,
      roundWhiteCards
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
    gameData.currentWhiteCardsPlayed = {};
    playerNames.forEach(name => {
      if (name !== this.gameData.czar) gameData.currentWhiteCardsPlayed[name] = [];
    });
  }
  addTimeout(name) {
    this.timeouts[name] = setTimeout(() => {
      this.removePlayer(name);
    }, 1000 * 60 * 3);
  }
  submitWhiteCard(playerName, card) {
    let player = this.players[playerName];
    if (!player) return;
    let alreadyPlayed = this.gameData.currentWhiteCardsPlayed[playerName].length === this.gameData.currentBlackCard.pick;
    if (!player.hand.includes(card) || alreadyPlayed || this.gameData.czar === playerName) return;
    this.gameData.currentWhiteCardsPlayed[playerName].push(card);
    player.playCard(card);
    let names = Object.keys(this.gameData.currentWhiteCardsPlayed);
    let allPlayersPlayed = names.length === Object.keys(this.players).length - 1 && names.every(name => this.gameData.currentWhiteCardsPlayed[name].length === this.gameData.currentBlackCard.pick);
    if (allPlayersPlayed) {
      let roundWhiteCards = [];
      names.forEach(name => roundWhiteCards.push(this.gameData.currentWhiteCardsPlayed[name]));
      this.joinedSockets.forEach((_, socket) => {
        socket.eventEmit("gameData", {id: this.id, data: {roundWhiteCards}});
      });
    }
    else {
      let whiteCardsPlayed = {};
      Object.keys(this.gameData.currentWhiteCardsPlayed).forEach(name => {
        let numOfCards = String(this.gameData.currentWhiteCardsPlayed[name].length);
        if (!whiteCardsPlayed[numOfCards]) whiteCardsPlayed[numOfCards] = 1;
        else whiteCardsPlayed[numOfCards]++;
      });
      this.joinedSockets.forEach((_, socket) => {
        socket.eventEmit("gameData", {id: this.id, data: {whiteCardsPlayed}});
      });
    }
  }
  chooseSubmission(choosingPlayer, card) {
    let names = Object.keys(this.gameData.currentWhiteCardsPlayed);
    let cards = [];
    names.forEach(name => this.gameData.currentWhiteCardsPlayed[name].forEach(card => cards.push(card)));
    let allPlayersPlayed = names.length === Object.keys(this.players).length - 1 && names.every(name => this.gameData.currentWhiteCardsPlayed[name].length === this.gameData.currentBlackCard.pick);
    if (this.gameData.czar !== choosingPlayer || !allPlayersPlayed || !cards.includes(card)) return;
    let chosenPlayer;
    for (const name of names) {
      if (this.gameData.currentWhiteCardsPlayed[name].includes(card)) {
        chosenPlayer = name;
        break;
      }
    }
    this.scoreBoard[chosenPlayer]++;
    if (this.scoreBoard[chosenPlayer] === this.gameOptions.gamePoint) this.endGame(chosenPlayer, card);
    else this.nextRound(chosenPlayer, card);
  }
  nextRound(chosenPlayer, card) {
    let gameData = this.gameData;
    let playerNames = Object.keys(this.players);
    let savedNames = Object.keys(this.savedPlayerData);
    if (playerNames.indexOf(gameData.czar) === playerNames.length - 1) gameData.czar = playerNames[0];
    else gameData.czar = playerNames[playerNames.indexOf(gameData.czar) + 1];
    playerNames.forEach(name => {
      let handSize = this.players[name].hand.length;
      this.players[name].drawCards(gameData.whiteCards, config.cardsInHand - handSize);
      if (name !== gameData.czar) this.gameData.currentWhiteCardsPlayed[name] = [];
      else delete this.gameData.currentWhiteCardsPlayed[name];
    });
    savedNames.forEach(name => {
      let handSize = this.savedPlayerData[name].hand.length;
      this.savedPlayerData[name].drawCards(gameData.whiteCards, config.cardsInHand - handSize);
    });
    gameData.currentBlackCard = gameData.blackCards.drawCards();
    this.joinedSockets.forEach((name, socket) => {
      socket.eventEmit("whiteCardChosen", {id: this.id, data: {roundWinner: chosenPlayer, card, nextRoundData: this.getPlayerGameData(name)}});
    });
  }
  endGame(chosenPlayer, card) {
    this.gameData = null;
    Object.keys(this.players).forEach(name => {
      this.players[name].hand = [];
      this.scoreBoard[name] = 0;
    });
    Object.keys(this.savedPlayerData).forEach(name => {
      this.savedPlayerData[name].hand = [];
      this.scoreBoard[name] = 0;
    });
    this.joinedSockets.forEach((name, socket) => {
      socket.eventEmit("whiteCardChosen", {id: this.id, data: {roundWinner: chosenPlayer, card}});
    });
  }
}

exports.GameRoom = GameRoom;
