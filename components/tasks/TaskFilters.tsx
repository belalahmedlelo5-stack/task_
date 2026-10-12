import React from "react";
import { Subject } from "@/lib/data/schema";

interface TaskFiltersProps {
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (subj: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  statusFilter: "all" | "pending" | "completed" | "overdue";
  onStatusFilterChange: (status: "all" | "pending" | "completed" | "overdue") => void;
}

export function TaskFilters({
  subjects = [],
  selectedSubject,
  onSubjectChange,
  selectedType,
  onTypeChange,
  statusFilter,
  onStatusFilterChange,
}: TaskFiltersProps) {
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const taskTypes = [
    { value: "ALL", label: "كل الأنواع" },
    { value: "ASSIGNMENT", label: "تكليفات" },
    { value: "PRESENTATION", label: "عروض" },
    { value: "DISCUSSION", label: "مناقشات" },
    { value: "RESEARCH", label: "أبحاث" },
    { value: "QUIZ", label: "كويزات" },
    { value: "EXAM", label: "امتحانات" },
    { value: "OTHER", label: "أخرى" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
      {/* Subject Filter */}
      <div className="flex-1 min-w-[180px]">
        <label htmlFor="filter-subject" className="sr-only">
          المادة
        </label>
        <select
          id="filter-subject"
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">جميع المواد</option>
          {safeSubjects.map((s) => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.name_en} {s.name_ar ? `(${s.name_ar})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div className="flex-1 min-w-[140px]">
        <label htmlFor="filter-type" className="sr-only">
          النوع
        </label>
        <select
          id="filter-type"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {taskTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Completion / Overdue Filter Pills */}
      <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
        {[
          { id: "all", label: "الكل" },
          { id: "pending", label: "المطلوب" },
          { id: "completed", label: "المنجز" },
          { id: "overdue", label: "المتأخر" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onStatusFilterChange(tab.id as typeof statusFilter)}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === tab.id
                ? "bg-white text-emerald-800 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
