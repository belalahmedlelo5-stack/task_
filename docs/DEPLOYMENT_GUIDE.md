# TASKS — Deployment & Infrastructure Guide

This guide describes how to configure the Google Cloud Service Account and deploy the Next.js application to Vercel.

---

## 1. Google Cloud Service Account Configuration

1. Log into Google Cloud Console (`console.cloud.google.com`).
2. Create or select a project (e.g., `biotech-tasks-portal`).
3. Enable the **Google Sheets API**:
   - Navigation: *APIs & Services > Library > Google Sheets API > Enable*.
4. Create a Service Account:
   - Navigation: *APIs & Services > Credentials > Create Credentials > Service Account*.
   - Name: `tasks-sheets-reader`.
   - Role: None required at project level (access is scoped directly on the spreadsheet).
5. Generate a Key:
   - Click on the created service account > *Keys* tab > *Add Key > Create new key > JSON*.
   - Download the JSON key file securely.
6. Share the Spreadsheet:
   - Open `TASKS_DB_FALL_2026_2027` in Google Sheets.
   - Click *Share* button.
   - Enter the Service Account email address (e.g. `tasks-sheets-reader@...gserviceaccount.com`).
   - Grant role: **Viewer**. Uncheck "Notify people" and save.

---

## 2. Environment Variables Configuration

In `.env.local` for local development, and in Vercel Project Settings for production:

```bash
# Private server-side credentials (NEVER prefix with NEXT_PUBLIC_)
GOOGLE_SHEET_ID=1a2B3c4D5e...
GOOGLE_SERVICE_ACCOUNT_EMAIL=tasks-sheets-reader@biotech-tasks-portal.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Public configuration
NEXT_PUBLIC_APP_NAME=TASKS
```

*Note on Newlines:* When pasting `GOOGLE_PRIVATE_KEY` in Vercel, ensure literal `\n` linebreaks are preserved or parsed with `.replace(/\\n/g, '\n')` in server code.

---

## 3. Vercel Deployment

1. Push code repository to GitHub (ensure `.env*` files are ignored).
2. In Vercel Dashboard, select *Add New... > Project*.
3. Import the Git repository.
4. Framework Preset: **Next.js**.
5. Add the Environment Variables from Section 2.
6. Click **Deploy**.

---

## 4. Cache & Refresh Verification

- The application endpoint `/api/public-data` sets:
  `Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=60`
- Updates to the Google Sheet propagate to all users globally within 60 to 300 seconds.
