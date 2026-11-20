import { Suspense } from "react";
import { LoadingState } from "@/components/ui";
import { PatientRecordPage } from "@/features/patients/PatientRecordPage";

export const metadata = { title: "Patient · MedBridge" };

export default function PatientPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading patient" />}>
      <PatientRecordPage />
    </Suspense>
  );
}
