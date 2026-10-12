import React from "react";
import { HelpCircle, ShieldCheck, Clock, Users, Database } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            عن منصة TASKS
          </h1>
        </div>
        <p className="text-sm text-slate-500">
          دليل استخدام منصة دفعة Biotechnology — Level 4 وسياسة خصوصية بيانات الطلاب.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="space-y-4">
        {/* Card 1: No Login / Privacy */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>خصوصية الطالب وبدون تسجيل دخول</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            المنصة مصممة بدون حسابات طلاب وبدون كلمات مرور. عند تحديد مجموعتك (A أو B أو C) أو عند وضع علامة «تم الإنجاز» على أي تكليف، يتم حفظ ذلك فقط داخل متصفح جهازك الحالي عبر تقنية <code>localStorage</code>. لا يتم إرسال أو تخزين أي بيانات خاصة بك على أي خادم خارجي.
          </p>
        </div>

        {/* Card 2: Group Alternation */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>نظام المجموعات وتبادل السكاشن المعملية</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            تتكون الدفعة من المجموعات A وB وC. السكاشن التي يتم تبادلها أسبوعياً بين A وB تُحدد وتُسند يدوياً لكل وقوع وتاريخ من قِبل ممثلي الدفعة في Google Sheets لضمان دقة المواعيد وعدم الاعتماد على أي افتراضات غير مؤكدة.
          </p>
        </div>

        {/* Card 3: Google Sheets & Live Updates */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>مصدر البيانات والتحديث الفوري</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            مصدر الحقيقة لجميع المواد والتكليفات هو جدول Google Sheets الخاص بإدارة الدفعة. أي ملف أو تكليف يُضاف في الجدول يظهر على الموقع تلقائياً خلال 5 دقائق كحد أقصى دون الحاجة لإعادة نشر الموقع.
          </p>
        </div>

        {/* Card 4: Cairo Timezone */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>توقيت القاهرة (Africa/Cairo)</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            جميع مواعيد التسليم وجدول الحصص محسوبة بدقة بتوقيت جمهورية مصر العربية (توقيت القاهرة) مع مراعاة التوقيت الصيفي والشتوي تلقائياً.
          </p>
        </div>

        {/* Card 5: Contact & Broken Links */}
        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
          <h3 className="font-bold text-sm text-emerald-900">
            الإبلاغ عن رابط معطل أو استفسار أكاديمي
          </h3>
          <p className="text-sm text-emerald-800 leading-relaxed">
            إذا واجهت رابط Drive معطل أو استفساراً يخص تكليفاً معيناً، يُرجى التواصل مباشرة مع منسق المادة أو ممثل الدفعة في قنوات التواصل المعتمدة.
          </p>
        </div>
      </div>
    </div>
  );
}
