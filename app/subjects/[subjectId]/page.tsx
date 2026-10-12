import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicData } from "@/lib/data/public-service";
import { MaterialList } from "@/components/materials/MaterialList";
import { TaskList } from "@/components/tasks/TaskList";
import { ArrowRight, BookOpen, CheckSquare, FileText } from "lucide-react";

export const revalidate = 60;

interface SubjectDetailPageProps {
  params: {
    subjectId: string;
  };
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { subjects, materials, tasks } = await getPublicData();

  const subject = subjects.find((s) => s.subject_id === params.subjectId);
  if (!subject) {
    notFound();
  }

  const subjectMaterials = materials.filter((m) => m && m.subject_id === subject.subject_id);
  const subjectTasks = tasks.filter((t) => t && t.subject_id === subject.subject_id);

  return (
    <div className="space-y-8">
      {/* Back button and breadcrumb */}
      <div>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors mb-3"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          العودة لكل المواد
        </Link>

        {/* Subject Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
              المادة {subject.sort_order} من 7
            </span>
            {subject.course_code && (
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                كود المادة: {subject.course_code}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">
            {subject.name_en}
          </h1>
          {subject.name_ar && (
            <p className="text-sm font-medium text-slate-500">{subject.name_ar}</p>
          )}
        </div>
      </div>

      {/* Drive Folder Banner if present */}
      {(() => {
        const folderMaterial = subjectMaterials.find((m) => m.category === "FOLDER");
        if (!folderMaterial) return null;
        return (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  مجلد داتا المادة الشامل على Google Drive
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  يحتوي على كافة ملفات ومحاضرات وسكاشن المادة، ويمكن لليدر والطلاب التصفح والتحميل المباشر.
                </p>
              </div>
            </div>
            <a
              href={folderMaterial.drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs shrink-0"
            >
              <span>فتح وتنزيل كل الداتا</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </a>
          </div>
        );
      })()}

      {/* Materials Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">
            ملفات ومحاضرات المادة ({subjectMaterials.length})
          </h2>
        </div>
        <MaterialList materials={subjectMaterials} />
      </section>

      {/* Tasks Section for this Subject */}
      <section className="space-y-3 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg font-bold text-slate-900">
            تكليفات المادة ({subjectTasks.length})
          </h2>
        </div>
        <TaskList
          tasks={subjectTasks}
          subjects={subjects}
          materials={materials}
          initialSubject={subject.subject_id}
        />
      </section>
    </div>
  );
}
