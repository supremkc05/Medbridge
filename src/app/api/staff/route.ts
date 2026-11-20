import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { forbidUnless } from "@/server/http";
import type { Role, StaffMember } from "@/types";

export const dynamic = "force-dynamic";

export function GET() {
  const staff = [...db().staff].sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json(staff);
}

export async function POST(request: Request) {
  const denied = forbidUnless(request, "staff:manage");
  if (denied) return denied;

  const { name, email, role } = (await request.json()) as { name?: string; email?: string; role?: Role };
  const fieldErrors: Record<string, string> = {};
  if (!name?.trim()) fieldErrors.name = "Enter a name.";
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  else if (db().staff.some((s) => s.email.toLowerCase() === email.toLowerCase()))
    fieldErrors.email = "Someone with this email already has an account.";
  if (!role) fieldErrors.role = "Choose a role.";
  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", fieldErrors }, { status: 422 });
  }

  const member: StaffMember = {
    id: `s${db().staff.length + 1}`,
    name: name!.trim(),
    email: email!.trim().toLowerCase(),
    role: role!,
    status: "invited",
    lastActive: null,
  };
  db().staff.push(member);
  return NextResponse.json(member, { status: 201 });
}
