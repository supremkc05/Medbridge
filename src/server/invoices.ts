import type { Invoice, InvoiceStatus, Paginated } from "@/types";

export interface InvoiceQuery {
  from?: string;
  to?: string;
  patient?: string;
  status?: "" | InvoiceStatus;
  page?: number;
  pageSize?: number;
}

export interface StatusTotal {
  count: number;
  amount: number;
}

export interface InvoiceSummary {
  total: StatusTotal;
  paid: StatusTotal;
  pending: StatusTotal;
  overdue: StatusTotal;
  byMonth: { month: string; paid: number; outstanding: number }[];
}

export type InvoiceResult = Paginated<Invoice> & { summary: InvoiceSummary };

export function summarize(invoices: Invoice[]): InvoiceSummary {
  const empty = (): StatusTotal => ({ count: 0, amount: 0 });
  const summary: InvoiceSummary = { total: empty(), paid: empty(), pending: empty(), overdue: empty(), byMonth: [] };
  const months = new Map<string, { paid: number; outstanding: number }>();
  for (const inv of invoices) {
    summary.total.count++;
    summary.total.amount += inv.amount;
    summary[inv.status].count++;
    summary[inv.status].amount += inv.amount;
    const key = inv.issueDate.slice(0, 7);
    const m = months.get(key) ?? { paid: 0, outstanding: 0 };
    if (inv.status === "paid") m.paid += inv.amount;
    else m.outstanding += inv.amount;
    months.set(key, m);
  }
  summary.byMonth = [...months.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([month, v]) => ({ month, ...v }));
  return summary;
}

/**
 * The same filters drive both the table and the totals, so the figures shown
 * always agree with the rows the user can see.
 */
export function queryInvoices(invoices: Invoice[], q: InvoiceQuery): InvoiceResult {
  const patient = q.patient?.trim().toLowerCase() ?? "";
  const rows = invoices.filter(
    (inv) =>
      (!q.from || inv.issueDate >= q.from) &&
      (!q.to || inv.issueDate <= q.to) &&
      (!patient || inv.patientName.toLowerCase().includes(patient) || inv.number.toLowerCase().includes(patient)) &&
      (!q.status || inv.status === q.status),
  );
  const pageSize = q.pageSize ?? 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(q.page ?? 1, pageCount);
  return {
    items: rows.slice((page - 1) * pageSize, page * pageSize),
    total: rows.length,
    page,
    pageSize,
    summary: summarize(rows),
  };
}
