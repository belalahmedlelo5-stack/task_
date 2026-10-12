import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../../app/api/public-data/route";
import { PublicDataSchema } from "../../lib/data/schema";

test("E2E: /api/public-data returns valid PublicData schema with proper cache headers", async () => {
  const response = await GET();

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("Cache-Control"),
    "public, max-age=0, s-maxage=60, stale-while-revalidate=60"
  );
  assert.match(
    response.headers.get("Content-Type") || "",
    /application\/json/
  );

  const json = await response.json();
  const parsed = PublicDataSchema.safeParse(json);
  assert.equal(parsed.success, true, "Response JSON must conform to PublicDataSchema");

  if (parsed.success) {
    const data = parsed.data;

    // Zero secret leaks
    const jsonString = JSON.stringify(data);
    assert.equal(jsonString.includes("private_key"), false);
    assert.equal(jsonString.includes("client_email"), false);

    // No admin notes leaked
    data.materials.forEach((m) => {
      assert.equal((m as unknown as Record<string, unknown>).notes, undefined);
      // Drive URL validation
      assert.match(m.drive_url, /^https:\/\/(drive|docs)\.google\.com\//);
    });

    // Zero excluded commercial quotation
    const hasQuotation = data.materials.some((m) =>
      m.title.toLowerCase().includes("quotation") ||
      (m.original_filename && m.original_filename.toLowerCase().includes("quotation"))
    );
    assert.equal(hasQuotation, false, "Quotation must never be present in public data");

    // Subjects contract
    assert.ok(data.subjects.length >= 7, "Must contain all 7 subjects");
    data.subjects.forEach((s) => {
      assert.ok(s.sort_order >= 1 && s.sort_order <= 7);
      assert.match(s.subject_id, /^[a-z0-9-]+$/);
    });
  }
});
