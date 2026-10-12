import fs from "fs";
import path from "path";
import { normalizeAllData } from "../lib/data/normalize";

function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];

  // Parse header
  const headers = parseCsvLine(lines[0]);
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || values.every((v) => !v.trim())) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index].trim() : "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function main() {
  console.log("=== TASKS Data Validation ===");

  const seedDir = path.resolve(__dirname, "../seed");
  const subjectsPath = path.join(seedDir, "subjects.csv");
  const materialsPath = path.join(seedDir, "materials.csv");
  const tasksPath = path.join(seedDir, "tasks.csv");
  const sessionsPath = path.join(seedDir, "sessions.csv");

  if (!fs.existsSync(subjectsPath) || !fs.existsSync(materialsPath)) {
    console.error("Error: Seed CSV files missing in seed/ directory.");
    process.exit(1);
  }

  const rawSubjects = parseCsv(fs.readFileSync(subjectsPath, "utf-8"));
  const rawMaterials = parseCsv(fs.readFileSync(materialsPath, "utf-8"));
  const rawTasks = fs.existsSync(tasksPath)
    ? parseCsv(fs.readFileSync(tasksPath, "utf-8"))
    : [];
  const rawSessions = fs.existsSync(sessionsPath)
    ? parseCsv(fs.readFileSync(sessionsPath, "utf-8"))
    : [];

  console.log(`Loaded rows:`);
  console.log(`- Subjects:  ${rawSubjects.length}`);
  console.log(`- Materials: ${rawMaterials.length}`);
  console.log(`- Tasks:     ${rawTasks.length}`);
  console.log(`- Sessions:  ${rawSessions.length}`);

  const { data, errors } = normalizeAllData({
    subjects: rawSubjects,
    materials: rawMaterials,
    tasks: rawTasks,
    sessions: rawSessions,
  });

  if (errors.length > 0) {
    console.error("\n❌ Validation Errors Found in Seed Data:");
    errors.forEach((err) => {
      console.error(`  [Tab: ${err.tab}] [ID: ${err.id}]: ${err.reason}`);
    });
    console.error(`\nTotal Errors: ${errors.length}`);
    process.exit(1);
  }

  console.log("\n✅ All seed data validated successfully with ZERO errors!");
  console.log(`- Active Subjects:    ${data.subjects.length}`);
  console.log(`- Published Materials: ${data.materials.length} (Drafts properly held for upload)`);
  console.log(`- Published Tasks:     ${data.tasks.length}`);
  console.log(`- Scheduled Sessions:  ${data.sessions.length}`);
  process.exit(0);
}

main();
