import { Game, IllegalMoveError, InvalidMoveError, InvalidOptionsError, Update } from "ts-turnbased";
import * as RS from "random-seed";

import { hasSuit, indexOfCard, isCard, trickWinner, Card, Suit, Rank, STANDARD_DECK } from "./card";
import { isScoringVariant, Scorer, ScoringVariant } from "./scorer";

// Options
export interface OhHellOptions {
  numberOfPlayers: number,
  scoringVariant: ScoringVariant
  // TODO(djmclaugh): Support different hand progressions
  // handProgressionVariant: ???
}

export function sanitizeOptions(options: any): OhHellOptions {
  if (typeof options.numberOfPlayers != "number") {
    throw new InvalidOptionsError(options, "numberOfPlayers must be a number");
  }
  if (options.numberOfPlayers < 3 || options.numberOfPlayers >= 6) {
    throw new InvalidOptionsError(options, "only 3, 4, and 5 player games are currently supported");
  }
  if (typeof options.scoringVariant != "string" || !isScoringVariant(options.scoringVariant)) {
    throw new InvalidOptionsError(options, "Invalid scoring variant");
  }
  let sanitizedOptions: OhHellOptions = {
    numberOfPlayers: Math.floor(options.numberOfPlayers),
    scoringVariant: options.scoringVariant
  }
  return sanitizedOptions;
}

// Moves
export type OhHellMove = BidMove | CardMove

export interface BidMove {
  bid: number
}

export interface CardMove {
  card: Card
}

export function isBidMove(move: any): move is BidMove {
  if (typeof move != "object") {
    return false;
  }
  return typeof move.bid == "number";
}

export function isCardMove(move: any): move is CardMove {
  if (typeof move != "object") {
    return false;
  }
  return isCard(move.card);
}

export function sanitizeMove(move: any): OhHellMove {
  if (isBidMove(move)) {
    if (move.bid < 0) {
      throw new InvalidMoveError(move, "bid must be a non-negative integer");
    }
    return {
      bid: Math.floor(move.bid)
    }
  } else if (isCardMove(move)) {
    return {
      card: move.card
    }
  } else {
    throw new InvalidMoveError(move, "move must either be a bid move or a card move");
  }
}

// Updates
export interface OhHellPublicInfo {
  // Populated on every non-bid turn
  cardPlayed?: Card,
  // Populated at the end of every trick
  trickWinner?: number,
  // Populated at the end of every hand
  points?: Array<number>,
  // Populated on every bid turn
  bids?: Array<number>
  // Populated at the begining of every hand
  newHandInfo?: NewHandInfo
}

export interface NewHandInfo {
  revealedCard: Card,
  dealer: number
}

// The only hidden information are the cards that the player has been dealt.
export type OhHellPrivateInfo = Array<Card>;

export type OhHellUpdate = Update<OhHellPublicInfo, OhHellPrivateInfo>;

// Utility
function shuffledCopy<T>(deck: Array<T>, randomNumberGenerator: RS.RandomSeed): Array<T> {
  let copy: Array<T> = deck.concat();
  let shuffled: Array<T> = [];
  while (copy.length > 0) {
    let index: number = randomNumberGenerator.range(copy.length);
    shuffled.push(copy[index]);
    copy.splice(index, 1);
  }
  return shuffled;
}

export class OhHell extends Game<OhHellOptions, OhHellMove, OhHellPublicInfo, OhHellPrivateInfo> {

  private static numberOfCardsPerPlayer(round: number, numberOfPlayers: number): number {
    let totalNumberOfCard: number = STANDARD_DECK.length;
    let middleRound: number = Math.floor((totalNumberOfCard - 0.1) / numberOfPlayers);
    return round <= middleRound ? round : 2 * middleRound - round;
  }

  private randomNumberGenerator: RS.RandomSeed;
  private hands: Array<Array<Card>>;
  private points: Array<number>;
  private bids: Array<number>;
  private tricks: Array<number>;
  private currentTrick: Array<Card>;
  private trickStarter: number;
  private revealedCard: Card;
  private currentTrump: Suit;
  private dealer: number;
  private toPlay: number;
  private round: number;
  private scorer: Scorer;

  constructor(options: OhHellOptions) {
    super(options);
    this.scorer = new Scorer(options.scoringVariant);
  }

  private nextPlayer(player: number): number {
    return (player + 1) % this.numberOfPlayers;
  }

  private startNewRound(): void {
    this.dealer = this.nextPlayer(this.dealer);
    this.round += 1;
    this.tricks = [];
    this.hands = [];
    this.bids = [];
    for (let i: number = 0; i < this.numberOfPlayers; ++i) {
      this.tricks.push(0);
      this.hands.push([]);
    }
    let shuffledDeck: Array<Card> = shuffledCopy(STANDARD_DECK, this.randomNumberGenerator);
    let numCards: number = OhHell.numberOfCardsPerPlayer(this.round, this.numberOfPlayers);
    for (let i: number = 0; i < numCards; ++i) {
      for (let p: number = 0; p < this.numberOfPlayers; ++p) {
        this.hands[p].push(shuffledDeck.pop());
      }
    }
    this.revealedCard = shuffledDeck.pop();
    this.currentTrump = this.revealedCard.suit;
  }

