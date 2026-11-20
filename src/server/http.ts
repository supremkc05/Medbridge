import { NextResponse } from "next/server";
import type { Role } from "@/types";
import { can, type Action } from "@/lib/permissions";

const ROLES: Role[] = ["manager", "doctor", "front_desk", "billing"];

export function roleFrom(request: Request): Role {
  const header = request.headers.get("x-demo-role");
  return ROLES.includes(header as Role) ? (header as Role) : "front_desk";
}

/** Server-side permission check: the UI hides controls, but the API is what actually enforces the rule. */
export function forbidUnless(request: Request, action: Action) {
  if (can(roleFrom(request), action)) return null;
  return NextResponse.json({ message: "You do not have permission to do this." }, { status: 403 });
}

export function notFound(what: string) {
  return NextResponse.json({ message: `${what} not found.` }, { status: 404 });
}

export function intParam(value: string | null, fallback: number, min = 1, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}
