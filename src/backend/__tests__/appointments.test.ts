import { queryAppointments, weekOf, type AppointmentRow } from "@/backend/appointments";

const row = (id: string, date: string, time: string, status: AppointmentRow["status"], doctorId = "d1"): AppointmentRow => ({
  id,
  patientId: "p1",
  doctorId,
  date,
  time,
  durationMinutes: 20,
  reason: "Follow-up",
  status,
  patientName: "Ava Turner",
  doctorName: doctorId === "d1" ? "Dr. A" : "Dr. B",
});

const rows = [
  row("1", "2026-11-18", "10:00", "completed"),
  row("2", "2026-11-18", "09:00", "scheduled", "d2"),
  row("3", "2026-11-18", "11:00", "cancelled"),
  row("4", "2026-11-19", "09:00", "scheduled"),
];

describe("appointments", () => {
  it("returns the Monday-to-Sunday week for a date", () => {
    expect(weekOf("2026-11-18")).toEqual([
      "2026-11-16",
      "2026-11-17",
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
    ]);
  });

  it("sorts the day by time and excludes cancelled visits from the counts", () => {
    const day = queryAppointments(rows, { date: "2026-11-18" });
    expect(day.items.map((a) => a.id)).toEqual(["2", "1", "3"]);
    expect(day.summary.total).toBe(2);
    expect(day.week.find((d) => d.date === "2026-11-18")?.count).toBe(2);
  });

  it("filters by doctor", () => {
    expect(queryAppointments(rows, { date: "2026-11-18", doctorId: "d2" }).items.map((a) => a.id)).toEqual(["2"]);
  });
});
