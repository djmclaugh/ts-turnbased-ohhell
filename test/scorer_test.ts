import { Scorer, ScoringVariant } from "../source/scorer";

import { assert } from "chai";

let scorer: Scorer;

describe("Scorer", () => {
  describe("BASIC variant", () => {
    beforeEach(() => {
      scorer = new Scorer("BASIC");
    });
    it("exact 0", () => {
      assert.equal(scorer.score(0, 0), 10);
    });
    it("exact 5", () => {
      assert.equal(scorer.score(5, 5), 15);
    });
    it("exact 10", () => {
      assert.equal(scorer.score(10, 10), 20);
    });
    it("over 0", () => {
      assert.equal(scorer.score(0, 2), 2);
    });
    it("over 5", () => {
      assert.equal(scorer.score(5, 7), 7);
    });
    it("over 10", () => {
      assert.equal(scorer.score(10, 12), 12);
    });
    it("under 5", () => {
      assert.equal(scorer.score(5, 3), 3);
    });
    it("under 10", () => {
      assert.equal(scorer.score(10, 8), 8);
    });
  });

  describe("EXACT variant", () => {
    beforeEach(() => {
      scorer = new Scorer("EXACT");
    });
    it("exact 0", () => {
      assert.equal(scorer.score(0, 0), 10);
    });
    it("exact 5", () => {
      assert.equal(scorer.score(5, 5), 15);
    });
    it("exact 10", () => {
      assert.equal(scorer.score(10, 10), 20);
    });
    it("over 0", () => {
      assert.equal(scorer.score(0, 2), 0);
    });
    it("over 5", () => {
      assert.equal(scorer.score(5, 7), 0);
    });
    it("over 10", () => {
      assert.equal(scorer.score(10, 12), 0);
    });
    it("under 5", () => {
      assert.equal(scorer.score(5, 3), 0);
    });
    it("under 10", () => {
      assert.equal(scorer.score(10, 8), 0);
    });
  });
});
