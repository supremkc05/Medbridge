import type { Appointment, Doctor, Patient } from "@/types";

export interface AppointmentRow extends Appointment {
  patientName: string;
  doctorName: string;
}

export interface AppointmentQuery {
  date: string;
  doctorId?: string;
  status?: string;
}

export function withNames(appts: Appointment[], patients: Patient[], doctors: Doctor[]): AppointmentRow[] {
  const p = new Map(patients.map((x) => [x.id, `${x.firstName} ${x.lastName}`]));
  const d = new Map(doctors.map((x) => [x.id, x.name]));
  return appts.map((a) => ({ ...a, patientName: p.get(a.patientId) ?? "Unknown", doctorName: d.get(a.doctorId) ?? "—" }));
}

export function weekOf(date: string): string[] {
  const d = new Date(`${date}T00:00:00Z`);
  const monday = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86_400_000);
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * 86_400_000).toISOString().slice(0, 10));
}

export function queryAppointments(rows: AppointmentRow[], q: AppointmentQuery) {
  const days = weekOf(q.date);
  const inScope = (a: AppointmentRow) => (!q.doctorId || a.doctorId === q.doctorId) && a.status !== "cancelled";
  const week = days.map((day) => ({ date: day, count: rows.filter((a) => a.date === day && inScope(a)).length }));
  const items = rows
    .filter((a) => a.date === q.date && (!q.doctorId || a.doctorId === q.doctorId) && (!q.status || a.status === q.status))
    .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : a.doctorName.localeCompare(b.doctorName)));
  const all = rows.filter((a) => a.date === q.date && (!q.doctorId || a.doctorId === q.doctorId));
  const summary = {
    total: all.filter((a) => a.status !== "cancelled").length,
    completed: all.filter((a) => a.status === "completed").length,
    checkedIn: all.filter((a) => a.status === "checked_in").length,
    upcoming: all.filter((a) => a.status === "scheduled").length,
    noShow: all.filter((a) => a.status === "no_show").length,
  };
  return { date: q.date, week, items, summary };
}
