import { StudentGroup } from "@/lib/data/group-filter";

export const STORAGE_KEYS = {
  GROUP: "tasks:v1:group",
  COMPLETED_TASK_IDS: "tasks:v1:completedTaskIds",
} as const;

export function getStoredGroup(): StudentGroup {
  if (typeof window === "undefined") return "ALL";
  try {
    const val = localStorage.getItem(STORAGE_KEYS.GROUP);
    if (val === "A" || val === "B" || val === "C" || val === "ALL") {
      return val;
    }
  } catch {
    // LocalStorage unavailable
  }
  return "ALL";
}

export function setStoredGroup(group: StudentGroup): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.GROUP, group);
  } catch {
    // LocalStorage quota or permission error
  }
}

export function getStoredCompletedTaskIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const val = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASK_IDS);
    if (val) {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is string => typeof id === "string");
      }
    }
  } catch {
    // LocalStorage error
  }
  return [];
}

export function toggleStoredCompletedTaskId(taskId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getStoredCompletedTaskIds();
    const index = current.indexOf(taskId);
    let next: string[];
    let isCompleted = false;

    if (index >= 0) {
      next = current.filter((id) => id !== taskId);
      isCompleted = false;
    } else {
      next = [...current, taskId];
      isCompleted = true;
    }

    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASK_IDS, JSON.stringify(next));
    return isCompleted;
  } catch {
    return false;
  }
}
