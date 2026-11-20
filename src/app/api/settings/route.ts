import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { forbidUnless } from "@/server/http";
import { validateSettings } from "@/lib/validation/settings";
import type { ClinicSettings } from "@/types";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(db().settings);
}

export async function PUT(request: Request) {
  const denied = forbidUnless(request, "settings:edit");
  if (denied) return denied;

  const input = (await request.json()) as ClinicSettings;
  const fieldErrors = validateSettings(input);
  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", fieldErrors }, { status: 422 });
  }
  db().settings = { ...input, paymentTermsDays: Number(input.paymentTermsDays), appointmentLength: Number(input.appointmentLength) };
  return NextResponse.json(db().settings);
}
