import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 space-y-2">
        <p className="font-medium text-slate-700">
          TASKS | Biotechnology — Level 4 | Fall 2026/2027
        </p>
        <p className="text-xs">
          جميع البيانات والمواعيد تُدار مركزياً عبر Google Sheets. لا يتم حفظ أي بيانات شخصية على الخادم؛ علامات الإنجاز والمجموعة مفعلة على جهازك فقط.
        </p>
        <div className="pt-2">
          <Link
            href="/about"
            className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold underline underline-offset-4"
          >
            تعليمات الاستخدام وسياسة الخصوصية
          </Link>
        </div>
      </div>
    </footer>
  );
}
