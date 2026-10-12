import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function TaskTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    ASSIGNMENT: { label: "تكليف / واجب", variant: "info" },
    PRESENTATION: { label: "عرض تقديمي", variant: "warning" },
    DISCUSSION: { label: "مناقشة", variant: "info" },
    RESEARCH: { label: "بحث علمي", variant: "default" },
    QUIZ: { label: "كويز", variant: "danger" },
    EXAM: { label: "امتحان", variant: "danger" },
    OTHER: { label: "أخرى", variant: "neutral" },
  };

  const item = map[type] || { label: type, variant: "neutral" };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function GroupBadge({ group }: { group: string }) {
  let label = group;
  if (group === "ALL") label = "الكل";
  else if (group === "TBD") label = "لم تُحدد بعد";
  else label = `مجموعة ${group}`;

  const variant = group === "TBD" ? "warning" : group === "ALL" ? "success" : "default";

  return <Badge variant={variant}>{label}</Badge>;
}
