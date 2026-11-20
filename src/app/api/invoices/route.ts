import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/server/db";
import { forbidUnless, intParam } from "@/server/http";
import { queryInvoices } from "@/server/invoices";
import type { InvoiceStatus } from "@/types";

export function GET(request: NextRequest) {
  const denied = forbidUnless(request, "billing:view");
  if (denied) return denied;

  const sp = request.nextUrl.searchParams;
  return NextResponse.json(
    queryInvoices(db().invoices, {
      from: sp.get("from") ?? "",
      to: sp.get("to") ?? "",
      patient: sp.get("patient") ?? "",
      status: (sp.get("status") ?? "") as "" | InvoiceStatus,
      page: intParam(sp.get("page"), 1, 1, 1000),
      pageSize: intParam(sp.get("pageSize"), 10, 5, 50),
    }),
  );
}
