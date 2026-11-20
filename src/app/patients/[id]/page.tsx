import { PatientDetail } from "@/features/patients/PatientDetail";

export const metadata = { title: "Patient · MedBridge (Recreated Demo)" };

export default async function PatientPage({ params }: PageProps<"/patients/[id]">) {
  const { id } = await params;
  return <PatientDetail id={id} />;
}
