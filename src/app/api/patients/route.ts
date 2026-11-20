import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/server/db";
import { intParam } from "@/server/http";
import { queryPatients, type LastVisitFilter, type PatientSortKey } from "@/server/patients";
import type { Patient } from "@/types";

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
