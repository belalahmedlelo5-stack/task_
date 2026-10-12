# TASKS — Data Dictionary & Google Sheets Data Contract

**Specification:** V1.0 Fall 2026/2027  
**Spreadsheet Title:** `TASKS_DB_FALL_2026_2027`

All four tabs must exist in the spreadsheet. Column headers must occupy Row 1 exactly as spelled below (case-sensitive). Cell formatting for dates and times should be set to **Plain Text** to prevent automatic formatting alterations by Google Sheets.

---

## 1. Tab: `Subjects`

Lists the seven core academic subjects for Biotechnology Level 4.

| Column | Type / Format | Required | Allowed Values / Validation | Description |
|---|---|---|---|---|
| `subject_id` | string (kebab-case) | YES | `^[a-z0-9-]+$` (Unique PK) | Immutable slug identifier (e.g., `stem-cell-biology`) |
| `name_en` | string | YES | Non-empty string | Official English title of the course |
| `name_ar` | string | NO | Arabic string or blank | Optional Arabic display title |
| `course_code` | string | NO | Alphanumeric (e.g., `MBGT309`) | Official university course code |
| `sort_order` | integer | YES | 1 to 7 | Sequence in UI navigation and cards |
| `status` | string (enum) | YES | `ACTIVE`, `ARCHIVED` | Only `ACTIVE` subjects are displayed to students |

---

## 2. Tab: `Materials`

Lists course materials uploaded to Google Drive.

| Column | Type / Format | Required | Allowed Values / Validation | Description |
|---|---|---|---|---|
| `material_id` | string | YES | `^mat-[0-9]{4,}$` (Unique PK) | Unique identifier (e.g., `mat-0001`) |
| `subject_id` | string | YES | Must exist in `Subjects.subject_id` | Foreign key referencing course |
| `category` | string (enum) | YES | `LECTURE`, `SECTION`, `TUTORIAL`, `QUESTIONS`, `SUPPLEMENT`, `OTHER` | Category tab grouping |
| `title` | string | YES | Non-empty descriptive title | Human-friendly title displayed in UI |
| `sequence_no` | integer | NO | 1 to 99 or empty | Lecture or section sequence number |
| `groups` | string | YES | `ALL`, `A`, `B`, `C` or comma-separated `A,B` | Applicable student groups |
| `drive_url` | string (URL) | YES if PUBLISHED | Valid HTTPS URL matching `drive.google.com` or `docs.google.com` | Direct viewer link to file in Drive |
| `original_filename` | string | NO | Text | Original filename from source archive |
| `added_on` | string (date) | YES if PUBLISHED | `YYYY-MM-DD` (Cairo date) | Date published |
| `status` | string (enum) | YES | `DRAFT`, `PUBLISHED`, `ARCHIVED` | Only `PUBLISHED` rows are served in API |
| `notes` | string | NO | Text | Admin-only internal remarks (**never exposed in public API**) |

---

## 3. Tab: `Tasks`

Tracks homework assignments, presentations, quizzes, and project milestones.

| Column | Type / Format | Required | Allowed Values / Validation | Description |
|---|---|---|---|---|
| `task_id` | string | YES | `^tsk-[0-9]{4,}$` (Unique PK) | Unique identifier (e.g., `tsk-0001`) |
| `subject_id` | string | YES | Must exist in `Subjects.subject_id` | Foreign key referencing course |
| `title` | string | YES | Non-empty concise title | Display title for task card |
| `task_type` | string (enum) | YES | `ASSIGNMENT`, `PRESENTATION`, `DISCUSSION`, `RESEARCH`, `QUIZ`, `EXAM`, `OTHER` | Classification badge type |
| `description` | string | NO | Plain text (no HTML) | Detailed assignment prompt/instructions |
| `groups` | string | YES | `ALL`, `A`, `B`, `C` or comma-separated list | Target student groups |
| `due_date` | string (date) | NO | `YYYY-MM-DD` (Cairo date) or blank | Optional deadline date |
| `due_time` | string (time) | NO | `HH:mm` (24-hour Cairo time) or blank | Optional deadline time (requires `due_date`) |
| `related_material_ids` | string | NO | Pipe-delimited IDs (e.g., `mat-0001\|mat-0002`) | Associated reference materials |
| `task_status` | string (enum) | YES | `OPEN`, `CLOSED`, `CANCELLED` | Batch status set by admins |
| `created_on` | string (date) | YES | `YYYY-MM-DD` | Date task was posted |
| `updated_on` | string (date) | YES | `YYYY-MM-DD` | Date last modified |
| `publish_status` | string (enum) | YES | `DRAFT`, `PUBLISHED`, `ARCHIVED` | Only `PUBLISHED` rows are visible to students |

---

## 4. Tab: `Sessions`

Tracks class lectures, laboratory sections, and tutorials by date with group rotation.

| Column | Type / Format | Required | Allowed Values / Validation | Description |
|---|---|---|---|---|
| `session_id` | string | YES | `^ses-[0-9]{4,}$` (Unique PK) | Unique identifier (e.g., `ses-0001`) |
| `subject_id` | string | YES | Must exist in `Subjects.subject_id` | Foreign key referencing course |
| `session_type` | string (enum) | YES | `LECTURE`, `SECTION`, `TUTORIAL`, `LAB`, `OTHER` | Session category |
| `session_date` | string (date) | YES | `YYYY-MM-DD` | Exact calendar date of occurrence |
| `start_time` | string (time) | NO | `HH:mm` (24-hour Cairo time) | Starting time |
| `end_time` | string (time) | NO | `HH:mm` (24-hour Cairo time) | Ending time (must be after `start_time`) |
| `groups` | string | YES | `ALL`, `A`, `B`, `C`, `A,B`, `TBD` | Targeted cohort group |
| `location` | string | NO | Text (e.g., `Hall 3`, `Lab B4`) | Physical location |
| `note` | string | NO | Text | Announcement or special instruction |
| `status` | string (enum) | YES | `SCHEDULED`, `CANCELLED`, `TENTATIVE` | Session scheduling status |

---

## 5. Security & Privacy Rules

1. **Server-Side Only Access:** Google Sheets API credentials must never be accessed or exposed on client browsers.
2. **Exclusion of Admin Notes:** The `notes` field in `Materials` is stripped during normalization before transmission to the client.
3. **Draft / Archived Suppression:** Any row where `status !== 'PUBLISHED'` (or `status !== 'ACTIVE'`) is filtered out before reaching `/api/public-data`.
4. **URL Sanitation:** Any Drive link that does not start with HTTPS or does not originate from `drive.google.com` or `docs.google.com` is flagged as invalid and excluded.
