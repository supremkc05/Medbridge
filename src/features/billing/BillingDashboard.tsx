"use client";

import { useState } from "react";
import {
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
} from "@/components/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDate, formatMoney } from "@/lib/format";
import { can } from "@/lib/permissions";
import { useAppSelector } from "@/store/hooks";
import { ROLE_LABELS, type Invoice, type InvoiceStatus } from "@/types";
import type { InvoiceSummary } from "@/server/invoices";
import { useGetInvoicesQuery } from "./billingApi";
import { PERIOD_OPTIONS, periodRange, type Period } from "./periods";
import styles from "./BillingDashboard.module.scss";

const STATUS: Record<InvoiceStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "Paid", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  overdue: { label: "Overdue", tone: "danger" },
};

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

function SummaryCards({ summary }: { summary: InvoiceSummary }) {
  const cards = [
    { key: "total", label: "Total invoiced", data: summary.total, className: styles.total },
    { key: "paid", label: "Paid", data: summary.paid, className: styles.paid },
    { key: "pending", label: "Pending", data: summary.pending, className: styles.pending },
    { key: "overdue", label: "Overdue", data: summary.overdue, className: styles.overdue },
  ];
  return (
    <div className={styles.cards}>
      {cards.map((c) => (
        <div key={c.key} className={`${styles.card} ${c.className}`}>
          <span className={styles.cardLabel}>{c.label}</span>
          <strong className={styles.cardValue}>{formatMoney(c.data.amount)}</strong>
          <span className={styles.cardSub}>
            {c.data.count} {c.data.count === 1 ? "invoice" : "invoices"}
          </span>
        </div>
      ))}
    </div>
  );
}

function Collection({ summary }: { summary: InvoiceSummary }) {
  const total = summary.total.amount || 1;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;
  const max = Math.max(1, ...summary.byMonth.map((m) => m.paid + m.outstanding));
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
      <Card title="Invoiced by month" description="Paid vs. outstanding">
        {summary.byMonth.length === 0 ? (
          <p className={styles.noData}>No invoices in this period.</p>
        ) : (
          <div className={styles.bars}>
            {summary.byMonth.map((m) => (
              <div key={m.month} className={styles.barCol} title={`${m.month}: ${formatMoney(m.paid)} paid, ${formatMoney(m.outstanding)} outstanding`}>
                <div className={styles.barTrack}>
                  <span className={styles.barOutstanding} style={{ height: `${(m.outstanding / max) * 100}%` }} />
                  <span className={styles.barPaid} style={{ height: `${(m.paid / max) * 100}%` }} />
                </div>
                <span className={styles.barLabel}>{MONTH.format(new Date(`${m.month}-01T00:00:00Z`))}</span>
              </div>
            ))}
          </div>
        )}
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
    { key: "patient", header: "Patient", render: (i) => <strong className={styles.patient}>{i.patientName}</strong> },
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
          <EmptyState title="Access restricted" description={`Billing is not available to the ${ROLE_LABELS[role]} role.`} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Billing"
        description={`Invoices issued between ${formatDate(range.from)} and ${formatDate(range.to)}.`}
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
          <input type="search" placeholder="e.g. Nguyen or INV-1102" value={patientInput} onChange={(e) => resetPage(setPatientInput)(e.target.value)} />
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
