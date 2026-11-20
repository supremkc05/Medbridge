import { REFERENCE_DATE, isoDate } from "@/lib/referenceDate";

export type Period = "this_month" | "last_month" | "last_90" | "ytd" | "custom";

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_90", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" },
  { value: "custom", label: "Custom range" },
];

export function periodRange(period: Period, today: Date = REFERENCE_DATE): { from: string; to: string } {
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  switch (period) {
    case "this_month":
      return { from: isoDate(new Date(Date.UTC(y, m, 1))), to: isoDate(today) };
    case "last_month":
      return { from: isoDate(new Date(Date.UTC(y, m - 1, 1))), to: isoDate(new Date(Date.UTC(y, m, 0))) };
    case "ytd":
      return { from: `${y}-01-01`, to: isoDate(today) };
    case "last_90":
    default:
      return { from: isoDate(new Date(today.getTime() - 89 * 86_400_000)), to: isoDate(today) };
  }
}
