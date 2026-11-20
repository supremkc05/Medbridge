import { queryPatients } from "@/backend/patients";
import type { Patient } from "@/types";

const base: Omit<Patient, "id" | "firstName" | "lastName" | "primaryDoctorId" | "lastVisit"> = {
  mrn: "MB-1",
  dateOfBirth: "1990-01-01",
  gender: "female",
  phone: "(555) 100-2000",
  email: "",
  address: "",
  insuranceProvider: "Self-pay",
  status: "active",
  createdAt: "2025-01-01",
};

const patients: Patient[] = [
  { ...base, id: "1", firstName: "Ava", lastName: "Turner", primaryDoctorId: "d1", lastVisit: "2026-11-10" },
  { ...base, id: "2", firstName: "Liam", lastName: "Brooks", primaryDoctorId: "d2", lastVisit: "2026-06-01" },
  { ...base, id: "3", firstName: "Mia", lastName: "Carter", primaryDoctorId: "d1", lastVisit: null, status: "inactive" },
];
const doctors = { d1: "Dr. A", d2: "Dr. B" };
const today = new Date("2026-11-18T00:00:00Z");

describe("queryPatients", () => {
  it("searches by name case-insensitively", () => {
    const result = queryPatients(patients, doctors, { search: "tUrN" }, today);
    expect(result.items.map((p) => p.id)).toEqual(["1"]);
  });

  it("filters by doctor and by recent visits", () => {
    expect(queryPatients(patients, doctors, { doctorId: "d1" }, today).total).toBe(2);
    expect(queryPatients(patients, doctors, { lastVisit: "30" }, today).items.map((p) => p.id)).toEqual(["1"]);
    expect(queryPatients(patients, doctors, { lastVisit: "never" }, today).items.map((p) => p.id)).toEqual(["3"]);
  });

  it("sorts by last name in both directions", () => {
    expect(queryPatients(patients, doctors, { sort: "name" }, today).items.map((p) => p.lastName)).toEqual([
      "Brooks",
      "Carter",
      "Turner",
    ]);
    expect(queryPatients(patients, doctors, { sort: "name", order: "desc" }, today).items[0].lastName).toBe("Turner");
  });

  it("paginates and clamps the page to the last available page", () => {
    const result = queryPatients(patients, doctors, { pageSize: 2, page: 9 }, today);
    expect(result.page).toBe(2);
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(3);
  });
});
