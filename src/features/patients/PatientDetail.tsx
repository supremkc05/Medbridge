"use client";

import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CalendarClock,
  Cake,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldPlus,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, type BadgeTone } from "@/components/ui";
import { ageFrom, formatDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { routes } from "@/lib/routes";
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

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string | null }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoIcon} aria-hidden="true">
        <Icon size={16} />
      </span>
      <div>
        <dt>{label}</dt>
        <dd>{value ? value : <span className={styles.empty}>Not recorded</span>}</dd>
      </div>
    </div>
  );
}

export function PatientDetail({ id }: { id: string }) {
  const router = useRouter();
  const role = useAppSelector((s) => s.session.role);
  const { data, isLoading, isError, refetch } = useGetPatientQuery(id);
  const { data: doctors = [] } = useGetDoctorsQuery();
  const doctor = (doctorId: string) => doctors.find((d) => d.id === doctorId);

  if (isLoading) return <LoadingState label="Loading patient" />;
  if (isError || !data) return <ErrorState message="This patient record could not be loaded." onRetry={refetch} />;

  const { patient: p, appointments } = data;
  const name = `${p.firstName} ${p.lastName}`;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const missed = appointments.filter((a) => a.status === "no_show").length;
  const upcoming = [...appointments].reverse().find((a) => a.status === "scheduled");
  const primary = doctor(p.primaryDoctorId);

  return (
    <>
      <PageHeader breadcrumbs={[{ label: "Patients", href: routes.patients }, { label: name }]} title="Patient record" />

      <section className={styles.profile}>
        <Avatar name={name} size="xl" />
        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <h2>{name}</h2>
            <Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status === "active" ? "Active" : "Inactive"}</Badge>
          </div>
          <p className={styles.meta}>
            <span className={styles.mono}>{p.mrn}</span>
            {[GENDER[p.gender], `${ageFrom(p.dateOfBirth, REFERENCE_DATE)} years`, p.insuranceProvider]
              .filter(Boolean)
              .map((item) => (
                <span key={item}>· {item}</span>
              ))}
          </p>
        </div>
        <div className={styles.profileActions}>
          {can(role, "patients:edit") && (
            <Button variant="secondary" onClick={() => router.push(routes.editPatient(p.id))}>
              <Pencil size={15} /> Edit details
            </Button>
          )}
        </div>
      </section>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <CalendarCheck size={18} className={styles.statIcon} aria-hidden="true" />
          <div>
            <span>Last visit</span>
            <strong>{formatDate(p.lastVisit, "No visits yet")}</strong>
          </div>
        </div>
        <div className={styles.stat}>
          <CalendarClock size={18} className={styles.statIcon} aria-hidden="true" />
          <div>
            <span>Next appointment</span>
            <strong>{upcoming ? formatDate(upcoming.date) : "None booked"}</strong>
          </div>
        </div>
        <div className={styles.stat}>
          <Stethoscope size={18} className={styles.statIcon} aria-hidden="true" />
          <div>
            <span>Completed visits</span>
            <strong>{completed}</strong>
          </div>
        </div>
        <div className={styles.stat}>
          <Clock size={18} className={styles.statIcon} aria-hidden="true" />
          <div>
            <span>Missed appointments</span>
            <strong>{missed}</strong>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.side}>
          <Card title="Contact details">
            <dl className={styles.info}>
              <InfoRow icon={Phone} label="Phone" value={p.phone} />
              <InfoRow icon={Mail} label="Email" value={p.email} />
              <InfoRow icon={MapPin} label="Address" value={p.address} />
            </dl>
          </Card>
          <Card title="Personal & care">
            <dl className={styles.info}>
              <InfoRow icon={Cake} label="Date of birth" value={formatDate(p.dateOfBirth)} />
              <InfoRow icon={UserRound} label="Primary doctor" value={primary ? `${primary.name} · ${primary.specialty}` : null} />
              <InfoRow icon={ShieldPlus} label="Insurance" value={p.insuranceProvider} />
              <InfoRow icon={CalendarCheck} label="Registered" value={formatDate(p.createdAt)} />
            </dl>
          </Card>
        </div>

        <Card title="Appointment history" description={`${appointments.length} appointments on record`}>
          {appointments.length === 0 ? (
            <EmptyState title="No appointments yet" description="Appointments booked for this patient will appear here." />
          ) : (
            <ol className={styles.timeline}>
              {appointments.map((a) => {
                const d = doctor(a.doctorId);
                return (
                  <li key={a.id} className={`${styles.event} ${styles[a.status]}`}>
                    <span className={styles.dot} aria-hidden="true" />
                    <div className={styles.eventBody}>
                      <div className={styles.eventTop}>
                        <strong>{a.reason}</strong>
                        <Badge tone={APPT_STATUS[a.status].tone}>{APPT_STATUS[a.status].label}</Badge>
                      </div>
                      <p className={styles.eventMeta}>
                        {formatDate(a.date)} · {d?.name ?? "—"}
                        {d && <span className={styles.specialty}> · {d.specialty}</span>}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
