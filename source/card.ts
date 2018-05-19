// Jack = 11, Queen = 12, King = 13, Ace = 14
export type Rank = 2|3|4|5|6|7|8|9|10|11|12|13|14;
export type Suit = "H"|"C"|"S"|"D";

export interface Card {
  rank: Rank,
  suit: Suit
}

export const STANDARD_DECK: Array<Card> = [];
for (let i: number = 2; i <= 14; ++i) {
  STANDARD_DECK.push({rank: <Rank>i, suit: "H"});
  STANDARD_DECK.push({rank: <Rank>i, suit: "C"});
  STANDARD_DECK.push({rank: <Rank>i, suit: "S"});
  STANDARD_DECK.push({rank: <Rank>i, suit: "D"});
}

export function isCard(card: any): card is Card {
  if (typeof card != "object") {
    return false;
  }
  let hasValidRank: boolean =
      typeof card.rank == "number" && card.rank >= 2 && card.rank <= 14 && card.rank == Math.floor(card.rank)
  let hasValidSuit: boolean =
      card.suit == "H" || card.suit == "C" || card.suit == "S" || card.suit == "D";
  return hasValidRank && hasValidSuit;
}

export function trickWinner(trick: Array<Card>, trump: Suit) {
  let winner: number = 0;
  let winnerCard: Card = trick[0];
  for (let i = 1; i < trick.length; ++i) {
    let card = trick[i];
    if (card.suit == winnerCard.suit) {
      if (card.rank > winnerCard.rank) {
        winner = i;
        winnerCard = card;
      }
    } else if (card.suit == trump) {
      winner = i;
      winnerCard = card;
    }
  }
  return winner;
}

export function hasSuit(hand: Array<Card>, suit: Suit): boolean {
  for (let card of hand) {
    if (card.suit == suit) {
      return true;
    }
  }
  return false;
}

export function indexOfCard(hand: Array<Card>, card: Card): number {
  for (let i: number = 0; i < hand.length; ++i) {
    let cardInHand: Card = hand[i];
    if (card.suit == cardInHand.suit && card.rank == cardInHand.rank) {
      return i;
    }
  }
  return -1;
}
