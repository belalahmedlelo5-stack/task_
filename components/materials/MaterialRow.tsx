import React from "react";
import { PublicMaterial } from "@/lib/data/schema";
import { ExternalLink, FileText, FolderOpen } from "lucide-react";
import { GroupBadge } from "@/components/shared/Badge";

export function MaterialRow({ material }: { material: PublicMaterial }) {
  if (!material) return null;

  const isFolder = material.category === "FOLDER";

  const getCategoryLabel = (cat?: string) => {
    switch (cat) {
      case "FOLDER":
        return "مجلد الداتا الشامل";
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

  const groups = Array.isArray(material.groups) ? material.groups : [];

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors shadow-2xs ${
        isFolder
          ? "bg-emerald-50/60 border-emerald-300 hover:border-emerald-400"
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
            isFolder
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 border border-emerald-100 text-emerald-700"
          }`}
        >
          {isFolder ? <FolderOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isFolder
                  ? "bg-emerald-200/70 text-emerald-950 font-bold"
                  : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {getCategoryLabel(material.category)}
              {material.sequence_no ? ` ${material.sequence_no}` : ""}
            </span>
            {groups.map((g) => (
              <GroupBadge key={g} group={g} />
            ))}
            <span className="text-[11px] text-slate-400">
              أضيف: {material.added_on || "—"}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {material.title || "ملف بدون عنوان"}
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
          href={material.drive_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-colors ${
            isFolder
              ? "bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          <span>{isFolder ? "فتح مجلد المادة وتنزيل الداتا" : "فتح في Google Drive"}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
