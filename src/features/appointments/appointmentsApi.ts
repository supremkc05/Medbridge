import { api } from "@/store/api";
import type { AppointmentRow } from "@/backend/appointments";
import type { Appointment } from "@/types";

export interface AppointmentDay {
  date: string;
  week: { date: string; count: number }[];
  items: AppointmentRow[];
  summary: { total: number; completed: number; checkedIn: number; upcoming: number; noShow: number };
}

export const appointmentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAppointments: build.query<AppointmentDay, { date: string; doctorId: string; status: string }>({
      query: (params) => ({ url: "/appointments", params }),
      providesTags: [{ type: "Appointment", id: "LIST" }],
    }),
    updateAppointmentStatus: build.mutation<Appointment, { id: string; status: Appointment["status"] }>({
      query: ({ id, status }) => ({ url: `/appointments/${id}`, method: "PATCH", body: { status } }),
      invalidatesTags: [{ type: "Appointment", id: "LIST" }, "Dashboard", { type: "Patient", id: "LIST" }],
    }),
  }),
});

export const { useGetAppointmentsQuery, useUpdateAppointmentStatusMutation } = appointmentsApi;
