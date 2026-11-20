import { queryInvoices } from "@/server/invoices";
import type { Invoice } from "@/types";

const inv = (id: string, issueDate: string, amount: number, status: Invoice["status"], patientName = "Ava Turner"): Invoice => ({
  id,
  number: `INV-${id}`,
  patientId: "p1",
  patientName,
  service: "Consultation",
  issueDate,
  dueDate: issueDate,
  amount,
  status,
});

const invoices = [
  inv("1", "2026-09-02", 100, "paid"),
  inv("2", "2026-10-15", 200, "pending"),
  inv("3", "2026-10-20", 50, "overdue", "Liam Brooks"),
  inv("4", "2026-11-01", 80, "paid", "Liam Brooks"),
];

describe("queryInvoices", () => {
  it("returns totals that match the filtered rows", () => {
    const result = queryInvoices(invoices, { from: "2026-10-01", to: "2026-11-30" });
    expect(result.total).toBe(3);
    expect(result.summary.total).toEqual({ count: 3, amount: 330 });
    expect(result.summary.paid).toEqual({ count: 1, amount: 80 });
    expect(result.summary.pending.amount).toBe(200);
    expect(result.summary.overdue.amount).toBe(50);
  });

  it("filters by patient name or invoice number", () => {
    expect(queryInvoices(invoices, { patient: "brooks" }).total).toBe(2);
    expect(queryInvoices(invoices, { patient: "inv-1" }).items[0].id).toBe("1");
  });

  it("applies the status filter to the totals as well", () => {
    const result = queryInvoices(invoices, { status: "paid" });
    expect(result.summary.total.amount).toBe(180);
    expect(result.summary.pending.count).toBe(0);
  });

  it("groups amounts by month in chronological order", () => {
    const { byMonth } = queryInvoices(invoices, {}).summary;
    expect(byMonth.map((m) => m.month)).toEqual(["2026-09", "2026-10", "2026-11"]);
    expect(byMonth[1]).toEqual({ month: "2026-10", paid: 0, outstanding: 250 });
  });
});
