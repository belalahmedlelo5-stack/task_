# TASKS — Biotechnology Level 4 Portal

> Academic portal for Biotechnology Level 4 (Fall 2026/2027), providing mobile-first centralized access to courses, study materials, assignments, deadlines, and alternating laboratory schedules.

---

## Architecture & Principles
- **Student UX:** Mobile-first, Arabic RTL interface with standard English scientific course names. No student login, no tracking, completely ad-free.
- **Admin Workflow:** Managed directly via Google Sheets and Google Drive. Changes appear automatically on the portal within ≤ 5 minutes without redeploying.
- **Data Privacy:** Personal task completion status is kept strictly inside the student's personal device browser via `localStorage`.

---

## Project Structure
```text
tasks/
├── app/                  # Next.js App Router routes & API
├── components/           # UI components (Layout, Tasks, Materials, Schedule, Shared)
├── lib/
│   ├── google/           # Server-only Google Sheets client
│   ├── data/             # Zod schemas, normalization, and public services
│   ├── date/             # Cairo timezone calculation & formatting
│   └── storage/          # LocalStorage student preferences
├── docs/                 # Operational guides & Phase acceptance reports
├── seed/                 # CSV seed data for the 4 Google Sheets tabs
├── scripts/              # Validation scripts (npm run validate:data)
└── tests/                # Unit and regression tests
```

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+

### Setup
```bash
npm install
npm run dev
```

### Running Validation and Tests
```bash
npm run lint           # ESLint validation
npm run typecheck      # TypeScript strict mode verification
npm run test           # Unit test suite
npm run validate:data  # Schema verification on seed data
npm run build          # Next.js production build
```
