import { can, type Action } from "@/lib/permissions";
import { hasErrors, validatePatient } from "@/lib/validation/patient";
import { validateSettings } from "@/lib/validation/settings";
import type { ClinicSettings, Patient, PatientInput, Role, StaffMember, StaffStatus } from "@/types";
import { db } from "./db";
import { queryInvoices } from "./invoices";
import { patientStats, queryPatients, type LastVisitFilter, type PatientSortKey } from "./patients";

/**
 * In-browser request router used by RTK Query's base query.
 *
 * The app is published as a static site, so there is no server to call. Every
 * request goes through this router instead, which applies the same query
 * logic, validation and permission checks an API server would.
 */

export interface Request {
  method: string;
  path: string;
  params: Record<string, string>;
  body?: unknown;
  role: Role;
}

export interface Response {
  status: number;
  data: unknown;
}

const ok = (data: unknown, status = 200): Response => ({ status, data });
const fail = (status: number, message: string, fieldErrors?: Record<string, string>): Response => ({
  status,
  data: fieldErrors ? { message, fieldErrors } : { message },
});

const int = (value: string | undefined, fallback: number, min = 1, max = 100) => {
  const n = Number(value);
  return Number.isFinite(n) && value !== "" && value !== undefined ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
};

const forbidden = (role: Role, action: Action) => (can(role, action) ? null : fail(403, "You do not have permission to do this."));

type Handler = (req: Request, match: string[]) => Response;

const routes: [string, RegExp, Handler][] = [
  ["GET", /^\/doctors$/, () => ok(db().doctors)],

  ["GET", /^\/patients\/stats$/, () => ok(patientStats(db().patients))],

  [
    "GET",
    /^\/patients$/,
    ({ params: q }) => {
      const { patients, doctors } = db();
      const doctorNames = Object.fromEntries(doctors.map((d) => [d.id, d.name]));
      return ok(
        queryPatients(patients, doctorNames, {
          search: q.search ?? "",
          doctorId: q.doctorId ?? "",
          lastVisit: (q.lastVisit ?? "") as LastVisitFilter,
          status: (q.status ?? "") as "" | Patient["status"],
          sort: (q.sort || "name") as PatientSortKey,
          order: q.order === "desc" ? "desc" : "asc",
          page: int(q.page, 1, 1, 1000),
          pageSize: int(q.pageSize, 10, 5, 50),
        }),
      );
    },
  ],

  [
    "POST",
    /^\/patients$/,
    ({ body, role }) => {
      const denied = forbidden(role, "patients:create");
      if (denied) return denied;
      const input = body as PatientInput;
      const fieldErrors = validatePatient(input);
      if (hasErrors(fieldErrors)) return fail(422, "Please correct the highlighted fields.", fieldErrors);
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
      return ok(patient, 201);
    },
  ],

  [
    "GET",
    /^\/patients\/([\w-]+)$/,
    (_req, [id]) => {
      const store = db();
      const patient = store.patients.find((p) => p.id === id);
      if (!patient) return fail(404, "Patient not found.");
      const appointments = store.appointments.filter((a) => a.patientId === id).sort((a, b) => (a.date < b.date ? 1 : -1));
      return ok({ patient, appointments });
    },
  ],

  [
    "PUT",
    /^\/patients\/([\w-]+)$/,
    ({ body, role }, [id]) => {
      const denied = forbidden(role, "patients:edit");
      if (denied) return denied;
      const store = db();
      const index = store.patients.findIndex((p) => p.id === id);
      if (index === -1) return fail(404, "Patient not found.");
      const input = body as PatientInput;
      const fieldErrors = validatePatient(input);
      if (hasErrors(fieldErrors)) return fail(422, "Please correct the highlighted fields.", fieldErrors);
      store.patients[index] = { ...store.patients[index], ...input };
      return ok(store.patients[index]);
    },
  ],

  ["GET", /^\/staff$/, () => ok([...db().staff].sort((a, b) => a.name.localeCompare(b.name)))],

  [
    "POST",
    /^\/staff$/,
    ({ body, role }) => {
      const denied = forbidden(role, "staff:manage");
      if (denied) return denied;
      const { name, email, role: newRole } = body as { name?: string; email?: string; role?: Role };
      const fieldErrors: Record<string, string> = {};
      if (!name?.trim()) fieldErrors.name = "Enter a name.";
      if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
      else if (db().staff.some((s) => s.email.toLowerCase() === email.toLowerCase()))
        fieldErrors.email = "Someone with this email already has an account.";
      if (!newRole) fieldErrors.role = "Choose a role.";
      if (Object.keys(fieldErrors).length) return fail(422, "Please correct the highlighted fields.", fieldErrors);
      const member: StaffMember = {
        id: `s${db().staff.length + 1}`,
        name: name!.trim(),
        email: email!.trim().toLowerCase(),
        role: newRole!,
        status: "invited",
        lastActive: null,
      };
      db().staff.push(member);
      return ok(member, 201);
    },
  ],

  [
    "PATCH",
    /^\/staff\/([\w-]+)$/,
    ({ body, role }, [id]) => {
      // The interface hides these controls from other roles, but this check is what actually protects the data.
      const denied = forbidden(role, "staff:manage");
      if (denied) return denied;
      const member = db().staff.find((s) => s.id === id);
      if (!member) return fail(404, "Staff member not found.");
      const changes = body as { role?: Role; status?: StaffStatus };
      const managers = db().staff.filter((s) => s.role === "manager" && s.status === "active");
      const removesLastManager =
        member.role === "manager" &&
        managers.length === 1 &&
        ((changes.role && changes.role !== "manager") || changes.status === "disabled");
      if (removesLastManager) return fail(409, "The clinic must keep at least one active manager.");
      Object.assign(member, changes);
      return ok(member);
    },
  ],

  ["GET", /^\/settings$/, () => ok(db().settings)],

  [
    "PUT",
    /^\/settings$/,
    ({ body, role }) => {
      const denied = forbidden(role, "settings:edit");
      if (denied) return denied;
      const input = body as ClinicSettings;
      const fieldErrors = validateSettings(input);
      if (Object.keys(fieldErrors).length) return fail(422, "Please correct the highlighted fields.", fieldErrors);
      db().settings = { ...input, paymentTermsDays: Number(input.paymentTermsDays), appointmentLength: Number(input.appointmentLength) };
      return ok(db().settings);
    },
  ],

  [
    "GET",
    /^\/invoices$/,
    ({ params: q, role }) => {
      const denied = forbidden(role, "billing:view");
      if (denied) return denied;
      return ok(
        queryInvoices(db().invoices, {
          from: q.from ?? "",
          to: q.to ?? "",
          patient: q.patient ?? "",
          status: (q.status ?? "") as "" | "paid" | "pending" | "overdue",
          page: int(q.page, 1, 1, 1000),
          pageSize: int(q.pageSize, 10, 5, 50),
        }),
      );
    },
  ],
];

export function route(req: Request): Response {
  for (const [method, pattern, handler] of routes) {
    if (method !== req.method) continue;
    const m = pattern.exec(req.path);
    if (m) return handler(req, m.slice(1));
  }
  return fail(404, `No route for ${req.method} ${req.path}`);
}
