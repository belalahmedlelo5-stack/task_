import { NextResponse } from "next/server";
import { getPublicData } from "@/lib/data/public-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getPublicData();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        error: "Failed to load public data",
        message,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
