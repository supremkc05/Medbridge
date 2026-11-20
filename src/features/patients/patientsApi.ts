import { api } from "@/store/api";
import type { Doctor, Paginated, Patient } from "@/types";

export interface PatientListParams {
  search: string;
  doctorId: string;
  lastVisit: string;
  status: string;
  sort: string;
  order: "asc" | "desc";
  page: number;
  pageSize: number;
}

export const patientsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPatients: build.query<Paginated<Patient>, PatientListParams>({
      query: (params) => ({ url: "/patients", params }),
      providesTags: (result) => [
        { type: "Patient" as const, id: "LIST" },
        ...(result?.items.map((p) => ({ type: "Patient" as const, id: p.id })) ?? []),
      ],
    }),
    getDoctors: build.query<Doctor[], void>({
      query: () => "/doctors",
      providesTags: [{ type: "Doctor", id: "LIST" }],
    }),
  }),
});

export const { useGetPatientsQuery, useGetDoctorsQuery } = patientsApi;
