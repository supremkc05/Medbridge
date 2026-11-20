import { route } from "@/backend/router";

describe("in-browser API router", () => {
  it("lists patients with pagination", () => {
    const res = route({ method: "GET", path: "/patients", params: { pageSize: "5" }, role: "front_desk" });
    expect(res.status).toBe(200);
    expect((res.data as { items: unknown[] }).items).toHaveLength(5);
  });

  it("rejects staff changes from non-managers", () => {
    const res = route({ method: "PATCH", path: "/staff/s5", params: {}, body: { role: "manager" }, role: "front_desk" });
    expect(res.status).toBe(403);
  });

  it("returns field errors for an invalid patient", () => {
    const res = route({ method: "POST", path: "/patients", params: {}, body: { firstName: "" }, role: "manager" });
    expect(res.status).toBe(422);
    expect((res.data as { fieldErrors: Record<string, string> }).fieldErrors.firstName).toBeDefined();
  });

  it("keeps at least one active manager", () => {
    const res = route({ method: "PATCH", path: "/staff/s1", params: {}, body: { status: "disabled" }, role: "manager" });
    expect(res.status).toBe(409);
  });

  it("only allows valid appointment status changes", () => {
    const day = route({ method: "GET", path: "/appointments", params: { date: "2026-11-18" }, role: "front_desk" });
    const items = (day.data as { items: { id: string; status: string }[] }).items;
    const done = items.find((a) => a.status === "completed")!;
    expect(route({ method: "PATCH", path: `/appointments/${done.id}`, params: {}, body: { status: "checked_in" }, role: "front_desk" }).status).toBe(409);
    const next = items.find((a) => a.status === "scheduled")!;
    expect(route({ method: "PATCH", path: `/appointments/${next.id}`, params: {}, body: { status: "checked_in" }, role: "billing" }).status).toBe(403);
    expect(route({ method: "PATCH", path: `/appointments/${next.id}`, params: {}, body: { status: "checked_in" }, role: "front_desk" }).status).toBe(200);
  });

  it("builds the overview from the same data", () => {
    const res = route({ method: "GET", path: "/dashboard", params: {}, role: "manager" });
    const data = res.data as { kpis: { appointmentsToday: number }; schedule: unknown[] };
    expect(res.status).toBe(200);
    expect(data.kpis.appointmentsToday).toBe(data.schedule.length);
  });

  it("returns 404 for unknown routes", () => {
    expect(route({ method: "GET", path: "/nope", params: {}, role: "manager" }).status).toBe(404);
  });
});
