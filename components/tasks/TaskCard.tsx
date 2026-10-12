"use client";

import React from "react";
import { PublicTask, Subject, PublicMaterial } from "@/lib/data/schema";
import { TaskTypeBadge, GroupBadge } from "@/components/shared/Badge";
import { formatCairoDeadline, isOverdueInCairo } from "@/lib/date/cairo";
import { CheckCircle2, Circle, Clock, AlertTriangle, FileText, ExternalLink } from "lucide-react";

interface TaskCardProps {
  task: PublicTask;
  subject?: Subject;
  relatedMaterials?: PublicMaterial[];
  isCompleted?: boolean;
  onToggleComplete?: (taskId: string) => void;
}

export function TaskCard({
  task,
  subject,
  relatedMaterials = [],
  isCompleted = false,
  onToggleComplete,
}: TaskCardProps) {
  const isOverdue =
    task.task_status === "OPEN" && !isCompleted && isOverdueInCairo(task.due_date, task.due_time);
  const deadlineText = formatCairoDeadline(task.due_date, task.due_time);
  const isClosed = task.task_status === "CLOSED";

  return (
    <div
      className={`relative p-5 rounded-xl border transition-all duration-200 bg-white ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/20 opacity-80"
          : isOverdue
          ? "border-rose-300 shadow-xs"
          : "border-slate-200 hover:border-slate-300 shadow-xs"
      }`}
    >
      {/* Top Header: Subject & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            {subject?.name_en || task.subject_id}
          </span>
          <TaskTypeBadge type={task.task_type} />
          {task.groups.map((g) => (
            <GroupBadge key={g} group={g} />
          ))}
        </div>

        {/* Status / Local Toggle */}
        <div className="flex items-center gap-2">
          {isClosed ? (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              مغلق للدفعة
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onToggleComplete?.(task.task_id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                isCompleted
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تم الإنجاز
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-slate-400" />
                  علّم كمُنجز
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className={`text-base font-bold text-slate-900 mb-2 ${
          isCompleted ? "line-through text-slate-500" : ""
        }`}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-slate-600 mb-4 whitespace-pre-line leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Deadline Info */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-2 border-t border-slate-100 text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>موعد التسليم:</span>
          <span
            className={
              isOverdue
                ? "text-rose-600 font-bold flex items-center gap-1"
                : "text-slate-800 font-semibold"
            }
          >
            {isOverdue && <AlertTriangle className="w-3.5 h-3.5 inline" />}
            {deadlineText}
            {isOverdue && " (متأخر!)"}
          </span>
        </div>

        {/* Related Materials Links */}
        {relatedMaterials.length > 0 && (
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              ملفات مساندة:
            </span>
            <div className="flex flex-wrap gap-1">
              {relatedMaterials.map((mat) => (
                <a
                  key={mat.material_id}
                  href={mat.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded text-xs transition-colors"
                >
                  <span>{mat.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
