import React from "react";
import Link from "next/link";
import { getPublicData } from "@/lib/data/public-service";
import { BookOpen, ArrowLeft, FileText, CheckSquare } from "lucide-react";

export const revalidate = 60;

export default async function SubjectsPage() {
  const { subjects, materials, tasks } = await getPublicData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            المواد الدراسية (7 مواد)
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          اختر أي مادة لتصفح محاضراتها، سكاشنها المعملية، التوتوريال، والتكليفات الملحقة بها.
        </p>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => {
          if (!subject) return null;
          const subjectMaterials = materials.filter((m) => m && m.subject_id === subject.subject_id);
          const subjectTasks = tasks.filter((t) => t && t.subject_id === subject.subject_id);

          return (
            <Link
              key={subject.subject_id}
              href={`/subjects/${subject.subject_id}`}
              className="p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    مادة {subject.sort_order}
                  </span>
                  {subject.course_code && (
                    <span className="text-xs font-mono font-medium text-slate-400">
                      {subject.course_code}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {subject.name_en}
                </h2>
                {subject.name_ar && (
                  <p className="text-sm text-slate-500 mt-0.5">{subject.name_ar}</p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {subjectMaterials.length} ملف منشور
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    {subjectTasks.length} تكليف
                  </span>
                </div>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                  فتح المادة
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
