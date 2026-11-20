"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight, Clock, LogIn, UserX } from "lucide-react";
import { Avatar, Badge, Button, Card, DataTable, EmptyState, ErrorState, LoadingState, Notice, PageHeader, type Column } from "@/components/ui";
import { useGetDoctorsQuery } from "@/features/patients/patientsApi";
import { REFERENCE_DATE, isoDate } from "@/lib/referenceDate";
import { routes } from "@/lib/routes";
import { useAppSelector } from "@/store/hooks";
import type { AppointmentRow } from "@/backend/appointments";
import type { ApiError } from "@/types";
import { useGetAppointmentsQuery, useUpdateAppointmentStatusMutation } from "./appointmentsApi";
import { APPOINTMENT_STATUS } from "./statuses";
import styles from "./AppointmentsSchedule.module.scss";

const DAY = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });
const NUM = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" });
const LONG = new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const parse = (d: string) => new Date(`${d}T00:00:00Z`);
const shift = (d: string, days: number) => isoDate(new Date(parse(d).getTime() + days * 86_400_000));

function endTime(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function AppointmentsSchedule() {
  const today = isoDate(REFERENCE_DATE);
  const role = useAppSelector((s) => s.session.role);
  const canUpdate = role !== "billing";
  const [date, setDate] = useState(today);
  const [doctorId, setDoctorId] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const { data: doctors = [] } = useGetDoctorsQuery();
  const { data, isLoading, isFetching, isError, refetch } = useGetAppointmentsQuery({ date, doctorId, status });
  const [updateStatus] = useUpdateAppointmentStatusMutation();

  const act = async (a: AppointmentRow, next: AppointmentRow["status"], text: string) => {
    try {
      await updateStatus({ id: a.id, status: next }).unwrap();
      setMessage({ tone: "success", text });
    } catch (err) {
      setMessage({ tone: "warning", text: (err as { data?: ApiError }).data?.message ?? "The appointment could not be updated." });
    }
  };

  const columns: Column<AppointmentRow>[] = [
    {
      key: "time",
      header: "Time",
      width: "120px",
      render: (a) => (
        <span className={styles.time}>
          <strong>{a.time}</strong>
          <span>{endTime(a.time, a.durationMinutes)}</span>
        </span>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (a) => (
        <span className={styles.patient}>
          <Avatar name={a.patientName} size="sm" />
          <Link href={routes.patient(a.patientId)}>{a.patientName}</Link>
        </span>
      ),
    },
    { key: "reason", header: "Reason", render: (a) => a.reason },
    { key: "doctor", header: "Doctor", render: (a) => a.doctorName },
    { key: "status", header: "Status", render: (a) => <Badge tone={APPOINTMENT_STATUS[a.status].tone}>{APPOINTMENT_STATUS[a.status].label}</Badge> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (a) =>
        !canUpdate ? null : a.status === "scheduled" ? (
          <span className={styles.actions}>
            <Button size="sm" variant="secondary" onClick={() => act(a, "checked_in", `${a.patientName} is checked in.`)}>
              <LogIn size={14} /> Check in
            </Button>
            <Button size="sm" variant="ghost" onClick={() => act(a, "no_show", `${a.patientName} was marked as a no-show.`)} aria-label={`Mark ${a.patientName} as no-show`}>
              <UserX size={14} />
            </Button>
          </span>
        ) : a.status === "checked_in" ? (
          <Button size="sm" onClick={() => act(a, "completed", `Visit for ${a.patientName} completed.`)}>
            <CalendarCheck size={14} /> Complete visit
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Appointments"
        description={LONG.format(parse(date)) + (date === today ? " · Today" : "")}
        actions={
          <div className={styles.nav}>
            <Button variant="secondary" size="sm" onClick={() => setDate(shift(date, -7))} aria-label="Previous week">
              <ChevronLeft size={16} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setDate(today)} disabled={date === today}>
              Today
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setDate(shift(date, 7))} aria-label="Next week">
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <div className={styles.week} role="tablist" aria-label="Days of the week">
        {(data?.week ?? []).map((d) => (
          <button
            key={d.date}
            type="button"
            role="tab"
            aria-selected={d.date === date}
            className={`${styles.day} ${d.date === date ? styles.dayActive : ""} ${d.date === today ? styles.dayToday : ""}`}
            onClick={() => setDate(d.date)}
          >
            <span className={styles.dayName}>{DAY.format(parse(d.date))}</span>
            <span className={styles.dayNum}>{NUM.format(parse(d.date))}</span>
            <span className={styles.dayCount}>{d.count === 0 ? "No appointments" : d.count === 1 ? "1 appointment" : `${d.count} appointments`}</span>
          </button>
        ))}
      </div>

      {data && (
        <div className={styles.summary}>
          <span><Clock size={14} /> {data.summary.total} booked</span>
          <span className={styles.sDone}>{data.summary.completed} completed</span>
          <span className={styles.sIn}>{data.summary.checkedIn} checked in</span>
          <span className={styles.sUp}>{data.summary.upcoming} upcoming</span>
          <span className={styles.sNo}>{data.summary.noShow} no-show</span>
        </div>
      )}

      <Card flush>
        <div className={styles.filters}>
          <label className={styles.filter}>
            <span>Doctor</span>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">All doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filter}>
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(APPOINTMENT_STATUS).map(([value, s]) => (
                <option key={value} value={value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isLoading ? (
          <LoadingState label="Loading appointments" />
        ) : isError || !data ? (
          <ErrorState onRetry={refetch} />
        ) : data.items.length === 0 ? (
          <EmptyState icon={<CalendarCheck size={22} />} title="No appointments" description="Nothing is booked for this day with the current filters." />
        ) : (
          <div className={isFetching ? styles.fetching : undefined}>
            <DataTable caption="Appointments" columns={columns} rows={data.items} rowKey={(a) => a.id} />
          </div>
        )}
      </Card>
    </>
  );
}
