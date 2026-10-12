/**
 * Group filtering rules for Student Cohorts:
 * - Selected group: 'ALL', 'A', 'B', 'C'
 * - Target content groups: list of groups (e.g. ['ALL'], ['A'], ['A', 'B'], ['TBD'])
 *
 * Rules:
 * 1. If student selected 'ALL', all items match.
 * 2. If item contains 'ALL', it matches any student selection ('A', 'B', 'C', 'ALL').
 * 3. If item contains 'TBD', it matches any student selection so students are aware.
 * 4. Otherwise, item matches if the selected student group is in the item's group list.
 */

export type StudentGroup = "ALL" | "A" | "B" | "C";

export const VALID_STUDENT_GROUPS: readonly StudentGroup[] = ["ALL", "A", "B", "C"] as const;

export function isValidCohortGroup(group: string, allowTbd = false): boolean {
  const upper = group.trim().toUpperCase();
  if (VALID_STUDENT_GROUPS.includes(upper as StudentGroup)) {
    return true;
  }
  if (allowTbd && upper === "TBD") {
    return true;
  }
  return false;
}

export function parseGroupList(rawGroups?: string | null): string[] {
  if (!rawGroups || typeof rawGroups !== "string" || !rawGroups.trim()) {
    return ["ALL"];
  }

  return rawGroups
    .split(",")
    .map((g) => g.trim().toUpperCase())
    .filter(Boolean);
}

export function matchesStudentGroup(
  itemGroups?: string[] | string | null,
  selectedGroup: StudentGroup = "ALL"
): boolean {
  if (!itemGroups) {
    return true;
  }
  const groups = Array.isArray(itemGroups) ? itemGroups : parseGroupList(itemGroups);
  if (groups.length === 0) {
    return true;
  }

  // If student is viewing all groups, everything matches
  if (selectedGroup === "ALL") {
    return true;
  }

  // If item applies to ALL students, it matches
  if (groups.includes("ALL")) {
    return true;
  }

  // If session or task is TBD, show to everyone with tentative badge
  if (groups.includes("TBD")) {
    return true;
  }

  // Otherwise, match explicitly
  return groups.includes(selectedGroup);
}
