import test from "node:test";
import assert from "node:assert/strict";
import {
  isOverdueInCairo,
  formatCairoDeadline,
  getCairoNowParts,
} from "../../lib/date/cairo";

test("getCairoNowParts returns integer calendar components", () => {
  const parts = getCairoNowParts(new Date("2026-10-12T12:00:00Z"));
  assert.equal(typeof parts.year, "number");
  assert.equal(typeof parts.month, "number");
  assert.equal(typeof parts.day, "number");
  assert.equal(typeof parts.hour, "number");
});

test("isOverdueInCairo returns false when due_date is empty or null", () => {
  assert.equal(isOverdueInCairo(null, null), false);
  assert.equal(isOverdueInCairo("", ""), false);
  assert.equal(isOverdueInCairo("   ", ""), false);
});

test("isOverdueInCairo respects whole day deadline when due_time is omitted", () => {
  // Mock current time: 2026-10-12 at 14:00 UTC (16:00 or 17:00 in Cairo)
  const mockNow = new Date("2026-10-12T14:00:00Z");

  // Due date is 2026-10-12 without time -> NOT overdue yet during that day
  assert.equal(isOverdueInCairo("2026-10-12", null, mockNow), false);

  // Due date was yesterday 2026-10-11 -> Overdue
  assert.equal(isOverdueInCairo("2026-10-11", null, mockNow), true);

  // Due date is tomorrow 2026-10-13 -> NOT overdue
  assert.equal(isOverdueInCairo("2026-10-13", null, mockNow), false);
});

test("isOverdueInCairo calculates time-specific deadline", () => {
  // Current time: 2026-10-12 at 10:00 UTC (12:00 or 13:00 Cairo time)
  const mockNow = new Date("2026-10-12T10:00:00Z");
  const cairoNow = getCairoNowParts(mockNow);

  // An hour before Cairo time
  const pastHour = String(Math.max(0, cairoNow.hour - 1)).padStart(2, "0") + ":00";
  assert.equal(isOverdueInCairo("2026-10-12", pastHour, mockNow), true);

  // An hour after Cairo time
  const futureHour = String(Math.min(23, cairoNow.hour + 2)).padStart(2, "0") + ":00";
  assert.equal(isOverdueInCairo("2026-10-12", futureHour, mockNow), false);
});

test("formatCairoDeadline formats date and time cleanly", () => {
  assert.equal(formatCairoDeadline(null), "لم يُحدد بعد");
  assert.equal(formatCairoDeadline(""), "لم يُحدد بعد");
  assert.equal(formatCairoDeadline("2026-10-25"), "يوم 25/10/2026");
  assert.equal(formatCairoDeadline("2026-10-25", "14:30"), "25/10/2026 الساعة 14:30");
});
