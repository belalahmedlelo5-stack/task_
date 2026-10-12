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
import { parseGroupList, isValidCohortGroup } from "./group-filter";

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

export function normalizeTime(val?: unknown): string {
  let sanitized = sanitizeText(val);
  if (!sanitized) return "";
  // Strip trailing :00 seconds if present (e.g. 08:45:00 or 8:45:00)
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(sanitized)) {
    sanitized = sanitized.slice(0, sanitized.lastIndexOf(":"));
  }
  // Pad single digit hour (e.g. 8:45 -> 08:45)
  if (/^\d:[0-5]\d$/.test(sanitized)) {
    return `0${sanitized}`;
  }
  return sanitized;
}

export function normalizeDate(val?: unknown): string {
  const sanitized = sanitizeText(val);
  if (!sanitized) return "";
  const slashMatch = sanitized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (slashMatch) {
    const [, y, m, d] = slashMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return sanitized;
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

function getField(row: RawRow, ...keys: string[]): string {
  for (const k of keys) {
    for (const rowKey of Object.keys(row)) {
      const cleanRowKey = rowKey.toLowerCase().trim();
      const target = k.toLowerCase().trim();
      if (cleanRowKey === target || cleanRowKey.startsWith(target) || cleanRowKey.includes(target)) {
        const val = sanitizeText(row[rowKey]);
        if (val) return val;
      }
    }
  }
  return "";
}

function resolveSubjectId(row: RawRow, validSubjectIds: Set<string>): string {
  const directSub = getField(row, "subject_id", "subject", "المادة", "اسم المادة", "مادة").toLowerCase().trim();
  if (validSubjectIds.has(directSub)) return directSub;

  const target = directSub || Object.values(row).map((v) => String(v || "").toLowerCase()).join(" ");
  if (target.includes("stem cell") || target.includes("خلايا") || target.includes("جذعية") || target.includes("mbscb403")) return "stem-cell-biology";
  if (target.includes("drug") || target.includes("دواء") || target.includes("دوائية") || target.includes("ebdm151")) return "drug-monitoring";
  if (target.includes("microbial") || target.includes("وراثة") || target.includes("mbmg310")) return "microbial-genetics";
  if (target.includes("gene") || target.includes("جيني") || target.includes("mbgt309")) return "gene-therapy";
  if (target.includes("recombinant") || target.includes("اتحاد") || target.includes("حمض") || target.includes("mbbmbr213")) return "recombinant-dna-technology";
  if (target.includes("communication") || target.includes("signaling") || target.includes("إشارات") || target.includes("اتصال") || target.includes("mbccs410")) return "communication-cell-signaling";
  if (target.includes("industry") || target.includes("bacterial") || target.includes("بكتيرية") || target.includes("صناعية") || target.includes("mbibb313")) return "industry-bacterial-biotechnology";

  return "";
}

export function normalizeMaterials(
  rawRows: Array<RawRow>,
  validSubjectIds: Set<string>
): { materials: PublicMaterial[]; errors: Array<{ tab: string; id: string; reason: string }> } {
  const materials: PublicMaterial[] = [];
  const errors: Array<{ tab: string; id: string; reason: string }> = [];
  const seenIds = new Set<string>();
  let autoIdCounter = 1;

  for (const row of rawRows) {
    const driveUrl = getField(row, "drive_url", "drive", "url", "رابط");
    const rawTitle = getField(row, "title", "name", "عنوان", "اسم المحتوى");
    const subjectName = getField(row, "subject_name", "subject", "اسم المادة");

    // Skip completely empty rows
    if (!driveUrl && !rawTitle && !row.subject_id && !subjectName) {
      continue;
    }

    let rawId = getField(row, "material_id", "id");
    if (!rawId) {
      rawId = `mat-${String(autoIdCounter++).padStart(4, "0")}`;
    }

    if (seenIds.has(rawId)) {
      rawId = `mat-${String(autoIdCounter++).padStart(4, "0")}`;
    }

    const resolvedSub = resolveSubjectId(row, validSubjectIds) || sanitizeText(String(row.subject_id || ""));

    let category = getField(row, "category", "نوع", "تصنيف").toUpperCase();
    if (!category || !["FOLDER", "LECTURE", "SECTION", "TUTORIAL", "QUESTIONS", "SUPPLEMENT", "OTHER"].includes(category)) {
      const lowerTitle = rawTitle.toLowerCase();
      if (driveUrl.includes("/folders/") || lowerTitle.includes("فولدر") || lowerTitle.includes("مجلد") || lowerTitle.includes("folder")) {
        category = "FOLDER";
      } else {
        category = "LECTURE";
      }
    }

    const addedOn = normalizeDate(getField(row, "added_on", "تاريخ")) || "2026-10-12";
    const status = getField(row, "status", "حالة").toUpperCase() || "PUBLISHED";
    const notes = getField(row, "notes", "ملاحظات", "note");
    const groups = getField(row, "groups", "جروب") || "ALL";

    const rawParsed = RawMaterialSchema.safeParse({
      material_id: rawId,
      subject_id: resolvedSub,
      category,
      title: rawTitle || (category === "FOLDER" ? "مجلد داتا المادة الشامل" : "ملف المادة"),
      sequence_no: row.sequence_no ? Number(row.sequence_no) : null,
      groups,
      drive_url: driveUrl,
      original_filename: sanitizeText(String(row.original_filename || "")),
      added_on: addedOn,
      status,
      notes,
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

    const parsedGroups = parseGroupList(item.groups);
    const invalidGroups = parsedGroups.filter((g) => !isValidCohortGroup(g, false));
    if (invalidGroups.length > 0) {
      errors.push({
        tab: "Materials",
        id: rawId,
        reason: `Invalid group token(s): ${invalidGroups.join(", ")}. Allowed: ALL, A, B, C`,
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
      groups: parsedGroups,
      drive_url: item.drive_url,
      original_filename: item.original_filename || undefined,
      added_on: item.added_on,
      status: "PUBLISHED",
    });
  }

  return { materials, errors };
}

function resolveTaskType(val?: unknown): "ASSIGNMENT" | "PRESENTATION" | "DISCUSSION" | "RESEARCH" | "QUIZ" | "EXAM" | "OTHER" {
  const s = String(val || "").trim().toLowerCase();
  if (s.includes("present") || s.includes("persent") || s.includes("عرض") || s.includes("بريزنت")) return "PRESENTATION";
  if (s.includes("quiz") || s.includes("كويز") || s.includes("اختبار")) return "QUIZ";
  if (s.includes("exam") || s.includes("امتحان")) return "EXAM";
  if (s.includes("research") || s.includes("بحث")) return "RESEARCH";
  if (s.includes("discuss") || s.includes("مناقشة")) return "DISCUSSION";
  if (s.includes("assign") || s.includes("واجب") || s.includes("شيت") || s.includes("تقرير") || s.includes("report")) return "ASSIGNMENT";
  return "ASSIGNMENT";
}

function resolveSessionType(val?: unknown): "LECTURE" | "SECTION" | "TUTORIAL" | "LAB" | "OTHER" {
  const s = String(val || "").trim().toLowerCase();
  if (s.includes("lab") || s.includes("معمل")) return "LAB";
  if (s.includes("sec") || s.includes("سكشن")) return "SECTION";
  if (s.includes("tut") || s.includes("توتور")) return "TUTORIAL";
  if (s.includes("lec") || s.includes("محاضر")) return "LECTURE";
  return "LECTURE";
}

export function normalizeTasks(
  rawRows: Array<RawRow>,
  validSubjectIds: Set<string>,
  validMaterialIds: Set<string>
): { tasks: PublicTask[]; errors: Array<{ tab: string; id: string; reason: string }> } {
  const tasks: PublicTask[] = [];
  const errors: Array<{ tab: string; id: string; reason: string }> = [];
  const seenIds = new Set<string>();
  let autoTaskId = 1;

  for (const row of rawRows) {
    const rawSub = getField(row, "اسم المادة", "المادة", "مادة", "subject_id", "subject");
    const rawTitle = getField(row, "المهمة المطلوبة", "المهمة", "المطلوب", "التكليف", "task", "tasks", "title", "name", "عنوان");
    const description = getField(row, "description", "desc", "وصف", "تفاصيل", "ملاحظات");

    // Skip empty or placeholder rows where no actual task was entered
    if (!rawTitle && !description) continue;
    if (rawTitle === "-" || rawTitle === "--" || rawTitle === "لا يوجد" || rawTitle.toLowerCase() === "none") continue;

    const resolvedSub = resolveSubjectId(row, validSubjectIds) || rawSub.toLowerCase();
    if (!validSubjectIds.has(resolvedSub)) {
      if (rawSub) {
        errors.push({
          tab: "Tasks",
          id: String(row.task_id || "new"),
          reason: `Referenced unknown or inactive subject_id '${resolvedSub}'`,
        });
      }
      continue;
    }

    let rawId = getField(row, "task_id", "id");
    if (!rawId || !/^(tsk|task)-[0-9]{4,}$/.test(rawId)) {
      rawId = `task-${String(autoTaskId++).padStart(4, "0")}`;
    }

    if (seenIds.has(rawId)) {
      rawId = `task-${String(autoTaskId++).padStart(4, "0")}`;
    }

    const title = rawTitle || description || `تكليف مادة ${resolvedSub}`;
    const rawType = getField(row, "task_type", "type", "نوع");
    const taskType = resolveTaskType(rawType || title);

    let rawGroups = getField(row, "groups", "جروب");
    if (!rawGroups) {
      const textToCheck = `${title} ${description}`;
      const detected: string[] = [];
      if (/(?:مجموعة|جروب|\bgroup\b)\s*[Aaأ]|[\(\[\{]\s*[Aaأ]\s*[\)\]\}]/i.test(textToCheck)) detected.push("A");
      if (/(?:مجموعة|جروب|\bgroup\b)\s*[Bbب]|[\(\[\{]\s*[Bbب]\s*[\)\]\}]/i.test(textToCheck)) detected.push("B");
      if (/(?:مجموعة|جروب|\bgroup\b)\s*[Ccج]|[\(\[\{]\s*[Ccج]\s*[\)\]\}]/i.test(textToCheck)) detected.push("C");
      rawGroups = detected.length > 0 ? detected.join(",") : "ALL";
    }

    const dueDate = normalizeDate(getField(row, "due_date", "تاريخ", "تسليم", "موعد")) || "";
    const dueTime = normalizeTime(getField(row, "due_time", "وقت", "ساعة")) || "";
    const taskStatus = (getField(row, "task_status", "حالة") || "OPEN").toUpperCase() as "OPEN" | "CLOSED" | "CANCELLED";
    const createdOn = normalizeDate(getField(row, "created_on")) || "2026-10-12";
    const updatedOn = normalizeDate(getField(row, "updated_on")) || "2026-10-12";
    let publishStatus = (getField(row, "publish_status") || "PUBLISHED").toUpperCase();
    if (publishStatus !== "DRAFT" && publishStatus !== "ARCHIVED") {
      publishStatus = "PUBLISHED";
    }

    const rawParsed = RawTaskSchema.safeParse({
      task_id: rawId,
      subject_id: resolvedSub,
      title,
      task_type: taskType,
      description,
      groups: rawGroups,
      due_date: dueDate,
      due_time: dueTime,
      related_material_ids: sanitizeText(String(row.related_material_ids || "")),
      task_status: taskStatus,
      created_on: createdOn,
      updated_on: updatedOn,
      publish_status: publishStatus,
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

    const parsedGroups = parseGroupList(item.groups);
    const invalidGroups = parsedGroups.filter((g) => !isValidCohortGroup(g, false));
    if (invalidGroups.length > 0) {
      errors.push({
        tab: "Tasks",
        id: rawId,
        reason: `Invalid group token(s): ${invalidGroups.join(", ")}. Allowed: ALL, A, B, C`,
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

    const missingRelated = relatedIds.filter((id) => !validMaterialIds.has(id));
    if (missingRelated.length > 0) {
      errors.push({
        tab: "Tasks",
        id: rawId,
        reason: `related_material_ids contains non-existent or unpublished material_id(s): ${missingRelated.join(", ")}`,
      });
      continue;
    }

    seenIds.add(rawId);
    tasks.push({
      task_id: item.task_id,
      subject_id: item.subject_id,
      title: item.title,
      task_type: item.task_type,
      description: item.description || undefined,
      groups: parsedGroups,
      due_date: item.due_date || null,
      due_time: item.due_time || null,
      related_material_ids: relatedIds,
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
  let autoSesId = 1;

  for (const row of rawRows) {
    const rawSub = getField(row, "subject_id", "subject", "المادة");
    if (!rawSub && !row.session_id) continue;

    let rawId = getField(row, "session_id", "id");
    if (!rawId || !/^(ses|session)-[0-9]{4,}$/.test(rawId)) {
      rawId = `ses-${String(autoSesId++).padStart(4, "0")}`;
    }

    if (seenIds.has(rawId)) {
      rawId = `ses-${String(autoSesId++).padStart(4, "0")}`;
    }

    const resolvedSub = resolveSubjectId(row, validSubjectIds) || rawSub.toLowerCase();
    const sessionType = resolveSessionType(getField(row, "session_type", "type", "نوع"));
    const sessionDate = normalizeDate(getField(row, "session_date", "تاريخ")) || "2026-10-12";
    const startTime = normalizeTime(getField(row, "start_time", "بداية", "وقت البداية"));
    const endTime = normalizeTime(getField(row, "end_time", "نهاية", "وقت النهاية"));
    const rawGroups = getField(row, "groups", "جروب") || "ALL";
    const location = getField(row, "location", "قاعة", "مكان");
    const note = getField(row, "note", "ملاحظات", "دكتور", "معيد");
    const status = (getField(row, "status", "حالة") || "SCHEDULED").toUpperCase() as "SCHEDULED" | "CANCELLED" | "TENTATIVE";

    const rawParsed = RawSessionSchema.safeParse({
      session_id: rawId,
      subject_id: resolvedSub,
      session_type: sessionType,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      groups: rawGroups,
      location,
      note,
      status: ["SCHEDULED", "CANCELLED", "TENTATIVE"].includes(status) ? status : "SCHEDULED",
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

    const parsedGroups = parseGroupList(item.groups);
    const invalidGroups = parsedGroups.filter((g) => !isValidCohortGroup(g, true));
    if (invalidGroups.length > 0) {
      errors.push({
        tab: "Sessions",
        id: rawId,
        reason: `Invalid group token(s): ${invalidGroups.join(", ")}. Allowed: ALL, A, B, C, TBD`,
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
      groups: parsedGroups,
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
