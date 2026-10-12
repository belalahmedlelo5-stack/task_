# PHASE 01 — Repository & Running App / تشغيل أساس المشروع

Status: PASS
Date/time: 2026-10-12T10:18:00+02:00 (Africa/Cairo)
Scope delivered: Fully configured and running Next.js 14 App Router codebase with TypeScript strict mode, Tailwind CSS RTL configuration, all required navigation routes, error and empty states, responsive layout, and client-side preferences.
Files created/modified:
- package.json
- tsconfig.json
- tailwind.config.ts
- postcss.config.js
- .eslintrc.json
- .gitignore
- .env.example
- README.md
- app/layout.tsx
- app/globals.css
- app/page.tsx
- app/subjects/page.tsx
- app/subjects/[subjectId]/page.tsx
- app/tasks/page.tsx
- app/schedule/page.tsx
- app/about/page.tsx
- app/not-found.tsx
- app/api/public-data/route.ts
- components/layout/Header.tsx
- components/layout/Footer.tsx
- components/layout/GroupSelector.tsx
- components/tasks/TaskCard.tsx
- components/tasks/TaskList.tsx
- components/tasks/TaskFilters.tsx
- components/materials/MaterialRow.tsx
- components/materials/MaterialList.tsx
- components/schedule/SessionCard.tsx
- components/schedule/ScheduleView.tsx
- components/shared/Badge.tsx
- components/shared/EmptyState.tsx
- components/shared/SearchInput.tsx
- docs/PHASE_REPORTS/PHASE_01.md
Real data used: Local development DEMO fixtures with explicit `is_demo: true` fallback
Commands executed:
- npm run lint -> exit 0 (0 warnings, 0 errors)
- npm run typecheck -> exit 0 (0 errors)
- npm run build -> exit 0 (all 8 static/dynamic routes generated)
- npm run test -> exit 0 (21 unit tests passed)
- Live server test -> exit 0; Status 200 on /, /subjects, /subjects/stem-cell-biology, /tasks, /schedule, /about, /api/public-data; 404 on /subjects/non-existent-subject
Acceptance criteria:
- npm install, npm run lint, npm run typecheck, npm run build كلها exit code 0 -> PASS -> verified
- جميع الصفحات 200 -> PASS -> verified on localhost:3000
- 404 صحيح لمسار مادة غير موجود -> PASS -> verified on /subjects/non-existent-subject
- لا يوجد مفتاح سري في الـ Git -> PASS -> .gitignore configured and verified
Screenshots / URLs: http://localhost:3000/
Issues / limitations: None within repository scope.
Manual input needed from owner: None for Phase 1.
Next authorized phase: PHASE 2
