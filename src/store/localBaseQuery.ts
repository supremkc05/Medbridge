import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { route } from "@/backend/router";
import type { Role } from "@/types";

const LATENCY_MS = 180;

/**
 * RTK Query base query that sends requests to the in-browser router instead of
 * the network. Components and endpoints are written exactly as they would be
 * against a REST API, so swapping back to `fetchBaseQuery` needs no other change.
 */
export const localBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api) => {
  const { url, method = "GET", params = {}, body } = typeof args === "string" ? { url: args } : args;
  const role = (api.getState() as { session: { role: Role } }).session.role;

  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

  const stringParams = Object.fromEntries(
    Object.entries(params as Record<string, unknown>).map(([k, v]) => [k, v === undefined || v === null ? "" : String(v)]),
  );
  // Copy the body so that the store never shares objects with component state.
  const payload = body === undefined ? undefined : structuredClone(body);
  const res = route({ method: method.toUpperCase(), path: url, params: stringParams, body: payload, role });
  const data = structuredClone(res.data);
  return res.status >= 400 ? { error: { status: res.status, data } } : { data };
};
