import type { BadgeTone } from "@/components/ui";
import type { Appointment } from "@/types";

export const APPOINTMENT_STATUS: Record<Appointment["status"], { label: string; tone: BadgeTone }> = {
  completed: { label: "Completed", tone: "success" },
  checked_in: { label: "Checked in", tone: "warning" },
  scheduled: { label: "Scheduled", tone: "info" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  no_show: { label: "No-show", tone: "danger" },
};
