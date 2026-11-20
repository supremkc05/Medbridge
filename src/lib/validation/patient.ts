import type { PatientInput } from "@/types";

export type PatientErrors = Partial<Record<keyof PatientInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

/** Shared by the form and the API so both apply exactly the same rules. */
export function validatePatient(input: Partial<PatientInput>, today: Date = new Date()): PatientErrors {
  const errors: PatientErrors = {};
  if (!input.firstName?.trim()) errors.firstName = "Enter the patient's first name.";
  if (!input.lastName?.trim()) errors.lastName = "Enter the patient's last name.";

  if (!input.dateOfBirth) {
    errors.dateOfBirth = "Enter a date of birth.";
  } else {
    const dob = new Date(input.dateOfBirth);
    if (Number.isNaN(dob.getTime())) errors.dateOfBirth = "Enter a valid date.";
    else if (dob > today) errors.dateOfBirth = "Date of birth cannot be in the future.";
  }

  if (!input.phone?.trim()) errors.phone = "Enter a phone number.";
  else if (!PHONE.test(input.phone.trim())) errors.phone = "Use a 10-digit phone number, e.g. (555) 123-4567.";

  if (input.email && !EMAIL.test(input.email.trim())) errors.email = "Enter a valid email address.";
  if (!input.primaryDoctorId) errors.primaryDoctorId = "Choose a primary doctor.";
  if (!input.gender) errors.gender = "Choose an option.";
  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
