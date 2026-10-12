import test from "node:test";
import assert from "node:assert/strict";
import {
  getStoredGroup,
  setStoredGroup,
  getStoredCompletedTaskIds,
  toggleStoredCompletedTaskId,
  STORAGE_KEYS,
} from "../../lib/storage/student-preferences";

test("student-preferences defaults to ALL in node environment", () => {
  assert.equal(getStoredGroup(), "ALL");
  assert.deepEqual(getStoredCompletedTaskIds(), []);
});

test("STORAGE_KEYS have exact required key names", () => {
  assert.equal(STORAGE_KEYS.GROUP, "tasks:v1:group");
  assert.equal(STORAGE_KEYS.COMPLETED_TASK_IDS, "tasks:v1:completedTaskIds");
});

test("toggleStoredCompletedTaskId returns false gracefully without window", () => {
  assert.equal(toggleStoredCompletedTaskId("tsk-0001"), false);
});
