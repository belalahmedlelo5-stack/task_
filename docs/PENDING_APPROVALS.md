# TASKS — Pending Owner Decisions & Approvals

**Date:** 2026-10-12  
**Status:** Awaiting Project Owner Decisions

The following items cannot and must not be fabricated by the agent. Each requires an explicit human/administrative decision prior to production activation.

---

## 1. Material Content Verifications

1. **`Fertilization and Early Embryonic Development.pdf`**
   - *Current assignment:* `stem-cell-biology` (as LECTURE)
   - *Question for Owner:* Confirm whether this lecture officially belongs to the Stem Cell Biology curriculum for Fall 2026/2027.
   - *Action if rejected:* Reassign to correct subject or move to EXCLUDE.

2. **`Presentation1.pdf` and `Presentation4.pdf`**
   - *Current assignment:* `communication-cell-signaling`
   - *Question for Owner:* Verify lecture titles, sequence numbers, and confirm these are Cell Signaling lectures. Provide descriptive student-facing titles.

3. **`sec 2 industerial and microbial genetics-1.pdf` (652 KB) vs `sec 2 industerial and microbial genetics.pdf` (83 KB)**
   - *Current assignment:* Both under `industry-bacterial-biotechnology` (SECTION, sequence 2)
   - *Question for Owner:* Compare content between the 652KB and 83KB files. Which is the active official practical session, or are both needed (e.g. part 1 vs part 2)?

4. **`Stem Cell Biology Sec 3.pdf` (905 KB) vs `Stem Cell Sec 3.pdf` (958 KB)**
   - *Current assignment:* Both under `stem-cell-biology` (SECTION, sequence 3)
   - *Question for Owner:* Are these two distinct topics taught in Section 3, or two drafts? Provide distinct titles if both are retained.

5. **`gene therapy 1.pptx` (7.4 MB) vs `Gene Therapy MBGT309 L 1.pdf` (897 KB)**
   - *Question for Owner:* Confirm whether PPTX is identical in content to the PDF or contains extra notes/slides. Should both be available to students?

6. **`teaching mapforDNA technology.docx`**
   - *Question for Owner:* Verify if this teaching map corresponds to the active Fall 2026/2027 syllabus or an older archived term.

7. **`Biotech Logbook  4th_year biotechnology doc.pdf` (HOLD)**
   - *Question for Owner:* Is this logbook intended for public distribution to all students in the batch? If approved, under which subject or general category?

---

## 2. Infrastructure & Credentials Required for Phase 2 & 3

1. **Google Drive Root Folder:**
   - Dedicated folder: `TASKS - Biotechnology - Level 4 - Fall 2026-2027/`
   - 7 subject subfolders with standard 5 categories: `Lectures/`, `Sections/`, `Tutorials/`, `Questions/`, `Supplements/`.
   - Sharing policy: Owner chooses either "Anyone with link can view" or domain-restricted.

2. **Google Sheets Database:**
   - Create private spreadsheet named `TASKS_DB_FALL_2026_2027`.
   - Four required sheets: `Subjects`, `Materials`, `Tasks`, `Sessions` (headers specified in `docs/DATA_DICTIONARY.md`).
   - Import initial seed data from `seed/*.csv`.

3. **Google Service Account Credentials:**
   - GCP Service Account with `spreadsheets.readonly` scope.
   - Share the private spreadsheet with the service account email as **Viewer**.
   - Provide server-only environment variables:
     - `GOOGLE_SHEET_ID`
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`

4. **Official Academic Schedules & Tasks:**
   - Initial tasks and confirmed deadlines from faculty/department.
   - Weekly lecture and laboratory session schedules with explicit room/hall numbers and dates for A/B rotation.
