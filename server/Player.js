class Player {
  constructor() {
    this.hand = [];
  }
  drawCards(deck, amount) {
    for (let i = 0; i < amount; i++) {
      this.hand.push(deck.drawCards());
    }
  }
}

exports.Player = Player;
