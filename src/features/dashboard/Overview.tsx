"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, CircleDollarSign, Plus, TriangleAlert, Users, Wallet } from "lucide-react";
import { MonthlyChart } from "@/components/charts/MonthlyChart";
import { Avatar, Badge, Button, Card, ErrorState, LoadingState, StatCard } from "@/components/ui";
import { APPOINTMENT_STATUS } from "@/features/appointments/statuses";
import { formatDate, formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions";
import { routes } from "@/lib/routes";
import { useAppSelector } from "@/store/hooks";
import { useGetDashboardQuery } from "./dashboardApi";
import styles from "./Overview.module.scss";

const LONG = new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function Overview() {
  const router = useRouter();
  const { role, userName } = useAppSelector((s) => s.session);
  const { data, isLoading, isError, refetch } = useGetDashboardQuery();

  if (isLoading) return <LoadingState label="Loading overview" />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const { kpis } = data;
  const next = data.schedule.filter((a) => a.status === "scheduled" || a.status === "checked_in").slice(0, 6);
  const maxLoad = Math.max(1, ...data.byDoctor.map((d) => d.count));
  const showBilling = can(role, "billing:view");

  return (
    <>
      <header className={styles.header}>
        <div>
          <p className={styles.date}>{LONG.format(new Date(`${data.today}T00:00:00Z`))}</p>
          <h1>Good morning, {userName.split(" ")[0]}</h1>
          <p className={styles.sub}>
            {kpis.remainingToday} of {kpis.appointmentsToday} appointments are still ahead today.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => router.push(routes.appointments)}>
            <CalendarDays size={16} /> Open schedule
          </Button>
          {can(role, "patients:create") && (
            <Button onClick={() => router.push(routes.newPatient)}>
              <Plus size={16} /> New patient
            </Button>
          )}
        </div>
      </header>

      <div className={styles.kpis}>
        <StatCard label="Appointments today" value={kpis.appointmentsToday} hint={`${kpis.remainingToday} remaining`} icon={<CalendarDays size={18} />} />
        <StatCard label="Patients seen this week" value={kpis.patientsSeenThisWeek} hint={`${kpis.activePatients} active patients`} icon={<Users size={18} />} tone="cyan" />
        <StatCard label="Collected this month" value={kpis.collectedThisMonth} format={formatMoney} hint={`${Math.round(kpis.collectionRate * 100)}% collection rate this year`} icon={<Wallet size={18} />} tone="green" />
        <StatCard label="Outstanding balance" value={kpis.outstanding} format={formatMoney} hint={`${kpis.overdueCount} invoices overdue`} icon={<CircleDollarSign size={18} />} tone="amber" />
      </div>

      <div className={styles.row}>
        <Card
          title="Revenue"
          description="Invoiced per month this year, paid vs. outstanding"
          actions={
            <ul className={styles.legend}>
              <li><i className={styles.paid} /> Paid</li>
              <li><i className={styles.outstanding} /> Outstanding</li>
            </ul>
          }
        >
          <MonthlyChart data={data.revenueByMonth} />
        </Card>

        <Card
          title="Up next today"
          description={`${next.length ? "Next " + next.length + " appointments" : "No more appointments today"}`}
          actions={
            <Link href={routes.appointments} className={styles.more}>
              View all <ArrowRight size={14} />
            </Link>
          }
          flush
        >
          <ul className={styles.schedule}>
            {next.map((a) => (
              <li key={a.id}>
                <span className={styles.slot}>{a.time}</span>
                <Avatar name={a.patientName} size="sm" />
                <span className={styles.who}>
                  <Link href={routes.patient(a.patientId)}>{a.patientName}</Link>
                  <span>
                    {a.reason} · {a.doctorName.replace("Dr. ", "Dr ")}
                  </span>
                </span>
                <Badge tone={APPOINTMENT_STATUS[a.status].tone} pulse={a.status === "checked_in"}>{APPOINTMENT_STATUS[a.status].label}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className={styles.row3}>
        {showBilling && (
          <Card
            title="Overdue invoices"
            description="Oldest first"
            actions={
              <Link href={routes.billing} className={styles.more}>
                Billing <ArrowRight size={14} />
              </Link>
            }
            flush
          >
            <ul className={styles.list}>
              {data.overdue.map((i) => (
                <li key={i.id}>
                  <span className={styles.warnIcon} aria-hidden="true">
                    <TriangleAlert size={15} />
                  </span>
                  <span className={styles.who}>
                    <strong>{i.patientName}</strong>
                    <span>
                      {i.number} · due {formatDate(i.dueDate)}
                    </span>
                  </span>
                  <span className={styles.amount}>{formatMoney(i.amount)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Doctors today" description="Booked appointments per doctor">
          <ul className={styles.load}>
            {data.byDoctor.map((d, i) => (
              <li key={d.id}>
                <span className={styles.loadName}>
                  <strong>{d.name}</strong>
                  <span>{d.specialty}</span>
                </span>
                <span className={styles.bar} aria-hidden="true">
                  <span style={{ width: `${(d.count / maxLoad) * 100}%`, animationDelay: `${200 + i * 70}ms` }} />
                </span>
                <span className={styles.loadCount}>{d.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Recently seen"
          actions={
            <Link href={routes.patients} className={styles.more}>
              Patients <ArrowRight size={14} />
            </Link>
          }
          flush
        >
          <ul className={styles.list}>
            {data.recentPatients.map((p) => (
              <li key={p.id}>
                <Avatar name={p.name} size="sm" />
                <span className={styles.who}>
                  <Link href={routes.patient(p.id)}>{p.name}</Link>
                  <span>{p.mrn}</span>
                </span>
                <span className={styles.when}>{formatDate(p.lastVisit)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
