# TASKS — Admin Content Operations Guide

This guide describes how batch representatives and course coordinators manage course content, tasks, and section rotations in Google Sheets without modifying any application code.

---

## 1. Daily Administration Model

The application operates as a read-only viewer powered by Google Sheets.
- **Admin Interface:** The Google Sheets spreadsheet `TASKS_DB_FALL_2026_2027`.
- **File Storage:** Google Drive folder `TASKS - Biotechnology - Level 4 - Fall 2026-2027/`.
- **Propagation Time:** Changes made in Google Sheets become visible on the website within **at most 5 minutes** without any build or deployment steps.

---

## 2. Managing Course Materials

### Step-by-Step: Adding a New Lecture or Section File
1. Open the course folder in Google Drive:
   `TASKS - Biotechnology - Level 4 - Fall 2026-2027 / [Subject Name] / [Lectures or Sections]`
2. Upload the PDF or PPTX file.
3. Configure sharing permissions:
   - Set to **Anyone with the link can view** (Viewer permission only).
   - Test the link in a private/incognito window to ensure no login is requested.
4. Open the `Materials` tab in Google Sheets.
5. Append a new row with:
   - `material_id`: Next sequential ID (e.g. `mat-0033`).
   - `subject_id`: Matching subject slug (e.g. `stem-cell-biology`).
   - `category`: `LECTURE`, `SECTION`, `TUTORIAL`, `QUESTIONS`, or `SUPPLEMENT`.
   - `title`: Clean, descriptive title (e.g. `Lecture 4 — Adult Stem Cells`).
   - `sequence_no`: Lecture or section number (e.g. `4`).
   - `groups`: `ALL` (or specific groups like `A` or `A,B`).
   - `drive_url`: Paste the full HTTPS link from Google Drive.
   - `original_filename`: Actual uploaded filename.
   - `added_on`: Current date in Cairo (`YYYY-MM-DD`).
   - `status`: Set to `DRAFT` while reviewing; change to `PUBLISHED` when ready.
   - `notes`: Internal admin notes (hidden from students).

---

## 3. Managing Assignments and Tasks

### Adding a Task
1. Open the `Tasks` tab in Google Sheets.
2. Add a new row:
   - `task_id`: Unique identifier (e.g. `tsk-0001`).
   - `subject_id`: Corresponding subject slug.
   - `title`: Short summary (e.g. `Assignment 1: Isolation Protocol`).
   - `task_type`: `ASSIGNMENT`, `PRESENTATION`, `DISCUSSION`, `RESEARCH`, `QUIZ`, `EXAM`, or `OTHER`.
   - `description`: Explicit instructions and submission directions.
   - `groups`: `ALL`, `A`, `B`, or `C`.
   - `due_date`: `YYYY-MM-DD` (leave empty if faculty has not announced deadline).
   - `due_time`: `HH:mm` in Cairo local time (only if `due_date` is provided).
   - `related_material_ids`: Pipe-separated material IDs (e.g. `mat-0002|mat-0005`).
   - `task_status`: `OPEN` (active) or `CLOSED` (completed for whole batch).
   - `created_on`: Today's date (`YYYY-MM-DD`).
   - `updated_on`: Today's date (`YYYY-MM-DD`).
   - `publish_status`: `PUBLISHED`.

*Note:* A student checking off a task on their phone stores the status only in their browser's `localStorage`. Setting `task_status=CLOSED` in the spreadsheet marks the task finished for the entire batch.

---

## 4. Managing Section Schedules & A/B Rotation

### Alternating Laboratory Sessions
The alternating lab schedule (e.g., Group A this week, Group B next week) is **never automated**. The admin assigns the group manually for every physical session date.

1. Open the `Sessions` tab in Google Sheets.
2. Add a row for the session date:
   - `session_id`: e.g. `ses-0001`.
   - `subject_id`: Corresponding subject slug.
   - `session_type`: `SECTION` or `LAB`.
   - `session_date`: `YYYY-MM-DD` of the actual session.
   - `start_time` and `end_time`: `HH:mm` (e.g., `09:00` and `11:00`).
   - `groups`: `A` (if Group A attends) or `B` (if Group B attends). If tentative/unconfirmed, enter `TBD`.
   - `location`: Lab room name or hall (e.g. `Lab 204`).
   - `status`: `SCHEDULED` (or `TENTATIVE` if date/room is awaiting confirmation).

### Rescheduling or Cancelling a Session
- Do not delete past rows. Update the row with `status=CANCELLED` and add details in `note`.

---

## 5. Emergency Rollback / Unpublishing

- To hide a task or material immediately, change its status to `ARCHIVED` in Google Sheets.
- If a sensitive file was inadvertently linked, **revoke sharing permissions directly in Google Drive** as well as setting status to `ARCHIVED`.
