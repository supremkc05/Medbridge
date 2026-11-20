"use client";

import { ErrorState, LoadingState } from "@/components/ui";
import { PatientForm } from "./PatientForm";
import { useGetPatientQuery } from "./patientsApi";

export function EditPatient({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useGetPatientQuery(id);
  if (isLoading) return <LoadingState label="Loading patient" />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;
  return <PatientForm patient={data.patient} />;
}
