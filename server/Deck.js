class Deck {
  constructor(cards) {
    this.cards = cards;
  }
  drawCards(amount) {
    if (!amount) return this.cards.shift();
    let drawnCards = [];
    for (let i = 0; i < amount; i++) {
      drawnCards.push(this.cards.shift());
    }
    return drawnCards;
  }
  addCards(cards) {
    cards.forEach(card => this.cards.push(card));
    return this;
  }
  shuffle() {
    let cards = this.cards;
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      const temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }
  }
}

exports.Deck = Deck;
