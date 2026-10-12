"use client";

import React, { useState, useEffect } from "react";
import { PublicSession, Subject } from "@/lib/data/schema";
import { SessionCard } from "./SessionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StudentGroup, matchesStudentGroup } from "@/lib/data/group-filter";
import { getStoredGroup, STORAGE_KEYS } from "@/lib/storage/student-preferences";
import { Info } from "lucide-react";

interface ScheduleViewProps {
  sessions: PublicSession[];
  subjects: Subject[];
}

export function ScheduleView({ sessions = [], subjects = [] }: ScheduleViewProps) {
  const [userGroup, setUserGroup] = useState<StudentGroup>("ALL");

  useEffect(() => {
    setUserGroup(getStoredGroup());
    const handleGroupChange = (e: Event) => {
      const customEvent = e as CustomEvent<StudentGroup>;
      setUserGroup(customEvent.detail || getStoredGroup());
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.GROUP) {
        setUserGroup(getStoredGroup());
      }
    };
    window.addEventListener("group-changed", handleGroupChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("group-changed", handleGroupChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  const subjectMap = new Map(safeSubjects.map((s) => [s.subject_id, s]));

  const filteredSessions = safeSessions.filter((session) =>
    session && matchesStudentGroup(session.groups || [], userGroup)
  );

  return (
    <div className="space-y-4">
      {/* Notice about Alternating lab schedule */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">نظام تبادل السكاشن (Group A / Group B):</p>
          <p className="text-emerald-800 leading-relaxed">
            يتم إسناد مواعيد السكاشن المعملية يدويًا لكل أسبوع وتاريخ محدد من قِبل منسقي المادة في Google Sheets. لا تعتمد المنصة على أي تكرار آلي غير مؤكد.
          </p>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <EmptyState
          title="لا توجد محاضرات أو سكاشن معلنة حالياً"
          description="لم يقم مسؤولو الدفعة بإدخال مواعيد مجدولة لهذه المجموعة بعد. ستظهر المواعيد هنا فور إضافتها إلى Google Sheets."
        />
      ) : (
        <div className="grid gap-3">
          {filteredSessions.map((session) => {
            if (!session) return null;
            return (
              <SessionCard
                key={session.session_id}
                session={session}
                subject={subjectMap.get(session.subject_id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
