import { api } from "@/store/api";
import type { InvoiceResult } from "@/backend/invoices";

export interface InvoiceParams {
  from: string;
  to: string;
  patient: string;
  status: string;
  page: number;
  pageSize: number;
}

export const billingApi = api.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query<InvoiceResult, InvoiceParams>({
      query: (params) => ({ url: "/invoices", params }),
      providesTags: [{ type: "Invoice", id: "LIST" }],
    }),
  }),
});

export const { useGetInvoicesQuery } = billingApi;
