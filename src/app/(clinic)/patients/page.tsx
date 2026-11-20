import { Suspense } from "react";
import { LoadingState } from "@/components/ui";
import { PatientsList } from "@/features/patients/PatientsList";

export const metadata = { title: "Patients · MedBridge (Recreated Demo)" };

export default function PatientsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PatientsList />
    </Suspense>
  );
}
