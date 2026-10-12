/**
 * SERVER ONLY — Google Sheets API Client
 * Uses Google Service Account to execute a single batchGet across all 4 tabs.
 * Never import this file into Client Components.
 */

interface RawSheetRow {
  [key: string]: string;
}

export interface GoogleSheetsRawData {
  subjects: RawSheetRow[];
  materials: RawSheetRow[];
  tasks: RawSheetRow[];
  sessions: RawSheetRow[];
}

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

/**
 * Creates Google OAuth 2.0 access token using Service Account JWT via standard crypto/fetch
 */
async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string
): Promise<string> {
  // Use Node crypto
  const crypto = await import("crypto");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedClaim = Buffer.from(JSON.stringify(claimSet)).toString("base64url");
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  signer.end();

  // Normalize private key escaped newlines
  const normalizedKey = privateKeyPem.replace(/\\n/g, "\n");
  const signature = signer.sign(normalizedKey, "base64url");
  const jwt = `${signatureInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    throw new Error(`Failed to obtain Google access token: ${tokenRes.status} ${errorBody}`);
  }

  const tokenJson = (await tokenRes.json()) as { access_token: string };
  return tokenJson.access_token;
}

/**
 * Converts 2D array of rows into list of objects based on header row
 */
function rowsToObjects(values?: string[][]): RawSheetRow[] {
  if (!values || values.length <= 1) return [];
  const headers = values[0].map((h) => h.trim());
  const rows: RawSheetRow[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0 || row.every((cell) => !cell || !cell.trim())) {
      continue; // Skip empty row
    }

    const obj: RawSheetRow = {};
    headers.forEach((header, colIndex) => {
      obj[header] = row[colIndex] ? String(row[colIndex]).trim() : "";
    });
    rows.push(obj);
  }

  return rows;
}

/**
 * Executes a single batchGet request to retrieve Subjects, Materials, Tasks, and Sessions
 */
export async function fetchRawDataFromSheets(): Promise<GoogleSheetsRawData> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !clientEmail || !privateKey) {
    throw new Error("Missing Google Sheets credentials in environment variables.");
  }

  const token = await getGoogleAccessToken(clientEmail, privateKey);

  const ranges = [
    "Subjects!A1:Z",
    "Materials!A1:Z",
    "Tasks!A1:Z",
    "Sessions!A1:Z",
  ];

  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchGet`);
  ranges.forEach((r) => url.searchParams.append("ranges", r));
  url.searchParams.append("valueRenderOption", "UNFORMATTED_VALUE");
  url.searchParams.append("dateTimeRenderOption", "FORMATTED_STRING");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    // We handle caching at the route level
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Sheets API batchGet error: ${response.status} ${errorBody}`);
  }

  const result = (await response.json()) as {
    valueRanges?: Array<{ range: string; values?: string[][] }>;
  };

  const valueRanges = result.valueRanges || [];

  return {
    subjects: rowsToObjects(valueRanges[0]?.values),
    materials: rowsToObjects(valueRanges[1]?.values),
    tasks: rowsToObjects(valueRanges[2]?.values),
    sessions: rowsToObjects(valueRanges[3]?.values),
  };
}
