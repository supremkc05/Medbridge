import { REFERENCE_DATE, isoDate } from "@/lib/referenceDate";
import type { Database } from "./seed";
import { withNames } from "./appointments";
import { summarize } from "./invoices";

export function dashboard(db: Database) {
  const today = isoDate(REFERENCE_DATE);
  const rows = withNames(db.appointments, db.patients, db.doctors);
  const todays = rows.filter((a) => a.date === today && a.status !== "cancelled").sort((a, b) => (a.time < b.time ? -1 : 1));

  const weekAgo = isoDate(new Date(REFERENCE_DATE.getTime() - 6 * 86_400_000));
  const seenThisWeek = new Set(rows.filter((a) => a.status === "completed" && a.date >= weekAgo && a.date <= today).map((a) => a.patientId)).size;

  const ytd = db.invoices.filter((i) => i.issueDate >= `${today.slice(0, 4)}-01-01`);
  const summary = summarize(ytd);
  const monthStart = `${today.slice(0, 7)}-01`;
  const thisMonth = summarize(db.invoices.filter((i) => i.issueDate >= monthStart && i.issueDate <= today));

  const overdue = db.invoices
    .filter((i) => i.status === "overdue")
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    .slice(0, 5);

  const recentPatients = [...db.patients]
    .filter((p) => p.lastVisit)
    .sort((a, b) => ((a.lastVisit ?? "") < (b.lastVisit ?? "") ? 1 : -1))
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, mrn: p.mrn, lastVisit: p.lastVisit, doctorId: p.primaryDoctorId }));

  const byDoctor = db.doctors.map((d) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    count: todays.filter((a) => a.doctorId === d.id).length,
  }));

  return {
    today,
    kpis: {
      appointmentsToday: todays.length,
      remainingToday: todays.filter((a) => a.status === "scheduled" || a.status === "checked_in").length,
      patientsSeenThisWeek: seenThisWeek,
      activePatients: db.patients.filter((p) => p.status === "active").length,
      outstanding: summary.pending.amount + summary.overdue.amount,
      overdueCount: summary.overdue.count,
      collectedThisMonth: thisMonth.paid.amount,
      collectionRate: summary.total.amount ? summary.paid.amount / summary.total.amount : 0,
    },
    revenueByMonth: summary.byMonth,
    schedule: todays,
    byDoctor,
    overdue,
    recentPatients,
  };
}

export type Dashboard = ReturnType<typeof dashboard>;
