/**
 * SERVER ONLY — Google Sheets API Client
 * Supports both Google Service Account (JWT) and public sheet direct sync.
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
  return Boolean(process.env.GOOGLE_SHEET_ID);
}

/**
 * Creates Google OAuth 2.0 access token using Service Account JWT
 */
async function getGoogleAccessToken(
  clientEmail: string,
  privateKeyPem: string
): Promise<string> {
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
      continue;
    }

    const obj: RawSheetRow = {};
    headers.forEach((header, colIndex) => {
      if (header) {
        obj[header] = row[colIndex] ? String(row[colIndex]).trim() : "";
      }
    });
    rows.push(obj);
  }

  return rows;
}

/**
 * Parses RFC 4180 CSV text into objects based on header row
 */
function parseCsvToObjects(csvText: string): RawSheetRow[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\r") {
        // ignore carriage return
      } else if (char === "\n") {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rowsToObjects(rows);
}

/**
 * Fetches sheet data via public Google visualization CSV export
 */
async function fetchTabCsv(sheetId: string, tabName: string): Promise<RawSheetRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&headers=1&t=${Date.now()}`;
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tab ${tabName}: ${res.status} ${res.statusText}`);
  }

  const csvText = await res.text();
  return parseCsvToObjects(csvText);
}

/**
 * Executes batchGet via Service Account or fallback to direct public sync
 */
export async function fetchRawDataFromSheets(): Promise<GoogleSheetsRawData> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID in environment variables.");
  }

  // If Service Account is fully configured, use official Google Sheets batchGet API
  if (clientEmail && privateKey) {
    try {
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
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (response.ok) {
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
    } catch (e) {
      console.warn("[Sheets Server] Service account failed, falling back to direct sync:", e);
    }
  }

  // Direct sync mode (works with publicly viewable sheets)
  const [subjects, materials, tasks, sessions] = await Promise.all([
    fetchTabCsv(sheetId, "Subjects"),
    fetchTabCsv(sheetId, "Materials"),
    fetchTabCsv(sheetId, "Tasks"),
    fetchTabCsv(sheetId, "Sessions"),
  ]);

  return { subjects, materials, tasks, sessions };
}
