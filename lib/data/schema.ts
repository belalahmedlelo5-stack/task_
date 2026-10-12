import { z } from "zod";

// --- Enums ---
export const SubjectStatusEnum = z.enum(["ACTIVE", "ARCHIVED"]);

export const MaterialCategoryEnum = z.enum([
  "LECTURE",
  "SECTION",
  "TUTORIAL",
  "QUESTIONS",
  "SUPPLEMENT",
  "OTHER",
]);

export const MaterialStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const TaskTypeEnum = z.enum([
  "ASSIGNMENT",
  "PRESENTATION",
  "DISCUSSION",
  "RESEARCH",
  "QUIZ",
  "EXAM",
  "OTHER",
]);

export const TaskStatusEnum = z.enum(["OPEN", "CLOSED", "CANCELLED"]);

export const PublishStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const SessionTypeEnum = z.enum([
  "LECTURE",
  "SECTION",
  "TUTORIAL",
  "LAB",
  "OTHER",
]);

export const SessionStatusEnum = z.enum(["SCHEDULED", "CANCELLED", "TENTATIVE"]);

export const GroupEnum = z.enum(["ALL", "A", "B", "C"]);

// --- Schema Definitions ---

export const SubjectSchema = z.object({
  subject_id: z.string().regex(/^[a-z0-9-]+$/),
  name_en: z.string().min(1),
  name_ar: z.string().optional().default(""),
  course_code: z.string().optional().default(""),
  sort_order: z.coerce.number().int().min(1).max(7),
  status: SubjectStatusEnum,
});

export const RawMaterialSchema = z.object({
  material_id: z.string().regex(/^mat-[0-9]{4,}$/),
  subject_id: z.string(),
  category: MaterialCategoryEnum,
  title: z.string().min(1),
  sequence_no: z.coerce.number().int().min(1).max(99).optional().nullable(),
  groups: z.string().min(1),
  drive_url: z.string().optional().default(""),
  original_filename: z.string().optional().default(""),
  added_on: z.string().optional().default(""),
  status: MaterialStatusEnum,
  notes: z.string().optional().default(""),
});

export const PublicMaterialSchema = z.object({
  material_id: z.string(),
  subject_id: z.string(),
  category: MaterialCategoryEnum,
  title: z.string(),
  sequence_no: z.number().nullable().optional(),
  groups: z.array(z.string()),
  drive_url: z.string().url().refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && (
        parsed.hostname === "drive.google.com" ||
        parsed.hostname === "docs.google.com"
      );
    } catch {
      return false;
    }
  }, { message: "drive_url must be an HTTPS URL on drive.google.com or docs.google.com" }),
  original_filename: z.string().optional(),
  added_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.literal("PUBLISHED"),
});

export const RawTaskSchema = z.object({
  task_id: z.string().regex(/^tsk-[0-9]{4,}$/),
  subject_id: z.string(),
  title: z.string().min(1),
  task_type: TaskTypeEnum,
  description: z.string().optional().default(""),
  groups: z.string().min(1),
  due_date: z.string().optional().default(""),
  due_time: z.string().optional().default(""),
  related_material_ids: z.string().optional().default(""),
  task_status: TaskStatusEnum,
  created_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updated_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  publish_status: PublishStatusEnum,
}).superRefine((data, ctx) => {
  if (data.due_date && data.due_date.trim()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.due_date.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "due_date must be YYYY-MM-DD format",
        path: ["due_date"],
      });
    }
  }
  if (data.due_time && data.due_time.trim()) {
    if (!data.due_date || !data.due_date.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "due_time cannot be specified without due_date",
        path: ["due_time"],
      });
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.due_time.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "due_time must be HH:mm 24-hour format",
        path: ["due_time"],
      });
    }
  }
});

export const PublicTaskSchema = z.object({
  task_id: z.string(),
  subject_id: z.string(),
  title: z.string(),
  task_type: TaskTypeEnum,
  description: z.string().optional(),
  groups: z.array(z.string()),
  due_date: z.string().nullable().optional(),
  due_time: z.string().nullable().optional(),
  related_material_ids: z.array(z.string()),
  task_status: TaskStatusEnum,
  created_on: z.string(),
  updated_on: z.string(),
  publish_status: z.literal("PUBLISHED"),
});

export const RawSessionSchema = z.object({
  session_id: z.string().regex(/^ses-[0-9]{4,}$/),
  subject_id: z.string(),
  session_type: SessionTypeEnum,
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().optional().default(""),
  end_time: z.string().optional().default(""),
  groups: z.string().min(1),
  location: z.string().optional().default(""),
  note: z.string().optional().default(""),
  status: SessionStatusEnum,
}).superRefine((data, ctx) => {
  const startTime = data.start_time?.trim() || "";
  const endTime = data.end_time?.trim() || "";
  if (startTime) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "start_time must be HH:mm 24-hour format",
        path: ["start_time"],
      });
    }
  }
  if (endTime) {
    if (!startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "end_time cannot be specified without start_time",
        path: ["end_time"],
      });
    } else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "end_time must be HH:mm 24-hour format",
        path: ["end_time"],
      });
    } else if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "end_time must be strictly after start_time",
        path: ["end_time"],
      });
    }
  }
});

export const PublicSessionSchema = z.object({
  session_id: z.string(),
  subject_id: z.string(),
  session_type: SessionTypeEnum,
  session_date: z.string(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  groups: z.array(z.string()),
  location: z.string().optional(),
  note: z.string().optional(),
  status: SessionStatusEnum,
});

export const PublicDataSchema = z.object({
  subjects: z.array(SubjectSchema),
  materials: z.array(PublicMaterialSchema),
  tasks: z.array(PublicTaskSchema),
  sessions: z.array(PublicSessionSchema),
  meta: z.object({
    updated_at: z.string(),
    environment: z.enum(["production", "development", "preview"]),
    is_demo: z.boolean(),
  }),
});

export type Subject = z.infer<typeof SubjectSchema>;
export type RawMaterial = z.infer<typeof RawMaterialSchema>;
export type PublicMaterial = z.infer<typeof PublicMaterialSchema>;
export type RawTask = z.infer<typeof RawTaskSchema>;
export type PublicTask = z.infer<typeof PublicTaskSchema>;
export type RawSession = z.infer<typeof RawSessionSchema>;
export type PublicSession = z.infer<typeof PublicSessionSchema>;
export type PublicData = z.infer<typeof PublicDataSchema>;
