import React from "react";
import { PublicSession, Subject } from "@/lib/data/schema";
import { formatCairoSessionDate } from "@/lib/date/cairo";
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { GroupBadge } from "@/components/shared/Badge";

interface SessionCardProps {
  session: PublicSession;
  subject?: Subject;
}

export function SessionCard({ session, subject }: SessionCardProps) {
  const isCancelled = session.status === "CANCELLED";
  const isTentative = session.status === "TENTATIVE";

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case "LECTURE":
        return "محاضرة";
      case "SECTION":
        return "سكشن عملي";
      case "LAB":
        return "معمل";
      case "TUTORIAL":
        return "توتوريال";
      default:
        return "جلسة";
    }
  };

  return (
    <div
      className={`p-5 rounded-xl border transition-all duration-150 bg-white ${
        isCancelled
          ? "border-rose-200 bg-rose-50/30 opacity-75"
          : isTentative
          ? "border-amber-200 bg-amber-50/20"
          : "border-slate-200 hover:border-slate-300 shadow-2xs"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Subject & Type Badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            {subject?.name_en || session.subject_id}
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            {getSessionTypeLabel(session.session_type)}
          </span>
          {session.groups.map((g) => (
            <GroupBadge key={g} group={g} />
          ))}
        </div>

        {/* Status indicator */}
        <div>
          {isCancelled && (
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              ملغاة
            </span>
          )}
          {isTentative && (
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              موعد غير مؤكد
            </span>
          )}
          {!isCancelled && !isTentative && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              مؤكدة
            </span>
          )}
        </div>
      </div>

      {/* Date and Time Row */}
      <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-800 mb-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>{formatCairoSessionDate(session.session_date)}</span>
        </div>

        {(session.start_time || session.end_time) && (
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {session.start_time || "—"} {session.end_time ? `إلى ${session.end_time}` : ""}
            </span>
          </div>
        )}

        {session.location && (
          <div className="flex items-center gap-1.5 text-slate-600 font-medium mr-auto">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>المكان: {session.location}</span>
          </div>
        )}
      </div>

      {/* Admin Note / Cancellation details */}
      {session.note && (
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2 bg-slate-50 p-2 rounded-lg">
          {session.note}
        </p>
      )}
    </div>
  );
}