  private startNewTrick(player: number): void {
    this.trickStarter = player;
    this.toPlay = player;
    this.currentTrick = [];
  }

  private everyone(): Array<number> {
    let array: Array<number> = [];
    for (let i = 0; i < this.numberOfPlayers; ++i) {
      array.push(i);
    }
    return array;
  }

  private addNewHandInfo(update: OhHellUpdate): void {
    update.publicInfo.newHandInfo = {
      revealedCard: this.revealedCard,
      dealer: this.dealer
    };
    update.privateInfo = this.hands;
  }

  private removeCardFromPlayer(card: Card, player: number): void {
    let hand: Array<Card> = this.hands[player];
    let index: number = indexOfCard(hand, card);
    if (index >= 0) {
      hand.splice(index, 1);
    }
  }

  // Subclass Overrides
  protected numberOfPlayersForOptions(options: OhHellOptions) {
    return options.numberOfPlayers;
  }

  protected sanitizeOptions(options: any): OhHellOptions {
    return sanitizeOptions(options);
  }

  protected sanitizeMove(move:any): OhHellMove {
    return sanitizeMove(move);
  }

  protected assertMoveIsLegal(move: OhHellMove, player: number): void {
    if (this.bids.length == 0 && !isBidMove(move)) {
      throw new IllegalMoveError(move, player, "Expecting a bid");
    }
    if (this.bids.length != 0 && !isCardMove(move)) {
      throw new IllegalMoveError(move, player, "Expecting to play a card");
    }
    if (isBidMove(move)) {
      if (move.bid > this.hands[0].length) {
        throw new IllegalMoveError(
            move, player, "Cannot bid more than the number of cards in hand.");
      }
    }
    if (isCardMove(move)) {
      if (indexOfCard(this.hands[player], move.card) == -1) {
        throw new IllegalMoveError(move, player, "Specified card not in hand");
      }
      if (this.currentTrick.length > 0) {
        let leadingSuit: Suit = this.currentTrick[0].suit;
        if (move.card.suit != leadingSuit && hasSuit(this.hands[player], leadingSuit)) {
          throw new IllegalMoveError(move, player, "You must follow suit");
        }
      }
    }
  }

  protected initialize(seed: string): OhHellUpdate {
    this.randomNumberGenerator = RS.create(seed);
    this.dealer = this.randomNumberGenerator.range(this.numberOfPlayers);
    this.round = 0;
    this.points = [];
    for (let i: number = 0; i < this.numberOfPlayers; ++i) {
      this.points.push(0);
    }
    this.startNewRound();
    let update: OhHellUpdate = {
      publicInfo: {},
      toPlay: this.everyone()
    }
    this.addNewHandInfo(update);
    return update;
  }

  protected processTurn(moves: Map<number, OhHellMove>): OhHellUpdate {
    let update: OhHellUpdate = {
      publicInfo: {},
      toPlay: []
    };
    if (this.bids.length == 0) {
      for (let i = 0; i < this.numberOfPlayers; ++ i) {
        this.bids.push((<BidMove>moves.get(i)).bid);
      }
      this.toPlay = this.nextPlayer(this.dealer);
      this.startNewTrick(this.nextPlayer(this.dealer));
      update.publicInfo.bids = this.bids;
      update.toPlay = [ this.toPlay ];
    } else {
      let card: Card = (<CardMove>moves.get(this.toPlay)).card;
      update.publicInfo.cardPlayed = card;
      this.currentTrick.push(card);
      this.removeCardFromPlayer(card, this.toPlay);
      if (this.currentTrick.length == this.numberOfPlayers) {
        let winner: number = (trickWinner(this.currentTrick, this.currentTrump) + this.trickStarter)
            % this.numberOfPlayers;
        update.publicInfo.trickWinner = winner;
        this.tricks[winner] += 1;
        if (this.hands[0].length == 0) {
          this.scorer.updateScores(this.bids, this.tricks, this.points);
          update.publicInfo.points = this.points;
          this.startNewRound();
          if (this.hands[0].length > 0) {
            this.addNewHandInfo(update);
            update.toPlay = this.everyone();
          } else {
            // The game is over
            update.toPlay = [];
          }
        } else {
          this.startNewTrick(winner);
          update.toPlay = [ winner ];
        }
      } else {
        this.toPlay = this.nextPlayer(this.toPlay);
        update.toPlay = [ this.toPlay ];
      }
    }
    return update;
  }

  protected getWinners(): Array<number> {
    if (OhHell.numberOfCardsPerPlayer(this.round, this.numberOfPlayers) == 0) {
      let highestScore: number = this.points[0];
      let winners: Array<number> = [ 0 ];
      for (let i = 1; i < this.numberOfPlayers; ++i) {
        if (this.points[i] > highestScore) {
          highestScore = this.points[i];
          winners = [];
        }
        if (this.points[i] == highestScore) {
          winners.push(i);
        }
      }
      return winners;
    } else {
      return null;
    }
  }
}
