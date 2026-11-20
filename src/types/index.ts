export type Role = "manager" | "doctor" | "front_desk" | "billing";

export const ROLE_LABELS: Record<Role, string> = {
  manager: "Clinic manager",
  doctor: "Doctor",
  front_desk: "Front desk",
  billing: "Billing officer",
};

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export type Gender = "female" | "male" | "other" | "undisclosed";

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  primaryDoctorId: string;
  insuranceProvider: string;
  lastVisit: string | null;
  status: "active" | "inactive";
  createdAt: string;
}

export type PatientInput = Omit<Patient, "id" | "mrn" | "lastVisit" | "status" | "createdAt">;

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  reason: string;
  status: "completed" | "scheduled" | "cancelled" | "no_show";
}

export type StaffStatus = "active" | "invited" | "disabled";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: StaffStatus;
  lastActive: string | null;
}

export interface ClinicSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  appointmentLength: number;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  currency: string;
  invoicePrefix: string;
  paymentTermsDays: number;
}

export type InvoiceStatus = "paid" | "pending" | "overdue";

export interface Invoice {
  id: string;
  number: string;
  patientId: string;
  patientName: string;
  service: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}
