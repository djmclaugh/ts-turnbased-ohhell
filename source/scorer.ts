// https://en.wikipedia.org/wiki/Oh_Hell#Scoring
export type ScoringVariant = "BASIC"|"EXACT";
export function isScoringVariant(text: string): text is ScoringVariant {
  return text == "BASIC" || text == "EXACT";
}

/**
 * Class that takes in a players bid and number of tricks taken and returns how many points they
 * should get.
 */
export class Scorer {
  constructor(private variant: ScoringVariant) {}

  public score(bid: number, tricksTaken: number) {
    let points: number = 0;
    switch(this.variant) {
      case "BASIC":
        points += tricksTaken;
        if (bid == tricksTaken) {
          points += 10;
        }
        break;
      case "EXACT":
        if (bid == tricksTaken) {
          points += tricksTaken;
          points += 10;
        }
        break;
      default:
        throw new Error("Scoring not yet implmeneted for variant " + this.variant);
    }
    return points;
  }

  public updateScores(
      bids: Array<number>,
      tricksTaken: Array<number>,
      originalScores: Array<number>): void {
    for (let i = 0; i < bids.length; ++i) {
      originalScores[i] += this.score(bids[i], tricksTaken[i]);
    }
  }
}
