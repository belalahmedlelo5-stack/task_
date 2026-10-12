import {
  Subject,
  PublicMaterial,
  PublicTask,
  PublicSession,
  SubjectSchema,
  RawMaterialSchema,
  RawTaskSchema,
  RawSessionSchema,
  PublicData,
} from "./schema";
import { parseGroupList } from "./group-filter";

export type RawRow = Record<string, unknown>;

export interface NormalizationResult {
  data: PublicData;
  errors: Array<{ tab: string; id: string; reason: string }>;
}

function sanitizeText(str?: unknown): string {
  if (str === null || str === undefined) return "";
  // Strip HTML tags and normalize whitespace
  return String(str).replace(/<[^>]*>?/gm, "").trim();
}

export function normalizeSubjects(
  rawRows: Array<RawRow>
): { subjects: Subject[]; errors: Array<{ tab: string; id: string; reason: string }> } {
  const subjects: Subject[] = [];
  const errors: Array<{ tab: string; id: string; reason: string }> = [];
  const seenIds = new Set<string>();

  for (const row of rawRows) {
    const rawId = sanitizeText(String(row.subject_id || ""));
    if (!rawId) continue;

    if (seenIds.has(rawId)) {
      errors.push({ tab: "Subjects", id: rawId, reason: "Duplicate subject_id" });
      continue;
    }

    const parsed = SubjectSchema.safeParse({
      subject_id: rawId,
      name_en: sanitizeText(String(row.name_en || "")),
      name_ar: sanitizeText(String(row.name_ar || "")),
      course_code: sanitizeText(String(row.course_code || "")),
      sort_order: row.sort_order,
      status: String(row.status || "ACTIVE").trim().toUpperCase(),
    });

    if (!parsed.success) {
      errors.push({
        tab: "Subjects",
        id: rawId,
        reason: parsed.error.issues.map((i) => i.message).join("; "),
      });
      continue;
    }

    if (parsed.data.status === "ACTIVE") {
      seenIds.add(rawId);
      subjects.push(parsed.data);
    }
  }

  // Sort by sort_order ascending
  subjects.sort((a, b) => a.sort_order - b.sort_order);
  return { subjects, errors };
}

export function normalizeMaterials(
  rawRows: Array<RawRow>,
  validSubjectIds: Set<string>
): { materials: PublicMaterial[]; errors: Array<{ tab: string; id: string; reason: string }> } {
  const materials: PublicMaterial[] = [];
  const errors: Array<{ tab: string; id: string; reason: string }> = [];
  const seenIds = new Set<string>();

  for (const row of rawRows) {
    const rawId = sanitizeText(String(row.material_id || ""));
    if (!rawId) continue;

    if (seenIds.has(rawId)) {
      errors.push({ tab: "Materials", id: rawId, reason: "Duplicate material_id" });
      continue;
    }

    const rawParsed = RawMaterialSchema.safeParse({
      material_id: rawId,
      subject_id: sanitizeText(String(row.subject_id || "")),
      category: String(row.category || "").trim().toUpperCase(),
      title: sanitizeText(String(row.title || "")),
      sequence_no: row.sequence_no ? Number(row.sequence_no) : null,
      groups: sanitizeText(String(row.groups || "ALL")),
      drive_url: sanitizeText(String(row.drive_url || "")),
      original_filename: sanitizeText(String(row.original_filename || "")),
      added_on: sanitizeText(String(row.added_on || "")),
      status: String(row.status || "").trim().toUpperCase(),
      notes: sanitizeText(String(row.notes || "")),
    });

    if (!rawParsed.success) {
      errors.push({
        tab: "Materials",
        id: rawId,
        reason: rawParsed.error.issues.map((i) => i.message).join("; "),
      });
      continue;
    }

    const item = rawParsed.data;

    // Must be PUBLISHED to appear to students
    if (item.status !== "PUBLISHED") {
      continue;
    }

    // Must reference valid active subject
    if (!validSubjectIds.has(item.subject_id)) {
      errors.push({
        tab: "Materials",
        id: rawId,
        reason: `Referenced unknown or inactive subject_id '${item.subject_id}'`,
      });
      continue;
    }

    // Must have valid drive_url
    if (!item.drive_url || !item.drive_url.startsWith("https://")) {
      errors.push({
        tab: "Materials",
        id: rawId,
        reason: "drive_url is missing or not HTTPS",
      });
      continue;
    }

    let isGoogleDriveUrl = false;
    try {
      const u = new URL(item.drive_url);
      isGoogleDriveUrl =
        u.hostname === "drive.google.com" || u.hostname === "docs.google.com";
    } catch {
      isGoogleDriveUrl = false;
    }

    if (!isGoogleDriveUrl) {
      errors.push({
        tab: "Materials",
        id: rawId,
        reason: "drive_url must be on drive.google.com or docs.google.com",
      });
      continue;
    }

    // Must have added_on date
    if (!item.added_on || !/^\d{4}-\d{2}-\d{2}$/.test(item.added_on)) {
      errors.push({
        tab: "Materials",
        id: rawId,
        reason: "added_on must be YYYY-MM-DD",
      });
      continue;
    }

    seenIds.add(rawId);
    materials.push({
      material_id: item.material_id,
      subject_id: item.subject_id,
      category: item.category,
      title: item.title,
      sequence_no: item.sequence_no ?? null,
      groups: parseGroupList(item.groups),
      drive_url: item.drive_url,
      original_filename: item.original_filename || undefined,
      added_on: item.added_on,
      status: "PUBLISHED",
    });
  }

  return { materials, errors };
}

