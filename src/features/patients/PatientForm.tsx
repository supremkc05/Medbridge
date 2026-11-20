"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { Button, Card, Notice, PageHeader, SelectField, TextField } from "@/components/ui";
import { hasErrors, validatePatient, type PatientErrors } from "@/lib/validation/patient";
import type { ApiError, Patient, PatientInput } from "@/types";
import { useCreatePatientMutation, useGetDoctorsQuery, useUpdatePatientMutation } from "./patientsApi";
import styles from "./PatientForm.module.scss";

const EMPTY: PatientInput = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "undisclosed",
  phone: "",
  email: "",
  address: "",
  primaryDoctorId: "",
  insuranceProvider: "",
};

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
];

function pickInput(patient: Patient): PatientInput {
  const input = { ...EMPTY };
  for (const key of Object.keys(EMPTY) as (keyof PatientInput)[]) {
    (input as Record<string, string>)[key] = patient[key] ?? "";
  }
  return input;
}

export function PatientForm({ patient }: { patient?: Patient }) {
  const router = useRouter();
  const editing = Boolean(patient);
  const [values, setValues] = useState<PatientInput>(() => (patient ? pickInput(patient) : EMPTY));
  const [errors, setErrors] = useState<PatientErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: doctors = [] } = useGetDoctorsQuery();
  const [createPatient, createState] = useCreatePatientMutation();
  const [updatePatient, updateState] = useUpdatePatientMutation();
  const saving = createState.isLoading || updateState.isLoading;

  const set = (field: keyof PatientInput) => (e: { target: { value: string } }) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    // After the first submit, re-validate as the user types so errors clear as soon as they are fixed.
    if (submitted) setErrors(validatePatient(next));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);
    const found = validatePatient(values);
    setErrors(found);
    if (hasErrors(found)) return;

    try {
      const saved = editing
        ? await updatePatient({ id: patient!.id, body: values }).unwrap()
        : await createPatient(values).unwrap();
      router.push(routes.patient(saved.id));
    } catch (err) {
      const data = (err as { data?: ApiError }).data;
      if (data?.fieldErrors) setErrors(data.fieldErrors as PatientErrors);
      setServerError(data?.message ?? "The patient could not be saved. Please try again.");
    }
  };

  const errorCount = Object.keys(errors).length;
  const title = editing ? `Edit ${patient!.firstName} ${patient!.lastName}` : "Add patient";

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Patients", href: routes.patients },
          ...(editing ? [{ label: `${patient!.firstName} ${patient!.lastName}`, href: routes.patient(patient!.id) }] : []),
          { label: editing ? "Edit" : "New patient" },
        ]}
        title={title}
        description="Fields marked * are required."
      />

      <form onSubmit={onSubmit} noValidate className={styles.form}>
        {serverError && <Notice tone="warning">{serverError}</Notice>}
        {submitted && errorCount > 0 && !serverError && (
          <Notice tone="warning">
            {errorCount === 1 ? "1 field needs attention." : `${errorCount} fields need attention.`} Please check the
            highlighted fields below.
          </Notice>
        )}

        <Card title="Personal details">
          <div className={styles.grid}>
            <TextField id="firstName" label="First name" required value={values.firstName} onChange={set("firstName")} error={errors.firstName} autoComplete="off" />
            <TextField id="lastName" label="Last name" required value={values.lastName} onChange={set("lastName")} error={errors.lastName} autoComplete="off" />
            <TextField id="dateOfBirth" label="Date of birth" type="date" required value={values.dateOfBirth} onChange={set("dateOfBirth")} error={errors.dateOfBirth} />
            <SelectField id="gender" label="Gender" required options={GENDER_OPTIONS} value={values.gender} onChange={set("gender")} error={errors.gender} />
          </div>
        </Card>

        <Card title="Contact and care">
          <div className={styles.grid}>
            <TextField id="phone" label="Phone" required value={values.phone} onChange={set("phone")} error={errors.phone} hint="10 digits, e.g. (555) 123-4567" />
            <TextField id="email" label="Email" type="email" value={values.email} onChange={set("email")} error={errors.email} hint="Optional" />
            <div className={styles.full}>
              <TextField id="address" label="Address" value={values.address} onChange={set("address")} hint="Optional" />
            </div>
            <SelectField
              id="primaryDoctorId"
              label="Primary doctor"
              required
              placeholder="Choose a doctor"
              options={doctors.map((d) => ({ value: d.id, label: `${d.name} · ${d.specialty}` }))}
              value={values.primaryDoctorId}
              onChange={set("primaryDoctorId")}
              error={errors.primaryDoctorId}
            />
            <TextField id="insuranceProvider" label="Insurance provider" value={values.insuranceProvider} onChange={set("insuranceProvider")} hint="Optional" />
          </div>
        </Card>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          {/* Disabled while saving so the record cannot be submitted twice. */}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Create patient"}
          </Button>
        </div>
      </form>
    </>
  );
}
