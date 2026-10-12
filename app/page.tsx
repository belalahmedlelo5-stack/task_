import React from "react";
import Link from "next/link";
import { getPublicData } from "@/lib/data/public-service";
import { DashboardTasks } from "@/components/tasks/DashboardTasks";
import { MaterialRow } from "@/components/materials/MaterialRow";
import { BookOpen, CheckSquare, Calendar, ArrowLeft, AlertCircle } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  let publicData;
  let errorMsg = "";

  try {
    publicData = await getPublicData();
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "تعذر الاتصال ببيانات Google Sheets";
  }

  if (!publicData) {
    return (
      <div className="py-12">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-rose-900 mb-1">تعذر تحميل بيانات المنصة</h2>
          <p className="text-sm text-rose-700">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const { subjects, materials, tasks, meta } = publicData;

  // Recent materials (top 4 published files)
  const recentMaterials = [...materials]
    .filter(Boolean)
    .sort((a, b) => (b.added_on || "").localeCompare(a.added_on || ""))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Demo Warning Banner if in Development / Demo Mode */}
      {meta.is_demo && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
          <span>
            ⚠️ <strong>وضع العرض التجريبي (Development Preview):</strong> يتم عرض بيانات اختبارية لعدم إعداد مفاتيح Google Sheets في ملف البيئة المحلي.
          </span>
          <span className="font-mono text-[10px] bg-amber-100 px-2 py-0.5 rounded">
            DEMO DATA
          </span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-l from-emerald-800 to-emerald-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block text-emerald-200 text-xs font-semibold uppercase tracking-wider">
            Biotechnology — Level 4 | Fall 2026/2027
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            منصة المواد والتكليفات الدراسية
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed">
            مرجع موحد لكافة محاضرات وسكاشن وتكليفات الدفعة، مع متابعة مواعيد التسليم وجدول تبادل المجموعات مباشرة من Google Sheets.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 mt-2">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            التكليفات المطلوبة
          </Link>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-medium border border-emerald-500 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            جدول المحاضرات والسكاشن
          </Link>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-medium border border-emerald-500 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            المواد الدراسية (7)
          </Link>
        </div>
      </section>

      {/* Section: عليك إيه؟ (Pending Tasks) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">عليك إيه؟ (المطلوب مننا)</h2>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            عرض جميع التكليفات
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DashboardTasks tasks={tasks} subjects={subjects} materials={materials} />
      </section>

      {/* Section: Subjects Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">المواد الدراسية السبع</h2>
          </div>
          <Link
            href="/subjects"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            عرض الكل
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((s) => {
            if (!s) return null;
            return (
              <Link
                key={s.subject_id}
                href={`/subjects/${s.subject_id}`}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      مادة {s.sort_order}
                    </span>
                    {s.course_code && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {s.course_code}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {s.name_en}
                  </h3>
                  {s.name_ar && (
                    <p className="text-xs text-slate-500 mt-0.5">{s.name_ar}</p>
                  )}
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>تصفح المحاضرات والسكاشن</span>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Section: Recent Materials */}
      {recentMaterials.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">أحدث الملفات المضافة</h2>
          </div>
          <div className="grid gap-2.5">
            {recentMaterials.map((mat) => {
              if (!mat) return null;
              return <MaterialRow key={mat.material_id} material={mat} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
