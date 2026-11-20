"use client";

import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/ui";
import { EditPatient } from "./EditPatient";
import { PatientDetail } from "./PatientDetail";

function useId() {
  return useSearchParams().get("id") ?? "";
}

export function PatientRecordPage() {
  const id = useId();
  return id ? <PatientDetail id={id} /> : <ErrorState message="No patient was selected." />;
}

export function EditPatientPage() {
  const id = useId();
  return id ? <EditPatient id={id} /> : <ErrorState message="No patient was selected." />;
}
