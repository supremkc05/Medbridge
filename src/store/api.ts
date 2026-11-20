import { createApi } from "@reduxjs/toolkit/query/react";
import { localBaseQuery } from "./localBaseQuery";

/**
 * Base RTK Query API. Feature modules add their endpoints with
 * `api.injectEndpoints` so that each module owns its own data layer.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: localBaseQuery,
  tagTypes: ["Patient", "Doctor", "Staff", "Settings", "Invoice"],
  endpoints: () => ({}),
});
