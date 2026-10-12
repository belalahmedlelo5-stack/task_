import { PublicData } from "./schema";

/**
 * Official Biotechnology Level 4 Timetable Fixtures (Fall 2026/2027)
 * Synchronized directly with seed/subjects.csv and seed/sessions.csv.
 */
export const DEMO_PUBLIC_DATA: PublicData = {
  subjects: [
  {
    "subject_id": "stem-cell-biology",
    "name_en": "Stem Cell Biology",
    "name_ar": "بيولوجيا الخلايا الجذعية",
    "course_code": "MBSCB403",
    "sort_order": 1,
    "status": "ACTIVE"
  },
  {
    "subject_id": "drug-monitoring",
    "name_en": "Drug Monitoring",
    "name_ar": "مراقبة الدواء",
    "course_code": "EBDM151",
    "sort_order": 2,
    "status": "ACTIVE"
  },
  {
    "subject_id": "microbial-genetics",
    "name_en": "Microbial Genetics",
    "name_ar": "علم الوراثة الميكروبية",
    "course_code": "MBMG310",
    "sort_order": 3,
    "status": "ACTIVE"
  },
  {
    "subject_id": "gene-therapy",
    "name_en": "Gene Therapy",
    "name_ar": "العلاج الجيني",
    "course_code": "MBGT309",
    "sort_order": 4,
    "status": "ACTIVE"
  },
  {
    "subject_id": "recombinant-dna-technology",
    "name_en": "Recombinant DNA Technology",
    "name_ar": "تكنولوجيا الحمض النووي المؤتلف",
    "course_code": "MBBMBR213",
    "sort_order": 5,
    "status": "ACTIVE"
  },
  {
    "subject_id": "communication-cell-signaling",
    "name_en": "Communication and Cell Signaling",
    "name_ar": "الاتصالات والإشارات الخلوية",
    "course_code": "MBCCS410",
    "sort_order": 6,
    "status": "ACTIVE"
  },
  {
    "subject_id": "industry-bacterial-biotechnology",
    "name_en": "Industry and Bacterial Biotechnology",
    "name_ar": "دور البكتيريا في التكنولوجيا الحيوية الصناعية",
    "course_code": "MBIBB313",
    "sort_order": 7,
    "status": "ACTIVE"
  }
],
  materials: [
    {
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
    },
    {
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
    },
  ],
  tasks: [
    {
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
    },
  ],
  sessions: [
  {
    "session_id": "ses-0001",
    "subject_id": "stem-cell-biology",
    "session_type": "LAB",
    "session_date": "2026-10-12",
    "start_time": "08:45",
    "end_time": "10:25",
    "groups": [
      "A"
    ],
    "location": "Lab 1",
    "note": "م.د/ ريهام محمود",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0002",
    "subject_id": "industry-bacterial-biotechnology",
    "session_type": "LAB",
    "session_date": "2026-10-12",
    "start_time": "08:45",
    "end_time": "10:25",
    "groups": [
      "B"
    ],
    "location": "Lab 8",
    "note": "م/ منة مرجان",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0003",
    "subject_id": "stem-cell-biology",
    "session_type": "LECTURE",
    "session_date": "2026-10-12",
    "start_time": "10:30",
    "end_time": "11:20",
    "groups": [
      "ALL"
    ],
    "location": "قاعة 2029",
    "note": "أ.د/ سها أحمد ، م.م/ سلمى زاهر",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0004",
    "subject_id": "drug-monitoring",
    "session_type": "LECTURE",
    "session_date": "2026-10-12",
    "start_time": "11:20",
    "end_time": "12:10",
    "groups": [
      "ALL"
    ],
    "location": "قاعة 2029",
    "note": "أ.د/ محمد عبد الله",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0005",
    "subject_id": "stem-cell-biology",
    "session_type": "LAB",
    "session_date": "2026-10-12",
    "start_time": "12:30",
    "end_time": "14:10",
    "groups": [
      "B"
    ],
    "location": "Lab 1",
    "note": "م.م/ سلمى زاهر",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0006",
    "subject_id": "drug-monitoring",
    "session_type": "LAB",
    "session_date": "2026-10-12",
    "start_time": "12:30",
    "end_time": "14:10",
    "groups": [
      "C"
    ],
    "location": "Lab 1H0",
    "note": "م/ ندى الليثي",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0007",
    "subject_id": "stem-cell-biology",
    "session_type": "LAB",
    "session_date": "2026-10-12",
    "start_time": "14:15",
    "end_time": "15:55",
    "groups": [
      "C"
    ],
    "location": "Lab 1",
    "note": "م.م/ سلمى زاهر ، م/ آية سلام",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0008",
    "subject_id": "drug-monitoring",
    "session_type": "LAB",
    "session_date": "2026-10-12",
    "start_time": "14:15",
    "end_time": "15:55",
    "groups": [
      "A"
    ],
    "location": "Lab 1H0",
    "note": "م/ ندى الليثي",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0009",
    "subject_id": "communication-cell-signaling",
    "session_type": "TUTORIAL",
    "session_date": "2026-10-13",
    "start_time": "08:45",
    "end_time": "10:25",
    "groups": [
      "ALL"
    ],
    "location": "TUT 6119",
    "note": "م/ مريم إبراهيم",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0010",
    "subject_id": "industry-bacterial-biotechnology",
    "session_type": "TUTORIAL",
    "session_date": "2026-10-13",
    "start_time": "08:45",
    "end_time": "10:25",
    "groups": [
      "ALL"
    ],
    "location": "TUT 1110",
    "note": "م.م/ عبير صلاح",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0011",
    "subject_id": "recombinant-dna-technology",
    "session_type": "LECTURE",
    "session_date": "2026-10-13",
    "start_time": "10:30",
    "end_time": "11:20",
    "groups": [
      "ALL"
    ],
    "location": "قاعة 2029",
    "note": "أ.د/ سمر حسب الله",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0012",
    "subject_id": "gene-therapy",
    "session_type": "LAB",
    "session_date": "2026-10-13",
    "start_time": "12:30",
    "end_time": "14:10",
    "groups": [
      "A"
    ],
    "location": "Lab 1",
    "note": "م.م/ ندى الليثي",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0013",
    "subject_id": "recombinant-dna-technology",
    "session_type": "LAB",
    "session_date": "2026-10-13",
    "start_time": "12:30",
    "end_time": "14:10",
    "groups": [
      "B"
    ],
    "location": "Lab 2",
    "note": "م/ ريهام محمود",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0014",
    "subject_id": "microbial-genetics",
    "session_type": "LAB",
    "session_date": "2026-10-13",
    "start_time": "14:15",
    "end_time": "15:55",
    "groups": [
      "A"
    ],
    "location": "Lab 2",
    "note": "م.م/ عبير صلاح",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0015",
    "subject_id": "drug-monitoring",
    "session_type": "LAB",
    "session_date": "2026-10-13",
    "start_time": "14:15",
    "end_time": "15:55",
    "groups": [
      "B"
    ],
    "location": "Lab 1H0",
    "note": "م/ ندى الليثي",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0016",
    "subject_id": "gene-therapy",
    "session_type": "LECTURE",
    "session_date": "2026-10-14",
    "start_time": "08:45",
    "end_time": "09:35",
    "groups": [
      "ALL"
    ],
    "location": "قاعة 2029",
    "note": "أ.د/ تامر رشدي",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0017",
    "subject_id": "communication-cell-signaling",
    "session_type": "LECTURE",
    "session_date": "2026-10-14",
    "start_time": "09:35",
    "end_time": "10:25",
    "groups": [
      "ALL"
    ],
    "location": "قاعة 4111",
    "note": "أ.د/ سمر حسب الله",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0018",
    "subject_id": "microbial-genetics",
    "session_type": "LECTURE",
    "session_date": "2026-10-14",
    "start_time": "10:30",
    "end_time": "11:20",
    "groups": [
      "ALL"
    ],
    "location": "قاعة 2029",
    "note": "أ.د/ مروة صلاح",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0019",
    "subject_id": "industry-bacterial-biotechnology",
    "session_type": "LECTURE",
    "session_date": "2026-10-14",
    "start_time": "11:20",
    "end_time": "12:10",
    "groups": [
      "ALL"
    ],
    "location": "قاعة 2029",
    "note": "أ.د/ مروة صلاح",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0020",
    "subject_id": "gene-therapy",
    "session_type": "LAB",
    "session_date": "2026-10-14",
    "start_time": "12:30",
    "end_time": "14:10",
    "groups": [
      "C"
    ],
    "location": "Lab 1110",
    "note": "م.م/ ندى الليثي",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0021",
    "subject_id": "microbial-genetics",
    "session_type": "LAB",
    "session_date": "2026-10-14",
    "start_time": "12:30",
    "end_time": "14:10",
    "groups": [
      "B"
    ],
    "location": "Lab 2",
    "note": "أ.د/ مروة صلاح ، م/ حنين خالد",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0022",
    "subject_id": "gene-therapy",
    "session_type": "LAB",
    "session_date": "2026-10-14",
    "start_time": "14:15",
    "end_time": "15:55",
    "groups": [
      "B"
    ],
    "location": "Lab 1110",
    "note": "م.م/ ندى الليثي",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0023",
    "subject_id": "microbial-genetics",
    "session_type": "LAB",
    "session_date": "2026-10-14",
    "start_time": "14:15",
    "end_time": "15:55",
    "groups": [
      "C"
    ],
    "location": "Lab 2",
    "note": "أ.د/ مروة صلاح ، م/ حنين خالد",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0024",
    "subject_id": "stem-cell-biology",
    "session_type": "TUTORIAL",
    "session_date": "2026-10-15",
    "start_time": "08:45",
    "end_time": "10:25",
    "groups": [
      "ALL"
    ],
    "location": "TUT lab 2",
    "note": "م.م/ ريهام محمود",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0025",
    "subject_id": "gene-therapy",
    "session_type": "TUTORIAL",
    "session_date": "2026-10-15",
    "start_time": "08:45",
    "end_time": "10:25",
    "groups": [
      "ALL"
    ],
    "location": "TUT 6119",
    "note": "م.م/ ندى الليثي",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0026",
    "subject_id": "recombinant-dna-technology",
    "session_type": "LAB",
    "session_date": "2026-10-15",
    "start_time": "10:30",
    "end_time": "12:10",
    "groups": [
      "C"
    ],
    "location": "Lab 1",
    "note": "م.م/ ريهام محمود",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0027",
    "subject_id": "industry-bacterial-biotechnology",
    "session_type": "LAB",
    "session_date": "2026-10-15",
    "start_time": "10:30",
    "end_time": "12:10",
    "groups": [
      "A"
    ],
    "location": "Lab 8",
    "note": "م.م/ عبير صلاح",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0028",
    "subject_id": "recombinant-dna-technology",
    "session_type": "LAB",
    "session_date": "2026-10-15",
    "start_time": "12:30",
    "end_time": "14:10",
    "groups": [
      "A"
    ],
    "location": "Lab 1",
    "note": "م.م/ ريهام محمود",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0029",
    "subject_id": "industry-bacterial-biotechnology",
    "session_type": "LAB",
    "session_date": "2026-10-15",
    "start_time": "12:30",
    "end_time": "14:10",
    "groups": [
      "B"
    ],
    "location": "Lab 8",
    "note": "م.م/ عبير صلاح",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0030",
    "subject_id": "recombinant-dna-technology",
    "session_type": "TUTORIAL",
    "session_date": "2026-10-15",
    "start_time": "14:15",
    "end_time": "15:55",
    "groups": [
      "ALL"
    ],
    "location": "TUT lab 1",
    "note": "م.م/ ريهام محمود",
    "status": "SCHEDULED"
  },
  {
    "session_id": "ses-0031",
    "subject_id": "stem-cell-biology",
    "session_type": "OTHER",
    "session_date": "2026-10-18",
    "start_time": "09:00",
    "end_time": "14:00",
    "groups": [
      "ALL"
    ],
    "location": "مستشفيات ومراكز التدريب",
    "note": "التدريب الميداني (Training)",
    "status": "SCHEDULED"
  }
],
  meta: {
    updated_at: new Date().toISOString(),
    environment: "development",
    is_demo: true,
  },
};
