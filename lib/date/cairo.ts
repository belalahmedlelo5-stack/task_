/**
 * Cairo Timezone Utilities (Africa/Cairo)
 * Handles Egypt timezone calculations correctly without assuming fixed UTC+2/UTC+3 offset.
 */

export const CAIRO_TIMEZONE = "Africa/Cairo";

/**
 * Returns current Date in Cairo timezone parts
 */
export function getCairoNowParts(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CAIRO_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      partMap[part.type] = parseInt(part.value, 10);
    }
  }

  return {
    year: partMap.year || now.getFullYear(),
    month: partMap.month || now.getMonth() + 1,
    day: partMap.day || now.getDate(),
    hour: partMap.hour === 24 ? 0 : (partMap.hour || 0),
    minute: partMap.minute || 0,
    second: partMap.second || 0,
  };
}

/**
 * Determines whether a task with due_date and optional due_time is overdue relative to Cairo time.
 * If due_date is empty, it is never overdue.
 * If due_date is provided but due_time is missing, it is NOT overdue until the entire Cairo calendar day passes.
 * If due_date and due_time are both provided, it is overdue once the Cairo time passes due_date + due_time.
 */
export function isOverdueInCairo(
  dueDate?: string | null,
  dueTime?: string | null,
  now: Date = new Date()
): boolean {
  if (!dueDate || !dueDate.trim()) {
    return false;
  }

  const dateMatch = dueDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return false;

  const dueYear = parseInt(dateMatch[1], 10);
  const dueMonth = parseInt(dateMatch[2], 10);
  const dueDay = parseInt(dateMatch[3], 10);

  const cairoNow = getCairoNowParts(now);

  let dueHour = 23;
  let dueMinute = 59;
  let dueSecond = 59;

  if (dueTime && dueTime.trim()) {
    const timeMatch = dueTime.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      dueHour = parseInt(timeMatch[1], 10);
      dueMinute = parseInt(timeMatch[2], 10);
      dueSecond = 0;
    }
  }

  // Compare year, month, day, hour, minute, second in Cairo time
  if (cairoNow.year > dueYear) return true;
  if (cairoNow.year < dueYear) return false;

  if (cairoNow.month > dueMonth) return true;
  if (cairoNow.month < dueMonth) return false;

  if (cairoNow.day > dueDay) return true;
  if (cairoNow.day < dueDay) return false;

  // Same day:
  if (cairoNow.hour > dueHour) return true;
  if (cairoNow.hour < dueHour) return false;

  if (cairoNow.minute > dueMinute) return true;
  if (cairoNow.minute < dueMinute) return false;

  return cairoNow.second > dueSecond;
}

/**
 * Formats a Cairo deadline for human display.
 */
export function formatCairoDeadline(dueDate?: string | null, dueTime?: string | null): string {
  if (!dueDate || !dueDate.trim()) {
    return "لم يُحدد بعد";
  }

  const parts = dueDate.trim().split("-");
  if (parts.length !== 3) return dueDate;

  const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

  if (dueTime && dueTime.trim()) {
    return `${formattedDate} الساعة ${dueTime.trim()}`;
  }

  return `يوم ${formattedDate}`;
}

/**
 * Formats date for sessions
 */
export function formatCairoSessionDate(dateStr: string): string {
  if (!dateStr || !dateStr.trim()) return "—";
  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
