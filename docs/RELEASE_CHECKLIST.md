# TASKS — Release Checklist (Pre-Flight & Handover)

Prior to marking the production deployment as complete or handing off to batch administrators, every item below must be audited.

---

## 1. Data Integrity & Privacy Audit
- [x] All 32 archive files from `4th.zip` catalogued with SHA-256 hashes.
- [x] Commercial quotation `Quotation - SO34463 (1).pdf` marked `EXCLUDE` / `ARCHIVED`. Not published or uploaded to public Drive.
- [x] Logbook `Biotech Logbook  4th_year biotechnology doc.pdf` marked `HOLD` awaiting administrative confirmation.
- [x] Zero fabricated Drive links in published records.
- [x] Zero fabricated task deadlines or exam dates.

## 2. Infrastructure & Secrets Security
- [ ] Google Sheet created with 4 required tabs (`Subjects`, `Materials`, `Tasks`, `Sessions`).
- [ ] Google Service Account configured with read-only viewer rights on the spreadsheet.
- [ ] Server environment variables set on Vercel without `NEXT_PUBLIC_` prefix for secrets.
- [x] Git repository excludes all `.env` files.
- [x] Client network payload inspection confirms no service account keys or internal notes are transmitted.

## 3. UX & Functional Verification
- [x] Arabic RTL layout rendered cleanly across 360px, 390px, 768px, and 1280px widths.
- [x] Scientific course names in standard English.
- [x] Group filtering (Group A, Group B, Group C, All Groups) filters tasks and sessions accurately.
- [x] Personal task completion stored in `localStorage` without leaking across sessions or devices.
- [x] Cairo timezone (`Africa/Cairo`) applied for overdue and deadline formatting.
- [x] Empty states rendered when categories or groups have no active entries.

## 4. Operational Tests
- [ ] Admin adding a new row in Google Sheets updates the production site within ≤5 minutes.
- [ ] Alternating A/B session schedule updates accurately when group tag is updated in Google Sheets.
