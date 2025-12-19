const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
  return suits.flatMap(suit => values.map(value => value + suit));
}

function drawCard(deck) {
  const index = Math.floor(Math.random() * deck.length);
  return deck.splice(index, 1)[0];
}

function cardValue(card) {
  if (!card) return 0;
  const value = card.slice(0, card.length - 1);
  const suit = card.slice(-1);

  let numValue;
  if (value === "A") numValue = 14;
  else if (value === "K") numValue = 13;
  else if (value === "Q") numValue = 12;
  else if (value === "J") numValue = 11;
  else numValue = parseInt(value);

  const suitOrder = { "♣": 1, "♦": 2, "♥": 3, "♠": 4 };

  return numValue * 10 + suitOrder[suit];
}

module.exports = { createDeck, drawCard, cardValue };
