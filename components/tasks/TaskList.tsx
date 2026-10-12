"use client";

import React, { useState, useEffect } from "react";
import { PublicTask, Subject, PublicMaterial } from "@/lib/data/schema";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "./TaskFilters";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentGroup, matchesStudentGroup } from "@/lib/data/group-filter";
import {
  getStoredCompletedTaskIds,
  toggleStoredCompletedTaskId,
  getStoredGroup,
} from "@/lib/storage/student-preferences";
import { isOverdueInCairo } from "@/lib/date/cairo";

interface TaskListProps {
  tasks: PublicTask[];
  subjects: Subject[];
  materials?: PublicMaterial[];
  initialSubject?: string;
}

export function TaskList({
  tasks,
  subjects,
  materials = [],
  initialSubject = "ALL",
}: TaskListProps) {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedType, setSelectedType] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "overdue">("all");
  const [userGroup, setUserGroup] = useState<StudentGroup>("ALL");
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    setUserGroup(getStoredGroup());
    setCompletedIds(getStoredCompletedTaskIds());

    const handleGroupChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentGroup>;
      setUserGroup(customEvent.detail || getStoredGroup());
    };

    window.addEventListener("group-changed", handleGroupChange);
    return () => window.removeEventListener("group-changed", handleGroupChange);
  }, []);

  const handleToggleComplete = (taskId: string) => {
    toggleStoredCompletedTaskId(taskId);
    setCompletedIds(getStoredCompletedTaskIds());
  };

  const subjectMap = new Map(subjects.map((s) => [s.subject_id, s]));
  const materialMap = new Map(materials.map((m) => [m.material_id, m]));

  const filteredTasks = tasks.filter((task) => {
    // 1. Group check
    if (!matchesStudentGroup(task.groups, userGroup)) {
      return false;
    }

    // 2. Subject check
    if (selectedSubject !== "ALL" && task.subject_id !== selectedSubject) {
      return false;
    }

    // 3. Type check
    if (selectedType !== "ALL" && task.task_type !== selectedType) {
      return false;
    }

    const isCompleted = completedIds.includes(task.task_id);
    const isOverdue =
      task.task_status === "OPEN" && !isCompleted && isOverdueInCairo(task.due_date, task.due_time);

    // 4. Status filter check
    if (statusFilter === "pending" && isCompleted) return false;
    if (statusFilter === "completed" && !isCompleted) return false;
    if (statusFilter === "overdue" && !isOverdue) return false;

    // 5. Search check
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const subject = subjectMap.get(task.subject_id);
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = (task.description || "").toLowerCase().includes(q);
      const matchesSubject =
        (subject?.name_en || "").toLowerCase().includes(q) ||
        (subject?.name_ar || "").toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesSubject) {
        return false;
      }
    }

    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aCompleted = completedIds.includes(a.task_id);
    const bCompleted = completedIds.includes(b.task_id);
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    const aOverdue = a.task_status === "OPEN" && !aCompleted && isOverdueInCairo(a.due_date, a.due_time);
    const bOverdue = b.task_status === "OPEN" && !bCompleted && isOverdueInCairo(b.due_date, b.due_time);
    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1;
    }

    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;

    if (a.due_date && b.due_date) {
      const dComp = a.due_date.localeCompare(b.due_date);
      if (dComp !== 0) return dComp;
      return (a.due_time || "").localeCompare(b.due_time || "");
    }

    return a.task_id.localeCompare(b.task_id);
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="ابحث في التكليفات أو المواد..."
          className="flex-1"
        />
      </div>

      <TaskFilters
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Results List */}
      {sortedTasks.length === 0 ? (
        <EmptyState
          title="لا توجد تكليفات مطابقة"
          description="جرّب تغيير خيارات البحث أو تصفية المجموعات لعرض التكليفات."
        />
      ) : (
        <div className="grid gap-3">
          {sortedTasks.map((task) => {
            const relMaterials = task.related_material_ids
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
          })}
        </div>
      )}
    </div>
  );
}
