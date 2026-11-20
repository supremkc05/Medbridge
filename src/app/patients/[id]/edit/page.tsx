import { EditPatient } from "@/features/patients/EditPatient";

export const metadata = { title: "Edit patient · MedBridge (Recreated Demo)" };

export default async function EditPatientPage({ params }: PageProps<"/patients/[id]/edit">) {
  const { id } = await params;
  return <EditPatient id={id} />;
}
