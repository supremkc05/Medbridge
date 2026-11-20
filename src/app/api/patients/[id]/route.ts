import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { forbidUnless, notFound } from "@/server/http";
import { hasErrors, validatePatient } from "@/lib/validation/patient";
import type { PatientInput } from "@/types";

export async function GET(_request: Request, ctx: RouteContext<"/api/patients/[id]">) {
  const { id } = await ctx.params;
  const store = db();
  const patient = store.patients.find((p) => p.id === id);
  if (!patient) return notFound("Patient");
  const appointments = store.appointments
    .filter((a) => a.patientId === id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return NextResponse.json({ patient, appointments });
}

export async function PUT(request: Request, ctx: RouteContext<"/api/patients/[id]">) {
  const denied = forbidUnless(request, "patients:edit");
  if (denied) return denied;

  const { id } = await ctx.params;
  const store = db();
  const index = store.patients.findIndex((p) => p.id === id);
  if (index === -1) return notFound("Patient");

  const input = (await request.json()) as PatientInput;
  const fieldErrors = validatePatient(input);
  if (hasErrors(fieldErrors)) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", fieldErrors }, { status: 422 });
  }
  store.patients[index] = { ...store.patients[index], ...input };
  return NextResponse.json(store.patients[index]);
}
