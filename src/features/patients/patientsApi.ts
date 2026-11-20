import { api } from "@/store/api";
import type { PatientStats } from "@/backend/patients";
import type { Appointment, Doctor, Paginated, Patient, PatientInput } from "@/types";

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
    getPatient: build.query<{ patient: Patient; appointments: Appointment[] }, string>({
      query: (id) => `/patients/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Patient", id }],
    }),
    createPatient: build.mutation<Patient, PatientInput>({
      query: (body) => ({ url: "/patients", method: "POST", body }),
      // A new patient changes the list, so every cached list query is refetched.
      invalidatesTags: [
        { type: "Patient", id: "LIST" },
        { type: "Patient", id: "STATS" },
      ],
    }),
    updatePatient: build.mutation<Patient, { id: string; body: PatientInput }>({
      query: ({ id, body }) => ({ url: `/patients/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Patient", id },
        { type: "Patient", id: "LIST" },
        { type: "Patient", id: "STATS" },
      ],
    }),
    getPatientStats: build.query<PatientStats, void>({
      query: () => "/patients/stats",
      providesTags: [{ type: "Patient", id: "STATS" }],
    }),
    getDoctors: build.query<Doctor[], void>({
      query: () => "/doctors",
      providesTags: [{ type: "Doctor", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientQuery,
  useGetPatientStatsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useGetDoctorsQuery,
} = patientsApi;
