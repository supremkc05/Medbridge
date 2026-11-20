"use client";

import { useState } from "react";
import { CircleCheck, Download, Hourglass, Lock, Receipt, Search, TriangleAlert } from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  type BadgeTone,
  type Column,
  Button,
  StatCard,
} from "@/components/ui";
import { downloadCsv } from "@/lib/csv";
import { MonthlyChart } from "@/components/charts/MonthlyChart";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDate, formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions";
import { useAppSelector } from "@/store/hooks";
import { ROLE_LABELS, type Invoice, type InvoiceStatus } from "@/types";
import type { InvoiceSummary } from "@/backend/invoices";
import { useGetInvoicesQuery } from "./billingApi";
import { PERIOD_OPTIONS, periodRange, type Period } from "./periods";
import styles from "./BillingDashboard.module.scss";

const STATUS: Record<InvoiceStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Paid", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  overdue: { label: "Overdue", tone: "danger" },
};


function SummaryCards({ summary }: { summary: InvoiceSummary }) {
  const count = (n: number) => `${n} ${n === 1 ? "invoice" : "invoices"}`;
  return (
    <div className={styles.cards}>
      <StatCard label="Total invoiced" value={formatMoney(summary.total.amount)} hint={count(summary.total.count)} icon={<Receipt size={18} />} />
      <StatCard label="Paid" value={formatMoney(summary.paid.amount)} hint={count(summary.paid.count)} icon={<CircleCheck size={18} />} tone="green" />
      <StatCard label="Pending" value={formatMoney(summary.pending.amount)} hint={count(summary.pending.count)} icon={<Hourglass size={18} />} tone="amber" />
      <StatCard label="Overdue" value={formatMoney(summary.overdue.amount)} hint={count(summary.overdue.count)} icon={<TriangleAlert size={18} />} tone="red" />
    </div>
  );
}

function Collection({ summary }: { summary: InvoiceSummary }) {
  const total = summary.total.amount || 1;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;
  return (
    <div className={styles.collection}>
      <Card title="Collection status" description="Share of the invoiced amount for this period">
        <div className={styles.stack} role="img" aria-label={`Paid ${pct(summary.paid.amount)}, pending ${pct(summary.pending.amount)}, overdue ${pct(summary.overdue.amount)}`}>
          <span className={styles.stackPaid} style={{ width: pct(summary.paid.amount) }} />
          <span className={styles.stackPending} style={{ width: pct(summary.pending.amount) }} />
          <span className={styles.stackOverdue} style={{ width: pct(summary.overdue.amount) }} />
        </div>
        <ul className={styles.legend}>
          <li><i className={styles.stackPaid} /> Paid {pct(summary.paid.amount)}</li>
          <li><i className={styles.stackPending} /> Pending {pct(summary.pending.amount)}</li>
          <li><i className={styles.stackOverdue} /> Overdue {pct(summary.overdue.amount)}</li>
        </ul>
        <dl className={styles.facts}>
          <div>
            <dt>Outstanding balance</dt>
            <dd>{formatMoney(summary.pending.amount + summary.overdue.amount)}</dd>
          </div>
          <div>
            <dt>Average invoice</dt>
            <dd>{formatMoney(summary.total.count ? summary.total.amount / summary.total.count : 0)}</dd>
          </div>
          <div>
            <dt>Collection rate</dt>
            <dd>{pct(summary.paid.amount)}</dd>
          </div>
        </dl>
      </Card>
      <Card
        title="Invoiced by month"
        description="Paid vs. outstanding"
        actions={
          <ul className={styles.chartLegend}>
            <li><i className={styles.barPaid} /> Paid</li>
            <li><i className={styles.barOutstanding} /> Outstanding</li>
          </ul>
        }
      >
        {summary.byMonth.length === 0 ? <p className={styles.noData}>No invoices in this period.</p> : <MonthlyChart data={summary.byMonth} />}
      </Card>
    </div>
  );
}