export function normalizeTasks(
  rawRows: Array<RawRow>,
  validSubjectIds: Set<string>,
  validMaterialIds: Set<string>
): { tasks: PublicTask[]; errors: Array<{ tab: string; id: string; reason: string }> } {
  const tasks: PublicTask[] = [];
  const errors: Array<{ tab: string; id: string; reason: string }> = [];
  const seenIds = new Set<string>();

  for (const row of rawRows) {
    const rawId = sanitizeText(String(row.task_id || ""));
    if (!rawId) continue;

    if (seenIds.has(rawId)) {
      errors.push({ tab: "Tasks", id: rawId, reason: "Duplicate task_id" });
      continue;
    }

    const rawParsed = RawTaskSchema.safeParse({
      task_id: rawId,
      subject_id: sanitizeText(String(row.subject_id || "")),
      title: sanitizeText(String(row.title || "")),
      task_type: String(row.task_type || "").trim().toUpperCase(),
      description: sanitizeText(String(row.description || "")),
      groups: sanitizeText(String(row.groups || "ALL")),
      due_date: sanitizeText(String(row.due_date || "")),
      due_time: sanitizeText(String(row.due_time || "")),
      related_material_ids: sanitizeText(String(row.related_material_ids || "")),
      task_status: String(row.task_status || "OPEN").trim().toUpperCase(),
      created_on: sanitizeText(String(row.created_on || "")),
      updated_on: sanitizeText(String(row.updated_on || "")),
      publish_status: String(row.publish_status || "").trim().toUpperCase(),
    });

    if (!rawParsed.success) {
      errors.push({
        tab: "Tasks",
        id: rawId,
        reason: rawParsed.error.issues.map((i) => i.message).join("; "),
      });
      continue;
    }

    const item = rawParsed.data;

    // Must be PUBLISHED to appear to students
    if (item.publish_status !== "PUBLISHED") {
      continue;
    }

    // Must reference valid active subject
    if (!validSubjectIds.has(item.subject_id)) {
      errors.push({
        tab: "Tasks",
        id: rawId,
        reason: `Referenced unknown or inactive subject_id '${item.subject_id}'`,
      });
      continue;
    }

    // Validate related materials if specified
    const relatedIds = item.related_material_ids
      ? item.related_material_ids
          .split("|")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    const validRelated = relatedIds.filter((id) => validMaterialIds.has(id));

    seenIds.add(rawId);
    tasks.push({
      task_id: item.task_id,
      subject_id: item.subject_id,
      title: item.title,
      task_type: item.task_type,
      description: item.description || undefined,
      groups: parseGroupList(item.groups),
      due_date: item.due_date || null,
      due_time: item.due_time || null,
      related_material_ids: validRelated,
      task_status: item.task_status,
      created_on: item.created_on,
      updated_on: item.updated_on,
      publish_status: "PUBLISHED",
    });
  }

  return { tasks, errors };
}

