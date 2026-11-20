import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/server/db";
import { forbidUnless, intParam } from "@/server/http";
import { hasErrors, validatePatient } from "@/lib/validation/patient";
import { queryPatients, type LastVisitFilter, type PatientSortKey } from "@/server/patients";
import type { Patient, PatientInput } from "@/types";

export function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const { patients, doctors } = db();
  const doctorNames = Object.fromEntries(doctors.map((d) => [d.id, d.name]));
  const result = queryPatients(patients, doctorNames, {
    search: sp.get("search") ?? "",
    doctorId: sp.get("doctorId") ?? "",
    lastVisit: (sp.get("lastVisit") ?? "") as LastVisitFilter,
    status: (sp.get("status") ?? "") as "" | Patient["status"],
    sort: (sp.get("sort") ?? "name") as PatientSortKey,
    order: sp.get("order") === "desc" ? "desc" : "asc",
    page: intParam(sp.get("page"), 1, 1, 1000),
    pageSize: intParam(sp.get("pageSize"), 10, 5, 50),
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const denied = forbidUnless(request, "patients:create");
  if (denied) return denied;

  const input = (await request.json()) as PatientInput;
  const fieldErrors = validatePatient(input);
  if (hasErrors(fieldErrors)) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", fieldErrors }, { status: 422 });
  }

  const store = db();
  const n = store.nextPatientNumber++;
  const patient: Patient = {
    ...input,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    id: `p${String(n).padStart(3, "0")}`,
    mrn: `MB-${10230 + n * 17}`,
    lastVisit: null,
    status: "active",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  store.patients.push(patient);
  return NextResponse.json(patient, { status: 201 });
}
