import React from "react";
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">
        الصفحة غير موجودة (404)
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        المسار أو المادة التي تبحث عنها غير متوفرة أو قد تم تعديل معرّفها. يمكنك العودة إلى الصفحة الرئيسية لتصفح المواد والتكليفات المتاحة.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
      >
        <Home className="w-4 h-4" />
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
