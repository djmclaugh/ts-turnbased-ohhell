import { hasSuit, indexOfCard, trickWinner, Card, Suit, Rank } from "../source/card";

import { assert } from "chai";

describe("Card", () => {
  describe("hasSuit", () => {
    it("empty hand", function() {
      let hand: Array<Card> = [];
      assert.isFalse(hasSuit(hand, "H"));
    });

    it("same suite - one card", function() {
      let hand: Array<Card> = [
        {rank: 2, suit: "H"},
      ];
      assert.isTrue(hasSuit(hand, "H"));
    });

    it("different suite - one card", function() {
      let hand: Array<Card> = [
        {rank: 2, suit: "C"},
      ];
      assert.isFalse(hasSuit(hand, "H"));
    });

    it("mixed - no match", function() {
      let hand: Array<Card> = [
        {rank: 2, suit: "C"},
        {rank: 2, suit: "D"},
     ];
      assert.isFalse(hasSuit(hand, "H"));
    });

    it("mixed - one match", function() {
      let hand: Array<Card> = [
        {rank: 2, suit: "C"},
        {rank: 2, suit: "H"},
      ];
      assert.isTrue(hasSuit(hand, "H"));
    });
  });

  describe("trickWinner", () => {
    it("same suit - trump", function() {
      let winner: number = trickWinner([
        {rank: 2, suit: "H"},
        {rank: 3, suit: "H"},
        {rank: 4, suit: "H"},
        {rank: 5, suit: "H"},
      ], "H");
      assert.equal(winner, 3);

      winner = trickWinner([
        {rank: 5, suit: "H"},
        {rank: 11, suit: "H"},
        {rank: 9, suit: "H"},
        {rank: 8, suit: "H"},
      ], "H");
      assert.equal(winner, 1);

      winner = trickWinner([
        {rank: 14, suit: "H"},
        {rank: 4, suit: "H"},
        {rank: 2, suit: "H"},
        {rank: 8, suit: "H"},
      ], "H");
      assert.equal(winner, 0);
    });

    it("same suit - not trump", function() {
      let winner: number = trickWinner([
        {rank: 2, suit: "H"},
        {rank: 3, suit: "H"},
        {rank: 4, suit: "H"},
        {rank: 5, suit: "H"},
      ], "S");
      assert.equal(winner, 3);

      winner = trickWinner([
        {rank: 5, suit: "H"},
        {rank: 11, suit: "H"},
        {rank: 9, suit: "H"},
        {rank: 8, suit: "H"},
      ], "S");
      assert.equal(winner, 1);

      winner = trickWinner([
        {rank: 14, suit: "H"},
        {rank: 4, suit: "H"},
        {rank: 2, suit: "H"},
        {rank: 8, suit: "H"},
      ], "S");
      assert.equal(winner, 0);
    });

    it("cut with non-trump", function() {
      let winner: number = trickWinner([
        {rank: 5, suit: "H"},
        {rank: 8, suit: "C"},
        {rank: 7, suit: "H"},
        {rank: 2, suit: "H"},
      ], "S");
      assert.equal(winner, 2);
    });

    it("cut with trump", function() {
      let winner: number = trickWinner([
        {rank: 5, suit: "H"},
        {rank: 2, suit: "S"},
        {rank: 7, suit: "H"},
        {rank: 2, suit: "H"},
      ], "S");
      assert.equal(winner, 1);
    });

    it("two trump cut", function() {
      let winner: number = trickWinner([
        {rank: 5, suit: "H"},
        {rank: 8, suit: "S"},
        {rank: 9, suit: "S"},
        {rank: 10, suit: "H"},
      ], "S");
      assert.equal(winner, 2);
    });
  });
});
