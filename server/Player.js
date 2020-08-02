class Player {
  constructor() {
    this.hand = [];
    this.roomSockets = [];
  }
  drawCards(deck, amount) {
    for (let i = 0; i < amount; i++) {
      this.hand.push(deck.drawCards());
    }
  }
  playCard(card) {
      let index = this.hand.indexOf(card);
      this.hand.splice(index, 1);
  }
  removeSocket(socket) {
    let index = this.roomSockets.indexOf(socket);
    this.roomSockets.splice(index, 1);
  }
  joinSocket(socket) {
    this.roomSockets.push(socket);
  }
}

exports.Player = Player;
