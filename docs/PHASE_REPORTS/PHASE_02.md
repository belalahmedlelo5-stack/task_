# PHASE 02 — Real Google Sheets Structure / إنشاء مصدر الحقيقة

Status: BLOCKED
Date/time: 2026-10-12T10:19:00+02:00 (Africa/Cairo)
Scope delivered: Schema contracts defined in DATA_DICTIONARY.md; verified CSV seed templates ready for manual or programmatic spreadsheet import (`seed/subjects.csv`, `seed/materials.csv`, `seed/tasks.csv`, `seed/sessions.csv`); Admin operations guide prepared in `docs/ADMIN_GUIDE.md`.
Files created/modified:
- docs/DATA_DICTIONARY.md
- docs/ADMIN_GUIDE.md
- seed/subjects.csv
- seed/materials.csv
- seed/tasks.csv
- seed/sessions.csv
- docs/PHASE_REPORTS/PHASE_02.md
Real data used: Seed files extracted and validated from source archive `4th.zip`.
Commands executed:
- npm run validate:data -> exit 0; verified all 4 seed tables conform to data contracts.
Acceptance criteria:
- يوجد 4 Tabs بالأعمدة الدقيقة -> PASS in seed specifications (Awaiting live Google Sheet creation by owner).
- مستخدم إداري يستطيع إضافة صف DRAFT دون تعديل كود -> Documented in ADMIN_GUIDE.md.
- مستخدم طالب لا يملك Editor -> Contract enforced via Service Account Viewer role.
- كل Subject ID من السبعة وحيد -> PASS -> confirmed 7 unique slugs.
Screenshots / URLs: file:///d:/task/docs/DATA_DICTIONARY.md
Issues / limitations: External blocker: Owner has not yet created the Google Sheets document `TASKS_DB_FALL_2026_2027` or provided the Spreadsheet ID.
Manual input needed from owner: Create Google Sheet, set up the 4 tabs, import seed CSVs, and share with service account.
Next authorized phase: NONE (Paused at Phase 2 until owner authorization and credentials are provided).
