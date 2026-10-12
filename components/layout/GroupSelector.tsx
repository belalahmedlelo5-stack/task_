"use client";

import React, { useEffect, useState } from "react";
import { StudentGroup } from "@/lib/data/group-filter";
import { getStoredGroup, setStoredGroup, STORAGE_KEYS } from "@/lib/storage/student-preferences";
import { Users } from "lucide-react";

interface GroupSelectorProps {
  currentGroup?: StudentGroup;
  onGroupChange?: (group: StudentGroup) => void;
  compact?: boolean;
}

export function GroupSelector({ currentGroup, onGroupChange, compact = false }: GroupSelectorProps) {
  const [selected, setSelected] = useState<StudentGroup>("ALL");

  useEffect(() => {
    if (currentGroup) {
      setSelected(currentGroup);
    } else {
      setSelected(getStoredGroup());
    }

    const handleGroupChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentGroup>;
      setSelected(customEvent.detail || getStoredGroup());
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.GROUP) {
        setSelected(getStoredGroup());
      }
    };

    window.addEventListener("group-changed", handleGroupChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("group-changed", handleGroupChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [currentGroup]);

  const handleChange = (newGroup: StudentGroup) => {
    setSelected(newGroup);
    setStoredGroup(newGroup);
    if (onGroupChange) {
      onGroupChange(newGroup);
    }
    // Dispatch custom event so other components update synchronously
    window.dispatchEvent(new CustomEvent("group-changed", { detail: newGroup }));
  };

  const options: Array<{ id: StudentGroup; label: string }> = [
    { id: "ALL", label: "الكل" },
    { id: "A", label: "مجموعة A" },
    { id: "B", label: "مجموعة B" },
    { id: "C", label: "مجموعة C" },
  ];

  return (
    <div className={`flex items-center gap-1.5 ${compact ? "text-xs" : "text-sm"}`}>
      <span className="text-slate-500 flex items-center gap-1">
        <Users className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">المجموعة:</span>
      </span>
      <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleChange(opt.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                isActive
                  ? "bg-white text-emerald-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
