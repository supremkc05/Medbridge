import { hasErrors, validatePatient } from "@/lib/validation/patient";
import { validateSettings } from "@/lib/validation/settings";
import type { ClinicSettings, PatientInput } from "@/types";

const valid: PatientInput = {
  firstName: "Ava",
  lastName: "Turner",
  dateOfBirth: "1990-04-12",
  gender: "female",
  phone: "(555) 201-3344",
  email: "ava@example.com",
  address: "",
  primaryDoctorId: "d1",
  insuranceProvider: "",
};

describe("validatePatient", () => {
  const today = new Date("2026-11-18");

  it("accepts a valid patient", () => {
    expect(hasErrors(validatePatient(valid, today))).toBe(false);
  });

  it("reports missing required fields", () => {
    const errors = validatePatient({ ...valid, firstName: " ", primaryDoctorId: "" }, today);
    expect(errors.firstName).toBeDefined();
    expect(errors.primaryDoctorId).toBeDefined();
  });

  it("rejects malformed phone numbers and emails, and future birth dates", () => {
    const errors = validatePatient({ ...valid, phone: "12345", email: "ava@", dateOfBirth: "2030-01-01" }, today);
    expect(Object.keys(errors).sort()).toEqual(["dateOfBirth", "email", "phone"]);
  });

  it("treats email as optional", () => {
    expect(validatePatient({ ...valid, email: "" }, today).email).toBeUndefined();
  });
});

describe("validateSettings", () => {
  const settings: ClinicSettings = {
    name: "Clinic",
    phone: "(555) 310-4400",
    email: "a@b.co",
    address: "1 Main St",
    timezone: "America/Chicago",
    appointmentLength: 20,
    openingTime: "08:00",
    closingTime: "17:00",
    workingDays: ["Mon"],
    currency: "USD",
    invoicePrefix: "INV-",
    paymentTermsDays: 30,
  };

  it("requires closing time after opening time and at least one working day", () => {
    const errors = validateSettings({ ...settings, closingTime: "07:00", workingDays: [] });
    expect(errors.closingTime).toBeDefined();
    expect(errors.workingDays).toBeDefined();
  });

  it("limits payment terms to 0–120 days", () => {
    expect(validateSettings({ ...settings, paymentTermsDays: 365 }).paymentTermsDays).toBeDefined();
    expect(validateSettings(settings)).toEqual({});
  });
});
