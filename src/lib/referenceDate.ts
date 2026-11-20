/**
 * Fixed reference date used by the seeded data and by relative date filters,
 * so that "last 30 days" or "this month" always cover the same records.
 */
export const REFERENCE_DATE = new Date("2026-11-18T09:00:00Z");

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
