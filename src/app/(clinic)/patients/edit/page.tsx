import { Suspense } from "react";
import { LoadingState } from "@/components/ui";
import { EditPatientPage } from "@/features/patients/PatientRecordPage";

export const metadata = { title: "Edit patient · MedBridge" };

export default function EditPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading patient" />}>
      <EditPatientPage />
    </Suspense>
  );
}
