"use client";

import React, { useState, useEffect } from "react";
import { PublicTask, Subject, PublicMaterial } from "@/lib/data/schema";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentGroup, matchesStudentGroup } from "@/lib/data/group-filter";
import {
  getStoredCompletedTaskIds,
  toggleStoredCompletedTaskId,
  getStoredGroup,
  STORAGE_KEYS,
} from "@/lib/storage/student-preferences";
import { isOverdueInCairo } from "@/lib/date/cairo";
import { AlertTriangle, Clock, HelpCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

interface DashboardTasksProps {
  tasks: PublicTask[];
  subjects: Subject[];
  materials?: PublicMaterial[];
}

export function DashboardTasks({ tasks = [], subjects = [], materials = [] }: DashboardTasksProps) {
  const [userGroup, setUserGroup] = useState<StudentGroup>("ALL");
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    setUserGroup(getStoredGroup());
    setCompletedIds(getStoredCompletedTaskIds());

    const handleGroupChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentGroup>;
      setUserGroup(customEvent.detail || getStoredGroup());
    };

    const handleCompletedChange = () => {
      setCompletedIds(getStoredCompletedTaskIds());
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.GROUP) {
        setUserGroup(getStoredGroup());
      } else if (e.key === STORAGE_KEYS.COMPLETED_TASK_IDS) {
        setCompletedIds(getStoredCompletedTaskIds());
      }
    };

    window.addEventListener("group-changed", handleGroupChange);
    window.addEventListener("tasks-completed-changed", handleCompletedChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("group-changed", handleGroupChange);
      window.removeEventListener("tasks-completed-changed", handleCompletedChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleToggleComplete = (taskId: string) => {
    toggleStoredCompletedTaskId(taskId);
    setCompletedIds(getStoredCompletedTaskIds());
    window.dispatchEvent(new CustomEvent("tasks-completed-changed"));
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeMaterials = Array.isArray(materials) ? materials : [];

  const subjectMap = new Map(safeSubjects.map((s) => [s.subject_id, s]));
  const materialMap = new Map(safeMaterials.map((m) => [m.material_id, m]));

  // Strictly filter to OPEN tasks matching student cohort
  const cohortOpenTasks = safeTasks.filter(
    (t) => t && t.task_status === "OPEN" && matchesStudentGroup(t.groups || [], userGroup)
  );

  // 1. Overdue tasks
  const overdueTasks = cohortOpenTasks
    .filter((t) => !completedIds.includes(t.task_id) && isOverdueInCairo(t.due_date, t.due_time))
    .sort((a, b) => {
      const dComp = (a.due_date || "").localeCompare(b.due_date || "");
      if (dComp !== 0) return dComp;
      return (a.due_time || "").localeCompare(b.due_time || "");
    });

  // 2. Upcoming tasks with scheduled deadline (closest first)
  const upcomingTasks = cohortOpenTasks
    .filter(
      (t) =>
        !completedIds.includes(t.task_id) &&
        Boolean(t.due_date && t.due_date.trim()) &&
        !isOverdueInCairo(t.due_date, t.due_time)
    )
    .sort((a, b) => {
      const dComp = (a.due_date || "").localeCompare(b.due_date || "");
      if (dComp !== 0) return dComp;
      return (a.due_time || "").localeCompare(b.due_time || "");
    });

  // 3. Separate section: Tasks with unknown / unannounced deadline
  const unknownDeadlineTasks = cohortOpenTasks.filter(
    (t) => !completedIds.includes(t.task_id) && (!t.due_date || !t.due_date.trim())
  );

  // 4. Tasks completed locally by this student
  const completedTasks = cohortOpenTasks.filter((t) => completedIds.includes(t.task_id));

  const totalPending = overdueTasks.length + upcomingTasks.length + unknownDeadlineTasks.length;

  if (totalPending === 0 && completedTasks.length === 0) {
    return (
      <EmptyState
        title="لا توجد تكليفات مفتوحة حالياً"
        description="ليس عليك أي تكليفات معلنة في الوقت الحالي. تابع مع منسقي المواد عند إعلان تكليفات جديدة."
      />
    );
  }

  const renderTask = (task: PublicTask) => {
    if (!task) return null;
    const relMaterials = (task.related_material_ids || [])
      .map((id) => materialMap.get(id))
      .filter((m): m is PublicMaterial => Boolean(m));

    return (
      <TaskCard
        key={task.task_id}
        task={task}
        subject={subjectMap.get(task.subject_id)}
        relatedMaterials={relMaterials}
        isCompleted={completedIds.includes(task.task_id)}
        onToggleComplete={handleToggleComplete}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Overdue Tasks Section (Highest Priority) */}
      {overdueTasks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold">
              تكليفات متأخرة ({overdueTasks.length}) — مطلوب تسليمها في أقرب وقت
            </h3>
          </div>
          <div className="grid gap-3">{overdueTasks.map(renderTask)}</div>
        </div>
      )}

      {/* 2. Upcoming Tasks Section (Sorted by closest deadline) */}
      {upcomingTasks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/70 px-3 py-1.5 rounded-lg border border-emerald-100">
            <Clock className="w-4 h-4 shrink-0 text-emerald-700" />
            <h3 className="text-xs sm:text-sm font-bold">
              القادمة حسب أقرب موعد تسليم ({upcomingTasks.length})
            </h3>
          </div>
          <div className="grid gap-3">{upcomingTasks.map(renderTask)}</div>
        </div>
      )}

      {/* 3. Unknown / Unannounced Deadlines in a distinct separate section */}
      {unknownDeadlineTasks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <HelpCircle className="w-4 h-4 shrink-0 text-slate-500" />
            <h3 className="text-xs sm:text-sm font-bold">
              تكليفات لم يُحدد موعد تسليمها بعد ({unknownDeadlineTasks.length})
            </h3>
          </div>
          <div className="grid gap-3">{unknownDeadlineTasks.map(renderTask)}</div>
        </div>
      )}

      {/* 4. Completed Tasks Toggle Section */}
      {completedTasks.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>التكليفات التي أنجزتها ({completedTasks.length})</span>
            </div>
            {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showCompleted && (
            <div className="grid gap-3 mt-3">{completedTasks.map(renderTask)}</div>
          )}
        </div>
      )}

      {totalPending === 0 && completedTasks.length > 0 && !showCompleted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
          <p className="text-sm font-bold text-emerald-900">
            أحسنت! أنجزت جميع التكليفات المفتوحة حالياً لمجموعتك.
          </p>
        </div>
      )}
    </div>
  );
}
