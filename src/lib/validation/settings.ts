import type { ClinicSettings } from "@/types";

export type SettingsErrors = Partial<Record<keyof ClinicSettings, string>>;

export function validateSettings(s: ClinicSettings): SettingsErrors {
  const errors: SettingsErrors = {};
  if (!s.name.trim()) errors.name = "Enter the clinic name.";
  if (!s.phone.trim()) errors.phone = "Enter a phone number.";
  if (s.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) errors.email = "Enter a valid email address.";
  if (!s.address.trim()) errors.address = "Enter the clinic address.";
  if (s.openingTime >= s.closingTime) errors.closingTime = "Closing time must be after opening time.";
  if (s.workingDays.length === 0) errors.workingDays = "Choose at least one working day.";
  if (!s.invoicePrefix.trim()) errors.invoicePrefix = "Enter an invoice prefix.";
  if (!Number.isInteger(Number(s.paymentTermsDays)) || Number(s.paymentTermsDays) < 0 || Number(s.paymentTermsDays) > 120)
    errors.paymentTermsDays = "Use a whole number of days between 0 and 120.";
  return errors;
}
