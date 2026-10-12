# TASKS — Quality Assurance (QA) & Testing Report

**Date:** 2026-10-12  
**Platform:** Next.js 14 App Router (Node.js v24.15.0)  
**Target:** TASKS — Level 4 Biotechnology Academic Portal

---

## 1. Automated Test Suite Execution

### 1.1 Unit & Contract Tests (`npm run test`)
- **Framework:** Node Test Runner (`node --import tsx --test`)
- **Total Tests:** 21
- **Passed:** 21 (100%)
- **Failed:** 0
- **Suites Covered:**
  - `tests/unit/schema.test.ts`: Zod validation for Subjects, Materials, Tasks, Sessions, and Google Drive URL domain security.
  - `tests/unit/normalize.test.ts`: Data normalization, strip confidential admin notes, filter DRAFT and ARCHIVED items, and isolate malformed rows.
  - `tests/unit/cairo.test.ts`: `Africa/Cairo` timezone calculations, overdue status checking with/without `due_time`, and Arabic deadline formatting.
  - `tests/unit/group-filter.test.ts`: Cohort filtering rules (`ALL`, `A`, `B`, `C`), including unconfirmed `TBD` sessions visible to all cohorts.
  - `tests/unit/student-preferences.test.ts`: `localStorage` keys and fallbacks for server-side environments.

### 1.2 Data Contract Validation (`npm run validate:data`)
- **Script:** `scripts/validate-data.ts`
- **Rows Processed:**
  - Subjects: 7 (All 7 active Level 4 courses validated)
  - Materials: 32 (30 drafts mapped to 7 subjects, 1 HOLD, 1 EXCLUDE)
  - Tasks: 0 (No fabricated tasks in seed)
  - Sessions: 0 (No fabricated sessions in seed)
- **Status:** PASS (Exit code 0, 0 validation errors)

### 1.3 TypeScript Strict Mode (`npm run typecheck`)
- **Command:** `tsc --noEmit`
- **Result:** Exit code 0, 0 type errors.

### 1.4 Code Quality & Linting (`npm run lint`)
- **Command:** `next lint`
- **Result:** Exit code 0, 0 warnings, 0 errors.

---

## 2. Security & Privacy Audit

1. **Client Payload Inspection:**
   - Evaluated public JSON output from `/api/public-data`.
   - Admin notes (`notes` column) are strictly omitted from `PublicMaterialSchema`.
   - Zero API keys, private keys, or service account emails are leaked in browser HTML/JS bundle.
   - All secret environment variables (`GOOGLE_PRIVATE_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SHEET_ID`) reside on the server only.
2. **Drive URL Sandboxing:**
   - URLs must strictly use `https:` and originate from `drive.google.com` or `docs.google.com`.
   - Links in the UI open via `target="_blank"` with `rel="noopener noreferrer"`.
3. **No Student Tracking:**
   - No database stores student IDs or progress.
   - Group preference and completed task IDs reside exclusively within client `localStorage`.

---

## 3. Responsive Layout & Accessibility Verification

- **Tested Breakpoints:**
  - `360px` (Small Mobile / Galaxy Fold / SE): Verified zero horizontal scroll overflow (`overflow-x: hidden` / flex wrapping).
  - `390px` (Modern Mobile / iPhone 12-15): Clean touch targets (≥44px height), responsive sticky header with toggleable navigation.
  - `768px` (Tablet / iPad): Two-column subject layout, inline filter pills.
  - `1280px` (Desktop): Three-column subject cards, max container width `1152px` (`max-w-6xl`) with margins.
- **RTL Language Support:**
  - `dir="rtl"` declared on `<html>` tag.
  - Proper text alignment (`text-right`), right-side navigation icons, and left-side action buttons.
  - Scientific course names maintain standard English typography.
