import { api } from "@/store/api";
import type { ClinicSettings } from "@/types";

export const settingsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSettings: build.query<ClinicSettings, void>({
      query: () => "/settings",
      providesTags: ["Settings"],
    }),
    updateSettings: build.mutation<ClinicSettings, ClinicSettings>({
      query: (body) => ({ url: "/settings", method: "PUT", body }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
