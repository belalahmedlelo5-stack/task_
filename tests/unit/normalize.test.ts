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

test("normalizeAllData rejects tasks with missing related_material_ids", () => {
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
        material_id: "mat-0001",
        subject_id: "gene-therapy",
        category: "LECTURE",
        title: "Gene Therapy Lec 1",
        groups: "ALL",
        drive_url: "https://drive.google.com/file/d/abc/view",
        added_on: "2026-10-12",
        status: "PUBLISHED",
      },
    ],
    tasks: [
      {
        task_id: "tsk-0001",
        subject_id: "gene-therapy",
        title: "Task with broken material link",
        task_type: "ASSIGNMENT",
        groups: "ALL",
        due_date: "2026-10-25",
        related_material_ids: "mat-0001|mat-9999",
        task_status: "OPEN",
        created_on: "2026-10-12",
        updated_on: "2026-10-12",
        publish_status: "PUBLISHED",
      },
    ],
    sessions: [],
  };

  const { data, errors } = normalizeAllData(raw);
  assert.equal(data.tasks.length, 0);
  assert.equal(errors.length, 1);
  assert.match(errors[0].reason, /non-existent or unpublished material_id/);
});

test("normalizeAllData rejects invalid cohort group tokens", () => {
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
        material_id: "mat-0001",
        subject_id: "gene-therapy",
        category: "LECTURE",
        title: "Bad Group Material",
        groups: "GROUP_Z",
        drive_url: "https://drive.google.com/file/d/abc/view",
        added_on: "2026-10-12",
        status: "PUBLISHED",
      },
    ],
    tasks: [],
    sessions: [
      {
        session_id: "ses-0001",
        subject_id: "gene-therapy",
        session_type: "LECTURE",
        session_date: "2026-10-15",
        groups: "INVALID_GROUP",
        status: "SCHEDULED",
      },
    ],
  };

  const { data, errors } = normalizeAllData(raw);
  assert.equal(data.materials.length, 0);
  assert.equal(data.sessions.length, 0);
  assert.equal(errors.length, 2);
  assert.match(errors[0].reason, /Invalid group token/);
  assert.match(errors[1].reason, /Invalid group token/);
});

test("normalizeAllData automatically pads single-digit time and formats slash dates", () => {
  const raw = {
    subjects: [
      {
        subject_id: "gene-therapy",
        name_en: "Gene Therapy",
        sort_order: 1,
        status: "ACTIVE",
      },
    ],
    materials: [],
    tasks: [
      {
        task_id: "tsk-0001",
        subject_id: "gene-therapy",
        title: "Test Task",
        task_type: "ASSIGNMENT",
        due_date: "2026/10/25",
        due_time: "9:30",
        task_status: "OPEN",
        created_on: "2026-10-10",
        updated_on: "2026-10-10",
        publish_status: "PUBLISHED",
      },
    ],
    sessions: [
      {
        session_id: "ses-0001",
        subject_id: "gene-therapy",
        session_type: "LECTURE",
        session_date: "2026-10-15",
        start_time: "8:45",
        end_time: "10:25",
        groups: "ALL",
        status: "SCHEDULED",
      },
      {
        session_id: "ses-0002",
        subject_id: "gene-therapy",
        session_type: "SECTION",
        session_date: "2026-10-16",
        start_time: "08:45:00",
        end_time: "10:25:00",
        groups: "A",
        status: "SCHEDULED",
      },
    ],
  };

  const { data, errors } = normalizeAllData(raw);
  assert.equal(errors.length, 0);
  assert.equal(data.tasks.length, 1);
  assert.equal(data.tasks[0].due_date, "2026-10-25");
  assert.equal(data.tasks[0].due_time, "09:30");

  assert.equal(data.sessions.length, 2);
  assert.equal(data.sessions[0].start_time, "08:45");
  assert.equal(data.sessions[0].end_time, "10:25");
  assert.equal(data.sessions[1].start_time, "08:45");
  assert.equal(data.sessions[1].end_time, "10:25");
});