export function BillingDashboard() {
  const role = useAppSelector((s) => s.session.role);
  const allowed = can(role, "billing:view");

  const [period, setPeriod] = useState<Period>("ytd");
  const [custom, setCustom] = useState(periodRange("last_90"));
  const [patientInput, setPatientInput] = useState("");
  const patient = useDebouncedValue(patientInput);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const range = period === "custom" ? custom : periodRange(period);
  const { data, isLoading, isFetching, isError, refetch } = useGetInvoicesQuery(
    { ...range, patient, status, page, pageSize: 10 },
    { skip: !allowed },
  );

  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };

  const columns: Column<Invoice>[] = [
    { key: "number", header: "Invoice", render: (i) => <span className={styles.mono}>{i.number}</span> },
    {
      key: "patient",
      header: "Patient",
      render: (i) => (
        <span className={styles.patientCell}>
          <Avatar name={i.patientName} size="sm" />
          <strong className={styles.patient}>{i.patientName}</strong>
        </span>
      ),
    },
    { key: "service", header: "Service", render: (i) => i.service },
    { key: "issueDate", header: "Issued", render: (i) => formatDate(i.issueDate) },
    {
      key: "dueDate",
      header: "Due",
      render: (i) => <span className={i.status === "overdue" ? styles.late : undefined}>{formatDate(i.dueDate)}</span>,
    },
    { key: "amount", header: "Amount", align: "right", render: (i) => <span className={styles.amount}>{formatMoney(i.amount)}</span> },
    { key: "status", header: "Status", render: (i) => <Badge tone={STATUS[i.status].tone}>{STATUS[i.status].label}</Badge> },
  ];

  if (!allowed) {
    return (
      <>
        <PageHeader title="Billing" />
        <Card>
          <EmptyState icon={<Lock size={22} />} title="Access restricted" description={`Billing is not available to the ${ROLE_LABELS[role]} role.`} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Billing"
        description={`Invoices issued between ${formatDate(range.from)} and ${formatDate(range.to)}.`}
        actions={
          <Button
            variant="secondary"
            disabled={!data}
            onClick={() =>
              data &&
              downloadCsv(
                "invoices.csv",
                ["Invoice", "Patient", "Service", "Issued", "Due", "Amount", "Status"],
                data.items.map((i) => [i.number, i.patientName, i.service, i.issueDate, i.dueDate, i.amount.toFixed(2), i.status]),
              )
            }
          >
            <Download size={16} /> Export
          </Button>
        }
      />

      <div className={styles.filters} role="search">
        <label className={styles.filter}>
          <span>Period</span>
          <select value={period} onChange={(e) => resetPage(setPeriod)(e.target.value as Period)}>
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {period === "custom" && (
          <>
            <label className={styles.filter}>
              <span>From</span>
              <input type="date" value={custom.from} max={custom.to} onChange={(e) => resetPage(setCustom)({ ...custom, from: e.target.value })} />
            </label>
            <label className={styles.filter}>
              <span>To</span>
              <input type="date" value={custom.to} min={custom.from} onChange={(e) => resetPage(setCustom)({ ...custom, to: e.target.value })} />
            </label>
          </>
        )}
        <label className={`${styles.filter} ${styles.grow}`}>
          <span>Patient or invoice number</span>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input type="search" className={styles.searchInput} placeholder="e.g. Nguyen or INV-1102" value={patientInput} onChange={(e) => resetPage(setPatientInput)(e.target.value)} />
        </label>
        <label className={styles.filter}>
          <span>Status</span>
          <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)}>
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <LoadingState label="Loading invoices" />
      ) : isError || !data ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
          <SummaryCards summary={data.summary} />
          <Collection summary={data.summary} />
          <Card title="Invoices" description={`${data.total} invoices match the current filters`} flush>
            {data.items.length === 0 ? (
              <EmptyState title="No invoices found" description="Try a wider date range or clear the patient search." />
            ) : (
              <>
                <DataTable caption="Invoices" columns={columns} rows={data.items} rowKey={(i) => i.id} />
                <Pagination page={data.page} pageSize={data.pageSize} total={data.total} itemLabel="invoices" onPageChange={setPage} />
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
