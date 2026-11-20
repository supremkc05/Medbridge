import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Role } from "@/types";

/**
 * Base RTK Query API. Feature modules add their endpoints with
 * `api.injectEndpoints` so that each module owns its own data layer.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const role = (getState() as { session: { role: Role } }).session.role;
      // Demo only: the mock API reads the role from this header to enforce permissions.
      headers.set("x-demo-role", role);
      return headers;
    },
  }),
  tagTypes: ["Patient", "Doctor", "Staff", "Settings", "Invoice"],
  endpoints: () => ({}),
});
