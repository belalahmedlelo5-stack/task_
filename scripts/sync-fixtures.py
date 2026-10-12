import csv
import json

with open(r'd:\task\seed\subjects.csv', encoding='utf-8') as f:
    subjects = list(csv.DictReader(f))

with open(r'd:\task\seed\sessions.csv', encoding='utf-8') as f:
    sessions = list(csv.DictReader(f))

for s in subjects:
    s['sort_order'] = int(s['sort_order'])

for s in sessions:
    s['groups'] = [g.strip() for g in s['groups'].split(',') if g.strip()]

subjects_json = json.dumps(subjects, ensure_ascii=False, indent=2)
sessions_json = json.dumps(sessions, ensure_ascii=False, indent=2)

content = f'''import {{ PublicData }} from "./schema";

/**
 * Official Biotechnology Level 4 Timetable Fixtures (Fall 2026/2027)
 * Synchronized directly with seed/subjects.csv and seed/sessions.csv.
 */
export const DEMO_PUBLIC_DATA: PublicData = {{
  subjects: {subjects_json},
  materials: [
    {{
      material_id: "mat-demo-0001",
      subject_id: "stem-cell-biology",
      category: "SECTION",
      title: "Stem Cell Biology Section 2 (Practical Demo)",
      sequence_no: 2,
      groups: ["ALL"],
      drive_url: "https://drive.google.com/file/d/demo-file-1/view",
      original_filename: "Stem Cell Biology sec 2.pdf",
      added_on: "2026-10-12",
      status: "PUBLISHED",
    }},
    {{
      material_id: "mat-demo-0002",
      subject_id: "gene-therapy",
      category: "LECTURE",
      title: "Gene Therapy Lecture 1 (Introduction)",
      sequence_no: 1,
      groups: ["ALL"],
      drive_url: "https://drive.google.com/file/d/demo-file-2/view",
      original_filename: "Gene Therapy MBGT309 L 1.pdf",
      added_on: "2026-10-12",
      status: "PUBLISHED",
    }},
  ],
  tasks: [
    {{
      task_id: "tsk-demo-0001",
      subject_id: "stem-cell-biology",
      title: "تقرير سكشن بيولوجيا الخلايا الجذعية (Lab Report 1)",
      task_type: "ASSIGNMENT",
      description: "تسليم تقرير التجربة العملية الأولى في معمل الخلايا الجذعية.",
      groups: ["ALL"],
      due_date: "2026-10-20",
      due_time: "23:59",
      related_material_ids: ["mat-demo-0001"],
      task_status: "OPEN",
      created_on: "2026-10-12",
      updated_on: "2026-10-12",
      publish_status: "PUBLISHED",
    }},
  ],
  sessions: {sessions_json},
  meta: {{
    updated_at: new Date().toISOString(),
    environment: "development",
    is_demo: true,
  }},
}};
'''

with open(r'd:\task\lib\data\fixtures.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully updated lib/data/fixtures.ts')
