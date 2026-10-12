import React from "react";
import { PublicMaterial } from "@/lib/data/schema";
import { ExternalLink, FileText, Download } from "lucide-react";
import { GroupBadge } from "@/components/shared/Badge";

export function MaterialRow({ material }: { material: PublicMaterial }) {
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "LECTURE":
        return "محاضرة";
      case "SECTION":
        return "سكشن / عملي";
      case "TUTORIAL":
        return "توتوريال";
      case "QUESTIONS":
        return "أسئلة وتمارين";
      case "SUPPLEMENT":
        return "ملحق مساند";
      default:
        return "ملف";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
          <FileText className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {getCategoryLabel(material.category)}
              {material.sequence_no ? ` ${material.sequence_no}` : ""}
            </span>
            {material.groups.map((g) => (
              <GroupBadge key={g} group={g} />
            ))}
            <span className="text-[11px] text-slate-400">
              أضيف: {material.added_on}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {material.title}
          </h4>
          {material.original_filename && (
            <p className="text-xs text-slate-400 font-mono">
              {material.original_filename}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mr-auto sm:mr-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <a
          href={material.drive_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
        >
          <span>فتح في Google Drive</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
