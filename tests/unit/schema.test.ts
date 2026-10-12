import test from "node:test";
import assert from "node:assert/strict";
import {
  SubjectSchema,
  RawMaterialSchema,
  PublicMaterialSchema,
  RawTaskSchema,
  RawSessionSchema,
} from "../../lib/data/schema";

test("SubjectSchema validates valid active subject", () => {
  const result = SubjectSchema.safeParse({
    subject_id: "stem-cell-biology",
    name_en: "Stem Cell Biology",
    name_ar: "بيولوجيا الخلايا الجذعية",
    course_code: "",
    sort_order: 1,
    status: "ACTIVE",
  });
  assert.equal(result.success, true);
});

test("SubjectSchema rejects invalid subject_id uppercase or invalid chars", () => {
  const result = SubjectSchema.safeParse({
    subject_id: "Stem_Cell_Biology!",
    name_en: "Stem Cell Biology",
    sort_order: 1,
    status: "ACTIVE",
  });
  assert.equal(result.success, false);
});

test("RawMaterialSchema accepts valid raw material", () => {
  const result = RawMaterialSchema.safeParse({
    material_id: "mat-0001",
    subject_id: "stem-cell-biology",
    category: "LECTURE",
    title: "Embryonic Stem Cells",
    sequence_no: 1,
    groups: "ALL",
    drive_url: "https://drive.google.com/file/d/123/view",
    original_filename: "lec1.pdf",
    added_on: "2026-10-12",
    status: "PUBLISHED",
    notes: "Internal note",
  });
  assert.equal(result.success, true);
});

test("PublicMaterialSchema rejects non-Google Drive URLs", () => {
  const result = PublicMaterialSchema.safeParse({
    material_id: "mat-0001",
    subject_id: "stem-cell-biology",
    category: "LECTURE",
    title: "Embryonic Stem Cells",
    groups: ["ALL"],
    drive_url: "https://example.com/file.pdf",
    added_on: "2026-10-12",
    status: "PUBLISHED",
  });
  assert.equal(result.success, false);
});

test("PublicMaterialSchema accepts drive.google.com and docs.google.com HTTPS URLs", () => {
  const driveResult = PublicMaterialSchema.safeParse({
    material_id: "mat-0001",
    subject_id: "stem-cell-biology",
    category: "LECTURE",
    title: "Embryonic Stem Cells",
    groups: ["ALL"],
    drive_url: "https://drive.google.com/file/d/123/view",
    added_on: "2026-10-12",
    status: "PUBLISHED",
  });
  assert.equal(driveResult.success, true);

  const docsResult = PublicMaterialSchema.safeParse({
    material_id: "mat-0002",
    subject_id: "stem-cell-biology",
    category: "LECTURE",
    title: "Embryonic Stem Cells Slides",
    groups: ["ALL"],
    drive_url: "https://docs.google.com/presentation/d/456/edit",
    added_on: "2026-10-12",
    status: "PUBLISHED",
  });
  assert.equal(docsResult.success, true);
});

test("RawTaskSchema accepts valid task", () => {
  const result = RawTaskSchema.safeParse({
    task_id: "tsk-0001",
    subject_id: "gene-therapy",
    title: "Vector Design Report",
    task_type: "ASSIGNMENT",
    description: "Write protocol for lentiviral transduction",
    groups: "A,B",
    due_date: "2026-10-25",
    due_time: "23:59",
    related_material_ids: "mat-0011|mat-0012",
    task_status: "OPEN",
    created_on: "2026-10-12",
    updated_on: "2026-10-12",
    publish_status: "PUBLISHED",
  });
  assert.equal(result.success, true);
});

test("RawSessionSchema accepts valid session", () => {
  const result = RawSessionSchema.safeParse({
    session_id: "ses-0001",
    subject_id: "stem-cell-biology",
    session_type: "SECTION",
    session_date: "2026-10-18",
    start_time: "09:00",
    end_time: "11:00",
    groups: "A",
    location: "Lab 3",
    note: "Bring lab coats",
    status: "SCHEDULED",
  });
  assert.equal(result.success, true);
});

test("RawTaskSchema rejects due_time without due_date", () => {
  const result = RawTaskSchema.safeParse({
    task_id: "tsk-0002",
    subject_id: "gene-therapy",
    title: "Missing Date Task",
    task_type: "ASSIGNMENT",
    groups: "ALL",
    due_date: "",
    due_time: "14:00",
    task_status: "OPEN",
    created_on: "2026-10-12",
    updated_on: "2026-10-12",
    publish_status: "PUBLISHED",
  });
  assert.equal(result.success, false);
});

test("RawTaskSchema rejects malformed due_time", () => {
  const result = RawTaskSchema.safeParse({
    task_id: "tsk-0003",
    subject_id: "gene-therapy",
    title: "Malformed Time Task",
    task_type: "ASSIGNMENT",
    groups: "ALL",
    due_date: "2026-10-25",
    due_time: "25:99",
    task_status: "OPEN",
    created_on: "2026-10-12",
    updated_on: "2026-10-12",
    publish_status: "PUBLISHED",
  });
  assert.equal(result.success, false);
});

test("RawSessionSchema rejects end_time without start_time", () => {
  const result = RawSessionSchema.safeParse({
    session_id: "ses-0002",
    subject_id: "stem-cell-biology",
    session_type: "SECTION",
    session_date: "2026-10-18",
    start_time: "",
    end_time: "11:00",
    groups: "A",
    status: "SCHEDULED",
  });
  assert.equal(result.success, false);
});

test("RawSessionSchema rejects end_time earlier than start_time", () => {
  const result = RawSessionSchema.safeParse({
    session_id: "ses-0003",
    subject_id: "stem-cell-biology",
    session_type: "SECTION",
    session_date: "2026-10-18",
    start_time: "14:00",
    end_time: "10:00",
    groups: "A",
    status: "SCHEDULED",
  });
  assert.equal(result.success, false);
});
