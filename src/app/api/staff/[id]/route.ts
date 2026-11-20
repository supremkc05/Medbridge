import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { forbidUnless, notFound } from "@/server/http";
import type { Role, StaffStatus } from "@/types";

export async function PATCH(request: Request, ctx: RouteContext<"/api/staff/[id]">) {
  // The interface hides these controls from other roles, but this check is what actually protects the data.
  const denied = forbidUnless(request, "staff:manage");
  if (denied) return denied;

  const { id } = await ctx.params;
  const member = db().staff.find((s) => s.id === id);
  if (!member) return notFound("Staff member");

  const changes = (await request.json()) as { role?: Role; status?: StaffStatus };
  const managers = db().staff.filter((s) => s.role === "manager" && s.status === "active");
  const removesLastManager =
    member.role === "manager" &&
    managers.length === 1 &&
    ((changes.role && changes.role !== "manager") || changes.status === "disabled");
  if (removesLastManager) {
    return NextResponse.json({ message: "The clinic must keep at least one active manager." }, { status: 409 });
  }

  Object.assign(member, changes);
  return NextResponse.json(member);
}
