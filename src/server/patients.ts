import type { Paginated, Patient } from "@/types";
import { DEMO_TODAY } from "./seed";

export type PatientSortKey = "name" | "dateOfBirth" | "lastVisit" | "doctor";
export type LastVisitFilter = "" | "30" | "90" | "365" | "never";

export interface PatientQuery {
  search?: string;
  doctorId?: string;
  lastVisit?: LastVisitFilter;
  status?: "" | Patient["status"];
  sort?: PatientSortKey;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function queryPatients(
  patients: Patient[],
  doctorNames: Record<string, string>,
  q: PatientQuery,
  today: Date = DEMO_TODAY,
): Paginated<Patient> {
  const search = q.search?.trim().toLowerCase() ?? "";
  let rows = patients.filter((p) => {
    if (search) {
      const haystack = `${p.firstName} ${p.lastName} ${p.mrn} ${p.phone} ${p.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (q.doctorId && p.primaryDoctorId !== q.doctorId) return false;
    if (q.status && p.status !== q.status) return false;
    if (q.lastVisit === "never") return p.lastVisit === null;
    if (q.lastVisit) {
      if (!p.lastVisit) return false;
      const days = (today.getTime() - new Date(p.lastVisit).getTime()) / 86_400_000;
      if (days > Number(q.lastVisit)) return false;
    }
    return true;
  });

  const dir = q.order === "desc" ? -1 : 1;
  const key = q.sort ?? "name";
  const value = (p: Patient): string => {
    switch (key) {
      case "dateOfBirth":
        return p.dateOfBirth;
      case "lastVisit":
        return p.lastVisit ?? "";
      case "doctor":
        return doctorNames[p.primaryDoctorId] ?? "";
      default:
        return `${p.lastName} ${p.firstName}`.toLowerCase();
    }
  };
  rows = [...rows].sort((a, b) => (value(a) < value(b) ? -dir : value(a) > value(b) ? dir : 0));

  const pageSize = q.pageSize ?? 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(q.page ?? 1, pageCount);
  return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize };
}
