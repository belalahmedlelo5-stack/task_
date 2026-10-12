import React from "react";
import { getPublicData } from "@/lib/data/public-service";
import { ScheduleView } from "@/components/schedule/ScheduleView";
import { Calendar } from "lucide-react";

export const revalidate = 60;

export default async function SchedulePage() {
  const { sessions, subjects } = await getPublicData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-emerald-700" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            جدول المحاضرات والسكاشن
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          مواعيد الجلسات الأكاديمية والعملية مرتبة حسب التاريخ بتوقيت القاهرة، مع التمييز المباشر لمجموعتك (A / B / C).
        </p>
      </div>

      <ScheduleView sessions={sessions} subjects={subjects} />
    </div>
  );
}
