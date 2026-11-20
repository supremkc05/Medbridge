export type Role = "manager" | "doctor" | "front_desk" | "billing";

export const ROLE_LABELS: Record<Role, string> = {
  manager: "Clinic manager",
  doctor: "Doctor",
  front_desk: "Front desk",
  billing: "Billing officer",
};
