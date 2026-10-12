import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAllData } from "../../lib/data/normalize";

test("normalizeAllData filters out DRAFT and ARCHIVED materials", () => {
  const raw = {
    subjects: [
      {
        subject_id: "stem-cell-biology",
        name_en: "Stem Cell Biology",
        sort_order: 1,
        status: "ACTIVE",
      },
    ],
    materials: [
      {
        material_id: "mat-0001",
        subject_id: "stem-cell-biology",
        category: "LECTURE",
        title: "Draft Lecture",
        groups: "ALL",
        status: "DRAFT",
      },
      {
        material_id: "mat-0002",
        subject_id: "stem-cell-biology",
        category: "LECTURE",
        title: "Published Lecture",
        groups: "ALL",
        drive_url: "https://drive.google.com/file/d/abc/view",
        added_on: "2026-10-12",
        status: "PUBLISHED",
        notes: "Confidential teacher note",
      },
    ],
    tasks: [],
    sessions: [],
  };

  const { data, errors } = normalizeAllData(raw);
  assert.equal(errors.length, 0);
  assert.equal(data.materials.length, 1);
  assert.equal(data.materials[0].material_id, "mat-0002");
  // Ensure notes is stripped and not in public data
  assert.equal((data.materials[0] as unknown as Record<string, unknown>).notes, undefined);
});

test("normalizeAllData isolates invalid rows without crashing", () => {
  const raw = {
    subjects: [
      {
        subject_id: "gene-therapy",
        name_en: "Gene Therapy",
        sort_order: 1,
        status: "ACTIVE",
      },
    ],
    materials: [
      {
        material_id: "mat-9999",
        subject_id: "non-existent-subject",
        category: "LECTURE",
        title: "Broken Material",
        groups: "ALL",
        drive_url: "https://drive.google.com/file/d/abc/view",
        added_on: "2026-10-12",
        status: "PUBLISHED",
      },
      {
        material_id: "bad-id-format",
        subject_id: "gene-therapy",
        category: "LECTURE",
        title: "Bad ID Material",
        groups: "ALL",
        drive_url: "https://drive.google.com/file/d/abc/view",
        added_on: "2026-10-12",
        status: "PUBLISHED",
      },
    ],
    tasks: [],
    sessions: [],
  };

  const { data, errors } = normalizeAllData(raw);
  assert.equal(data.materials.length, 0);
  assert.equal(errors.length, 2);
  const unknownSubErr = errors.find((e) => e.id === "mat-9999");
  assert.ok(unknownSubErr);
  assert.match(unknownSubErr.reason, /unknown or inactive subject_id/);
});
