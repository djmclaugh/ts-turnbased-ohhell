import { OhHell } from "../source/ohhell";
import { Card } from "../source/card";

import { assert } from "chai";

describe("OhHell", () => {
  it("Hands in updates should not change as game progresses", function() {
    let game: OhHell = new OhHell({numberOfPlayers: 4, scoringVariant: "BASIC"});
    game.start("test_seed_1");
    game.playMove({bid: 0}, 0);
    game.playMove({bid: 1}, 1);
    game.playMove({bid: 1}, 2);
    game.playMove({bid: 0}, 3);

    let hands: Array<Array<Card>> = game.getAllUpdates()[0].privateInfo;
    assert.deepEqual(hands[0][0], {rank: 3, suit: "H"});
    assert.deepEqual(hands[1][0], {rank: 12, suit: "C"});
    assert.deepEqual(hands[2][0], {rank: 9, suit: "C"});
    assert.deepEqual(hands[3][0], {rank: 2, suit: "S"});

    // Play part of the trick
    game.playMove({card: {rank: 3, suit: "H"}}, 0);
    game.playMove({card: {rank: 12, suit: "C"}}, 1);

    // Verify the that hands in the updates haven't changed even though the hands in the game have
    // changed for players 0 and 1.
    hands = game.getAllUpdates()[0].privateInfo;
    assert.deepEqual(hands[0][0], {rank: 3, suit: "H"});
    assert.deepEqual(hands[1][0], {rank: 12, suit: "C"});
    assert.deepEqual(hands[2][0], {rank: 9, suit: "C"});
    assert.deepEqual(hands[3][0], {rank: 2, suit: "S"});
  });

  it("Two rounds test play", function() {
    let game: OhHell = new OhHell({numberOfPlayers: 4, scoringVariant: "BASIC"});
    game.start("test_seed_1");

    // Bid for round 1
    game.playMove({bid: 0}, 0);
    game.playMove({bid: 1}, 1);
    game.playMove({bid: 1}, 2);
    game.playMove({bid: 0}, 3);

    // Player 0 wins this trick
    game.playMove({card: {rank: 3, suit: "H"}}, 0);
    game.playMove({card: {rank: 12, suit: "C"}}, 1);
    game.playMove({card: {rank: 9, suit: "C"}}, 2);
    game.playMove({card: {rank: 2, suit: "S"}}, 3);

    // Round is over, only player 3 made their bid (but player 0 made one trick).
    assert.deepEqual(game.getLatestUpdate().publicInfo.points, [1, 0, 0, 10]);

    // Bid for round 2
    game.playMove({bid: 1}, 0);
    game.playMove({bid: 1}, 1);
    game.playMove({bid: 1}, 2);
    game.playMove({bid: 1}, 3);

    // Player 3 wins this trick (clubs is trump)
    game.playMove({card: {rank: 7, suit: "S"}}, 1);
    game.playMove({card: {rank: 3, suit: "C"}}, 2);
    game.playMove({card: {rank: 8, suit: "C"}}, 3);
    game.playMove({card: {rank: 7, suit: "H"}}, 0);

    // Player 2 wins this trick
    game.playMove({card: {rank: 3, suit: "H"}}, 3);
    game.playMove({card: {rank: 8, suit: "H"}}, 0);
    game.playMove({card: {rank: 6, suit: "S"}}, 1);
    game.playMove({card: {rank: 11, suit: "H"}}, 2);

    // Round is over, player 2 and 3 made their bids.
    assert.deepEqual(game.getLatestUpdate().publicInfo.points, [1, 0, 11, 21]);
  });
});
