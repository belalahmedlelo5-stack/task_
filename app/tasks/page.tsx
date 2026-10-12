import React from "react";
import { getPublicData } from "@/lib/data/public-service";
import { TaskList } from "@/components/tasks/TaskList";
import { CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TasksPage() {
  const { tasks, subjects, materials } = await getPublicData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CheckSquare className="w-5 h-5 text-emerald-700" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            التكليفات والواجبات الدراسية
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          استعرض جميع التكليفات المطلوبة، ابحث حسب المادة أو النوع، وتابع إنجازك الشخصي المحفوظ على جهازك.
        </p>
      </div>

      <TaskList tasks={tasks} subjects={subjects} materials={materials} />
    </div>
  );
}
