import type { Appointment, ClinicSettings, Doctor, Invoice, Patient, StaffMember } from "@/types";
import { createRandom } from "./random";

/** Fixed "today" for the demo so that relative filters always show the same data. */
export const DEMO_TODAY = new Date("2026-11-18T09:00:00Z");

const FIRST = [
  "Olivia", "Liam", "Emma", "Noah", "Ava", "Elijah", "Sophia", "James", "Isabella", "Lucas",
  "Mia", "Mason", "Amelia", "Ethan", "Harper", "Logan", "Evelyn", "Aiden", "Abigail", "Caleb",
  "Ella", "Henry", "Scarlett", "Owen", "Grace", "Wyatt", "Chloe", "Leo", "Nora", "Julian",
];
const LAST = [
  "Bennett", "Carter", "Diaz", "Ellis", "Foster", "Garcia", "Hayes", "Iverson", "Jensen", "Kim",
  "Lopez", "Morales", "Nguyen", "Ortiz", "Patel", "Quinn", "Reyes", "Sullivan", "Turner", "Vaughn",
  "Walsh", "Young", "Brooks", "Coleman", "Delgado", "Fleming", "Grant", "Holland", "Price", "Ramirez",
];
const STREETS = ["Maple Ave", "Oak St", "Cedar Ln", "Pine Rd", "Elm St", "Lakeview Dr", "Hillcrest Blvd", "Willow Way"];
const CITIES = ["Springfield, IL", "Madison, WI", "Columbus, OH", "Ann Arbor, MI", "Des Moines, IA"];
const INSURERS = ["BlueShield Demo", "Northwind Health", "Contoso Care", "Fabrikam Mutual", "Self-pay"];
const REASONS = ["Annual check-up", "Follow-up", "Flu symptoms", "Blood pressure review", "Lab results", "Back pain", "Vaccination", "Skin rash"];
export const SERVICES: { name: string; price: number }[] = [
  { name: "General consultation", price: 120 },
  { name: "Follow-up visit", price: 85 },
  { name: "Annual physical", price: 210 },
  { name: "Lab panel", price: 145 },
  { name: "Vaccination", price: 60 },
  { name: "Specialist consultation", price: 260 },
  { name: "Minor procedure", price: 340 },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

export interface Database {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  staff: StaffMember[];
  settings: ClinicSettings;
  invoices: Invoice[];
  nextPatientNumber: number;
}

export function seed(): Database {
  const rnd = createRandom(20260518);

  const doctors: Doctor[] = [
    { id: "d1", name: "Dr. Hannah Brooks", specialty: "Family medicine" },
    { id: "d2", name: "Dr. Marcus Lee", specialty: "Internal medicine" },
    { id: "d3", name: "Dr. Priya Raman", specialty: "Pediatrics" },
    { id: "d4", name: "Dr. Daniel Ortega", specialty: "Dermatology" },
    { id: "d5", name: "Dr. Sarah Whitfield", specialty: "Cardiology" },
    { id: "d6", name: "Dr. Kevin Osei", specialty: "Family medicine" },
  ];

  const patients: Patient[] = [];
  const appointments: Appointment[] = [];
  const invoices: Invoice[] = [];
  let invoiceSeq = 1041;

  for (let i = 0; i < 64; i++) {
    const firstName = FIRST[(i * 7) % FIRST.length];
    const lastName = LAST[(i * 11 + 3) % LAST.length];
    const id = `p${String(i + 1).padStart(3, "0")}`;
    const birthYear = rnd.int(1948, 2019);
    const doctor = rnd.pick(doctors);
    const patient: Patient = {
      id,
      mrn: `MB-${String(10230 + i * 17)}`,
      firstName,
      lastName,
      dateOfBirth: `${birthYear}-${String(rnd.int(1, 12)).padStart(2, "0")}-${String(rnd.int(1, 28)).padStart(2, "0")}`,
      gender: rnd.pick(["female", "male", "female", "male", "other", "undisclosed"] as const),
      phone: `(555) ${rnd.int(200, 989)}-${String(rnd.int(0, 9999)).padStart(4, "0")}`,
      email: rnd.chance(0.85) ? `${firstName}.${lastName}${i}@example.com`.toLowerCase() : "",
      address: rnd.chance(0.9) ? `${rnd.int(10, 9800)} ${rnd.pick(STREETS)}, ${rnd.pick(CITIES)}` : "",
      primaryDoctorId: doctor.id,
      insuranceProvider: rnd.pick(INSURERS),
      lastVisit: null,
      status: rnd.chance(0.88) ? "active" : "inactive",
      createdAt: iso(addDays(DEMO_TODAY, -rnd.int(200, 900))),
    };

    const visits = i % 13 === 5 ? 0 : rnd.int(1, 7);
    let last: string | null = null;
    for (let v = 0; v < visits; v++) {
      const date = addDays(DEMO_TODAY, -rnd.int(3, 420));
      const status: Appointment["status"] = rnd.chance(0.82) ? "completed" : rnd.pick(["cancelled", "no_show"] as const);
      const apptDoctor = rnd.chance(0.75) ? doctor : rnd.pick(doctors);
      appointments.push({
        id: `a${appointments.length + 1}`,
        patientId: id,
        doctorId: apptDoctor.id,
        date: iso(date),
        reason: rnd.pick(REASONS),
        status,
      });
      if (status === "completed") {
        if (!last || iso(date) > last) last = iso(date);
        if (date >= new Date("2026-05-01")) {
          const service = rnd.pick(SERVICES);
          const due = addDays(date, 30);
          const overdue = due < DEMO_TODAY;
          const paid = overdue ? rnd.chance(0.78) : rnd.chance(0.35);
          invoices.push({
            id: `inv${invoiceSeq}`,
            number: `INV-${invoiceSeq++}`,
            patientId: id,
            patientName: `${firstName} ${lastName}`,
            service: service.name,
            issueDate: iso(date),
            dueDate: iso(due),
            amount: service.price,
            status: paid ? "paid" : overdue ? "overdue" : "pending",
          });
        }
      }
    }
    if (rnd.chance(0.3)) {
      appointments.push({
        id: `a${appointments.length + 1}`,
        patientId: id,
        doctorId: doctor.id,
        date: iso(addDays(DEMO_TODAY, rnd.int(2, 40))),
        reason: rnd.pick(REASONS),
        status: "scheduled",
      });
    }
    patient.lastVisit = last;
    patients.push(patient);
  }

  const staff: StaffMember[] = [
    { id: "s1", name: "Alex Morgan", email: "alex.morgan@clinic.example", role: "manager", status: "active", lastActive: "2026-11-18" },
    { id: "s2", name: "Hannah Brooks", email: "hannah.brooks@clinic.example", role: "doctor", status: "active", lastActive: "2026-11-18" },
    { id: "s3", name: "Marcus Lee", email: "marcus.lee@clinic.example", role: "doctor", status: "active", lastActive: "2026-11-17" },
    { id: "s4", name: "Priya Raman", email: "priya.raman@clinic.example", role: "doctor", status: "active", lastActive: "2026-11-16" },
    { id: "s5", name: "Jordan Bell", email: "jordan.bell@clinic.example", role: "front_desk", status: "active", lastActive: "2026-11-18" },
    { id: "s6", name: "Taylor Reed", email: "taylor.reed@clinic.example", role: "front_desk", status: "active", lastActive: "2026-11-15" },
    { id: "s7", name: "Casey Nguyen", email: "casey.nguyen@clinic.example", role: "billing", status: "active", lastActive: "2026-11-18" },
    { id: "s8", name: "Morgan Price", email: "morgan.price@clinic.example", role: "billing", status: "disabled", lastActive: "2026-08-02" },
    { id: "s9", name: "Riley Carter", email: "riley.carter@clinic.example", role: "front_desk", status: "invited", lastActive: null },
  ];

  const settings: ClinicSettings = {
    name: "Lakeside Family Clinic (Demo)",
    phone: "(555) 310-4400",
    email: "frontdesk@lakeside.example",
    address: "2200 Lakeview Dr, Madison, WI 53703",
    timezone: "America/Chicago",
    appointmentLength: 20,
    openingTime: "08:00",
    closingTime: "17:30",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    currency: "USD",
    invoicePrefix: "INV-",
    paymentTermsDays: 30,
  };

  invoices.sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1));
  return { doctors, patients, appointments, staff, settings, invoices, nextPatientNumber: patients.length + 1 };
}
