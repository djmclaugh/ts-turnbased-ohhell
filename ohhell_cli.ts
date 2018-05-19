import { OhHell, OhHellUpdate } from "./source/ohhell";
import { Card, Rank, Suit } from "./source/card";

import { ReadLine, createInterface } from "readline";

// This file is a simple command line interface that allow you to play a Oh Hell game to manually
// test out changes.

let rl: ReadLine = createInterface(process.stdin, process.stdout);

let game: OhHell = new OhHell({
  numberOfPlayers: 3,
  scoringVariant: "BASIC"
});
let latestUpdate: OhHellUpdate;
let toPlay: Array<number>;

function stringForCard(card: Card): string {
  return card.rank + card.suit;
}

function printUpdate(update: OhHellUpdate): void {
  if (update.publicInfo.trickWinner !== undefined) {
    console.log(update.publicInfo.trickWinner + " won the trick");
  }
  if (update.publicInfo.newHandInfo) {
    console.log("New hand dealt - dealer: " + update.publicInfo.newHandInfo.dealer + "  reveiled card: " + stringForCard(update.publicInfo.newHandInfo.revealedCard));
    for (let i = 0; i < update.privateInfo.length; ++i) {
      console.log(i + ": " + update.privateInfo[i].map((value: Card) => stringForCard(value)));
    }
  }
  if (update.publicInfo.points) {
    console.log("Points: " + update.publicInfo.points);
  }
}

game.start();
latestUpdate = game.getLatestUpdate();
toPlay = latestUpdate.toPlay.concat();
console.log(toPlay);
printUpdate(latestUpdate);

function getAnwserFromPlayer(player: number, callback: () => void) {
  rl.question("Player " + player + " to play:\n> ", (anwser: string) => {
    if (isNaN(parseInt(anwser.substr(anwser.length - 1, anwser.length)))) {
      game.playMove({
        card: {
          rank: <Rank>parseInt(anwser.substring(0, anwser.length - 1)),
          suit: <Suit>anwser.substring(anwser.length - 1, anwser.length)
        }
      }, player);
    } else {
      game.playMove({bid: parseInt(anwser)}, player);
    }
    toPlay.splice(toPlay.indexOf(player), 1);
    callback();
  });
}

function resumePlay() {
  if (toPlay.length) {
    getAnwserFromPlayer(toPlay[0], () => resumePlay());
  } else {
    latestUpdate = game.getLatestUpdate();
    toPlay = latestUpdate.toPlay.concat();
    printUpdate(latestUpdate);
    if (toPlay.length > 0) {
      resumePlay();
    }
  }
}

resumePlay();
