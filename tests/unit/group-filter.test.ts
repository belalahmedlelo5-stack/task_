import test from "node:test";
import assert from "node:assert/strict";
import { matchesStudentGroup, parseGroupList } from "../../lib/data/group-filter";

test("parseGroupList parses comma-separated string", () => {
  assert.deepEqual(parseGroupList("ALL"), ["ALL"]);
  assert.deepEqual(parseGroupList("A, B"), ["A", "B"]);
  assert.deepEqual(parseGroupList(""), ["ALL"]);
});

test("matchesStudentGroup handles ALL group selection", () => {
  // If student views ALL, every group matches
  assert.equal(matchesStudentGroup(["A"], "ALL"), true);
  assert.equal(matchesStudentGroup(["B"], "ALL"), true);
  assert.equal(matchesStudentGroup(["TBD"], "ALL"), true);
  assert.equal(matchesStudentGroup(["ALL"], "ALL"), true);
});

test("matchesStudentGroup handles specific group selection", () => {
  // Item for ALL matches any group
  assert.equal(matchesStudentGroup(["ALL"], "A"), true);
  assert.equal(matchesStudentGroup(["ALL"], "B"), true);

  // Item for A matches A, but NOT B or C
  assert.equal(matchesStudentGroup(["A"], "A"), true);
  assert.equal(matchesStudentGroup(["A"], "B"), false);
  assert.equal(matchesStudentGroup(["A"], "C"), false);

  // Item for A,B matches A and B
  assert.equal(matchesStudentGroup(["A", "B"], "A"), true);
  assert.equal(matchesStudentGroup(["A", "B"], "B"), true);
  assert.equal(matchesStudentGroup(["A", "B"], "C"), false);
});

test("matchesStudentGroup always displays TBD to everyone with tentative flag", () => {
  assert.equal(matchesStudentGroup(["TBD"], "A"), true);
  assert.equal(matchesStudentGroup(["TBD"], "B"), true);
  assert.equal(matchesStudentGroup(["TBD"], "C"), true);
});
