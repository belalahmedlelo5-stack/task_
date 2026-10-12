import { PublicData } from "./schema";
import { normalizeAllData } from "./normalize";
import { DEMO_PUBLIC_DATA } from "./fixtures";
import { fetchRawDataFromSheets, isGoogleSheetsConfigured } from "@/lib/google/sheets-server";

// Cache for public data to reduce external API overhead
let cachedData: PublicData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 1000; // 2 seconds for instant sheet reactivity

export async function getPublicData(): Promise<PublicData> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedData;
  }

  const isConfigured = isGoogleSheetsConfigured();
  const environment = (process.env.NODE_ENV === "production" ? "production" : "development") as
    | "production"
    | "development";

  if (!isConfigured) {
    if (process.env.STRICT_PROD_SHEETS === "true") {
      // In strict production mode, reject missing credentials
      throw new Error(
        "Google Sheets integration is not configured. Server credentials must be set in production environment variables."
      );
    }

    // In local development / preview / build environments, use strictly flagged DEMO fixtures
    cachedData = DEMO_PUBLIC_DATA;
    lastFetchTime = now;
    return DEMO_PUBLIC_DATA;
  }

  try {
    const rawData = await fetchRawDataFromSheets();
    const { data, errors } = normalizeAllData(rawData, environment, false);

    if (errors.length > 0) {
      console.warn(`[TASKS Data Normalization] Encountered ${errors.length} invalid rows:`, errors);
    }

    cachedData = data;
    lastFetchTime = now;
    return data;
  } catch (error) {
    console.error("[TASKS Public Data Service] Error fetching from Google Sheets:", error);

    // If we have an existing cache, serve stale
    if (cachedData) {
      console.info("[TASKS Public Data Service] Serving stale cached data due to API error.");
      return cachedData;
    }

    if (environment === "production") {
      throw error;
    }

    // In development fallback to demo
    console.warn("[TASKS Public Data Service] Falling back to local DEMO fixtures in development mode.");
    return DEMO_PUBLIC_DATA;
  }
}
