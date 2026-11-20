import type { Role } from "@/types";

export type Action =
  | "patients:create"
  | "patients:edit"
  | "staff:manage"
  | "settings:edit"
  | "billing:view";

const MATRIX: Record<Action, Role[]> = {
  "patients:create": ["manager", "front_desk"],
  "patients:edit": ["manager", "front_desk", "doctor"],
  "staff:manage": ["manager"],
  "settings:edit": ["manager"],
  "billing:view": ["manager", "billing", "front_desk"],
};

export const ACTION_LABELS: Record<Action, string> = {
  "patients:create": "Register new patients",
  "patients:edit": "Edit patient records",
  "staff:manage": "Manage staff accounts and roles",
  "settings:edit": "Change clinic settings",
  "billing:view": "View invoices and billing totals",
};

/**
 * Used only to decide what the interface shows. The API enforces the same rules,
 * because anything hidden in the browser can still be requested directly.
 */
export function can(role: Role, action: Action): boolean {
  return MATRIX[action].includes(role);
}

export const ALL_ACTIONS = Object.keys(MATRIX) as Action[];
