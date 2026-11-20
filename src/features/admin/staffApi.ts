import { api } from "@/store/api";
import type { Role, StaffMember, StaffStatus } from "@/types";

export const staffApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStaff: build.query<StaffMember[], void>({
      query: () => "/staff",
      providesTags: (result) => [
        { type: "Staff" as const, id: "LIST" },
        ...(result?.map((s) => ({ type: "Staff" as const, id: s.id })) ?? []),
      ],
    }),
    inviteStaff: build.mutation<StaffMember, { name: string; email: string; role: Role }>({
      query: (body) => ({ url: "/staff", method: "POST", body }),
      invalidatesTags: [{ type: "Staff", id: "LIST" }],
    }),
    updateStaff: build.mutation<StaffMember, { id: string; role?: Role; status?: StaffStatus }>({
      query: ({ id, ...body }) => ({ url: `/staff/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Staff", id }],
    }),
  }),
});

export const { useGetStaffQuery, useInviteStaffMutation, useUpdateStaffMutation } = staffApi;