export function normalizeSessions(
  rawRows: Array<RawRow>,
  validSubjectIds: Set<string>
): { sessions: PublicSession[]; errors: Array<{ tab: string; id: string; reason: string }> } {
  const sessions: PublicSession[] = [];
  const errors: Array<{ tab: string; id: string; reason: string }> = [];
  const seenIds = new Set<string>();

  for (const row of rawRows) {
    const rawId = sanitizeText(String(row.session_id || ""));
    if (!rawId) continue;

    if (seenIds.has(rawId)) {
      errors.push({ tab: "Sessions", id: rawId, reason: "Duplicate session_id" });
      continue;
    }

    const rawParsed = RawSessionSchema.safeParse({
      session_id: rawId,
      subject_id: sanitizeText(String(row.subject_id || "")),
      session_type: String(row.session_type || "").trim().toUpperCase(),
      session_date: sanitizeText(String(row.session_date || "")),
      start_time: sanitizeText(String(row.start_time || "")),
      end_time: sanitizeText(String(row.end_time || "")),
      groups: sanitizeText(String(row.groups || "ALL")),
      location: sanitizeText(String(row.location || "")),
      note: sanitizeText(String(row.note || "")),
      status: String(row.status || "SCHEDULED").trim().toUpperCase(),
    });

    if (!rawParsed.success) {
      errors.push({
        tab: "Sessions",
        id: rawId,
        reason: rawParsed.error.issues.map((i) => i.message).join("; "),
      });
      continue;
    }

    const item = rawParsed.data;

    if (!validSubjectIds.has(item.subject_id)) {
      errors.push({
        tab: "Sessions",
        id: rawId,
        reason: `Referenced unknown or inactive subject_id '${item.subject_id}'`,
      });
      continue;
    }

    seenIds.add(rawId);
    sessions.push({
      session_id: item.session_id,
      subject_id: item.subject_id,
      session_type: item.session_type,
      session_date: item.session_date,
      start_time: item.start_time || null,
      end_time: item.end_time || null,
      groups: parseGroupList(item.groups),
      location: item.location || undefined,
      note: item.note || undefined,
      status: item.status,
    });
  }

  // Sort sessions chronologically
  sessions.sort((a, b) => {
    const dComp = a.session_date.localeCompare(b.session_date);
    if (dComp !== 0) return dComp;
    return (a.start_time || "").localeCompare(b.start_time || "");
  });

  return { sessions, errors };
}

export function normalizeAllData(
  raw: {
    subjects: Array<RawRow>;
    materials: Array<RawRow>;
    tasks: Array<RawRow>;
    sessions: Array<RawRow>;
  },
  environment: "production" | "development" | "preview" = "production",
  is_demo = false
): NormalizationResult {
  const allErrors: Array<{ tab: string; id: string; reason: string }> = [];

  const { subjects, errors: sErrors } = normalizeSubjects(raw.subjects);
  allErrors.push(...sErrors);

  const validSubjectIds = new Set(subjects.map((s) => s.subject_id));

  const { materials, errors: mErrors } = normalizeMaterials(raw.materials, validSubjectIds);
  allErrors.push(...mErrors);

  const validMaterialIds = new Set(materials.map((m) => m.material_id));

  const { tasks, errors: tErrors } = normalizeTasks(raw.tasks, validSubjectIds, validMaterialIds);
  allErrors.push(...tErrors);

  const { sessions, errors: sesErrors } = normalizeSessions(raw.sessions, validSubjectIds);
  allErrors.push(...sesErrors);

  return {
    data: {
      subjects,
      materials,
      tasks,
      sessions,
      meta: {
        updated_at: new Date().toISOString(),
        environment,
        is_demo,
      },
    },
    errors: allErrors,
  };
}
