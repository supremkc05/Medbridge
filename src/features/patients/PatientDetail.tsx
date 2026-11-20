"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  type BadgeTone,
  type Column,
} from "@/components/ui";
import { ageFrom, formatDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { REFERENCE_DATE } from "@/lib/referenceDate";
import { useAppSelector } from "@/store/hooks";
import type { Appointment } from "@/types";
import { useGetDoctorsQuery, useGetPatientQuery } from "./patientsApi";
import styles from "./PatientDetail.module.scss";

const APPT_STATUS: Record<Appointment["status"], { label: string; tone: BadgeTone }> = {
  completed: { label: "Completed", tone: "success" },
  scheduled: { label: "Scheduled", tone: "info" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  no_show: { label: "No-show", tone: "danger" },
};

const GENDER: Record<string, string> = { female: "Female", male: "Male", other: "Other", undisclosed: "Prefer not to say" };

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className={styles.field}>
      <dt>{label}</dt>
      <dd>{value ? value : <span className={styles.empty}>Not recorded</span>}</dd>
    </div>
  );
}

export function PatientDetail({ id }: { id: string }) {
  const router = useRouter();
  const role = useAppSelector((s) => s.session.role);
  const { data, isLoading, isError, refetch } = useGetPatientQuery(id);
  const { data: doctors = [] } = useGetDoctorsQuery();
  const doctorName = (doctorId: string) => doctors.find((d) => d.id === doctorId)?.name ?? "—";

  if (isLoading) return <LoadingState label="Loading patient" />;
  if (isError || !data) return <ErrorState message="This patient record could not be loaded." onRetry={refetch} />;

  const { patient: p, appointments } = data;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const upcoming = appointments.find((a) => a.status === "scheduled");

  const columns: Column<Appointment>[] = [
    { key: "date", header: "Date", render: (a) => formatDate(a.date) },
    { key: "reason", header: "Reason", render: (a) => a.reason },
    { key: "doctor", header: "Doctor", render: (a) => doctorName(a.doctorId) },
    {
      key: "status",
      header: "Status",
      render: (a) => <Badge tone={APPT_STATUS[a.status].tone}>{APPT_STATUS[a.status].label}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Patients", href: "/patients" }, { label: `${p.firstName} ${p.lastName}` }]}
        title={
          <>
            {p.firstName} {p.lastName}
            <Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status === "active" ? "Active" : "Inactive"}</Badge>
          </>
        }
        description={`${p.mrn} · ${ageFrom(p.dateOfBirth, REFERENCE_DATE)} years · Primary doctor: ${doctorName(p.primaryDoctorId)}`}
        actions={
          can(role, "patients:edit") && (
            <Button variant="secondary" onClick={() => router.push(`/patients/${p.id}/edit`)}>
              Edit details
            </Button>
          )
        }
      />

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span>Last visit</span>
          <strong>{formatDate(p.lastVisit, "No visits yet")}</strong>
        </div>
        <div className={styles.stat}>
          <span>Completed visits</span>
          <strong>{completed}</strong>
        </div>
        <div className={styles.stat}>
          <span>Next appointment</span>
          <strong>{upcoming ? formatDate(upcoming.date) : "None booked"}</strong>
        </div>
        <div className={styles.stat}>
          <span>Insurance</span>
          <strong>{p.insuranceProvider}</strong>
        </div>
      </div>

      <div className={styles.grid}>
        <Card title="Personal information">
          <dl className={styles.list}>
            <Field label="Date of birth" value={formatDate(p.dateOfBirth)} />
            <Field label="Gender" value={GENDER[p.gender]} />
            <Field label="Phone" value={p.phone} />
            <Field label="Email" value={p.email} />
            <Field label="Address" value={p.address} />
            <Field label="Registered" value={formatDate(p.createdAt)} />
          </dl>
        </Card>

        <Card title="Appointment history" description={`${appointments.length} appointments on record`} flush>
          {appointments.length === 0 ? (
            <EmptyState title="No appointments yet" description="Appointments booked for this patient will appear here." />
          ) : (
            <DataTable caption="Appointment history" columns={columns} rows={appointments} rowKey={(a) => a.id} />
          )}
        </Card>
      </div>
    </>
  );
}
