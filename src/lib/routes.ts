/** Patient record URLs use a query string so every page can be served from a static build. */
export const routes = {
  login: "/login",
  dashboard: "/dashboard",
  appointments: "/appointments",
  patients: "/patients",
  billing: "/billing",
  newPatient: "/patients/new",
  patient: (id: string) => `/patients/record?id=${encodeURIComponent(id)}`,
  editPatient: (id: string) => `/patients/edit?id=${encodeURIComponent(id)}`,
};
