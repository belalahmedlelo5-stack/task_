"use client";

import React, { useState, useEffect } from "react";
import { PublicMaterial } from "@/lib/data/schema";
import { MaterialRow } from "./MaterialRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentGroup, matchesStudentGroup } from "@/lib/data/group-filter";
import { getStoredGroup } from "@/lib/storage/student-preferences";

interface MaterialListProps {
  materials: PublicMaterial[];
}

export function MaterialList({ materials }: MaterialListProps) {
  const [userGroup, setUserGroup] = useState<StudentGroup>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    setUserGroup(getStoredGroup());
    const handleGroupChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentGroup>;
      setUserGroup(customEvent.detail || getStoredGroup());
    };
    window.addEventListener("group-changed", handleGroupChange);
    return () => window.removeEventListener("group-changed", handleGroupChange);
  }, []);

  // Filter materials by current student group
  const groupFiltered = materials.filter((m) => matchesStudentGroup(m.groups, userGroup));

  // Determine available categories that actually have materials
  const categoryCounts = groupFiltered.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryTabs = [
    { id: "ALL", label: "الكل", count: groupFiltered.length },
    { id: "LECTURE", label: "المحاضرات", count: categoryCounts["LECTURE"] || 0 },
    { id: "SECTION", label: "السكاشن والعملي", count: categoryCounts["SECTION"] || 0 },
    { id: "TUTORIAL", label: "التوتوريال", count: categoryCounts["TUTORIAL"] || 0 },
    { id: "QUESTIONS", label: "الأسئلة والتمارين", count: categoryCounts["QUESTIONS"] || 0 },
    { id: "SUPPLEMENT", label: "الملاحق المساندة", count: categoryCounts["SUPPLEMENT"] || 0 },
  ].filter((t) => t.id === "ALL" || t.count > 0);

  const displayedMaterials =
    selectedCategory === "ALL"
      ? groupFiltered
      : groupFiltered.filter((m) => m.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      {categoryTabs.length > 1 && (
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Materials List */}
      {displayedMaterials.length === 0 ? (
        <EmptyState
          title="لم تُرفع ملفات في هذا القسم بعد"
          description="سيتم إضافة الملفات وروابط Google Drive فور اعتمادها من قِبل منسقي المادة."
        />
      ) : (
        <div className="grid gap-2.5">
          {displayedMaterials.map((material) => (
            <MaterialRow key={material.material_id} material={material} />
          ))}
        </div>
      )}
    </div>
  );
}
