"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  type Column,
  type SortOrder,
} from "@/components/ui";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ageFrom, formatDate } from "@/lib/format";
import { can } from "@/lib/permissions";
import { REFERENCE_DATE } from "@/lib/referenceDate";
import { useAppSelector } from "@/store/hooks";
import type { Patient } from "@/types";
import { useGetDoctorsQuery, useGetPatientsQuery, type PatientListParams } from "./patientsApi";
import styles from "./PatientsList.module.scss";

const LAST_VISIT_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "never", label: "No visits yet" },
];

export function PatientsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = useAppSelector((s) => s.session.role);

  // Filters live in the URL so a filtered view can be shared or returned to.
  const params: PatientListParams = {
    search: searchParams.get("search") ?? "",
    doctorId: searchParams.get("doctorId") ?? "",
    lastVisit: searchParams.get("lastVisit") ?? "",
    status: searchParams.get("status") ?? "",
    sort: searchParams.get("sort") ?? "name",
    order: searchParams.get("order") === "desc" ? "desc" : "asc",
    page: Number(searchParams.get("page") ?? 1),
    pageSize: 10,
  };

  const [searchInput, setSearchInput] = useState(params.search);
  const debouncedSearch = useDebouncedValue(searchInput);

  const update = (changes: Partial<Record<keyof PatientListParams, string | number>>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === "" || v === undefined) next.delete(k);
      else next.set(k, String(v));
    }
    if (!("page" in changes)) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (debouncedSearch !== params.search) update({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError, refetch } = useGetPatientsQuery(params);
  const { data: doctors = [] } = useGetDoctorsQuery();
  const doctorName = useMemo(() => Object.fromEntries(doctors.map((d) => [d.id, d.name])), [doctors]);

  const hasFilters = Boolean(params.search || params.doctorId || params.lastVisit || params.status);

  const columns: Column<Patient>[] = [
    {
      key: "name",
      header: "Patient",
      sortable: true,
      render: (p) => (
        <div className={styles.patientCell}>
          <span className={styles.avatar} aria-hidden="true">
            {p.firstName[0]}
            {p.lastName[0]}
          </span>
          <span>
            <Link href={`/patients/${p.id}`} className={styles.name} onClick={(e) => e.stopPropagation()}>
              {p.firstName} {p.lastName}
            </Link>
            <span className={styles.sub}>{p.mrn}</span>
          </span>
        </div>
      ),
    },
    {
      key: "dateOfBirth",
      header: "Date of birth",
      sortable: true,
      render: (p) => (
        <span>
          {formatDate(p.dateOfBirth)}
          <span className={styles.sub}>{ageFrom(p.dateOfBirth, REFERENCE_DATE)} years</span>
        </span>
      ),
    },
    { key: "phone", header: "Phone", render: (p) => p.phone },
    { key: "doctor", header: "Primary doctor", sortable: true, render: (p) => doctorName[p.primaryDoctorId] ?? "—" },
    {
      key: "lastVisit",
      header: "Last visit",
      sortable: true,
      render: (p) => (p.lastVisit ? formatDate(p.lastVisit) : <span className={styles.muted}>No visits</span>),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status === "active" ? "Active" : "Inactive"}</Badge>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Patients"
        description="Search the clinic's patient records and open a record to see appointment history."
        actions={
          can(role, "patients:create") && (
            <Button onClick={() => router.push("/patients/new")}>+ Add patient</Button>
          )
        }
      />

      <Card flush>
        <div className={styles.filters} role="search">
          <div className={styles.searchBox}>
            <label htmlFor="patient-search" className="visually-hidden">
              Search patients
            </label>
            <input
              id="patient-search"
              type="search"
              placeholder="Search by name, MRN, phone or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={styles.input}
            />
          </div>
          <label className={styles.filter}>
            <span>Doctor</span>
            <select value={params.doctorId} onChange={(e) => update({ doctorId: e.target.value })}>
              <option value="">All doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filter}>
            <span>Last visit</span>
            <select value={params.lastVisit} onChange={(e) => update({ lastVisit: e.target.value })}>
              {LAST_VISIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filter}>
            <span>Status</span>
            <select value={params.status} onChange={(e) => update({ status: e.target.value })}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput("");
                router.replace(pathname, { scroll: false });
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingState label="Loading patients" />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            title="No patients match these filters"
            description="Try a different search term or clear the filters to see all patients."
          />
        ) : (
          data && (
            <div className={isFetching ? styles.fetching : undefined} aria-busy={isFetching}>
              <DataTable
                caption="Patients"
                columns={columns}
                rows={data.items}
                rowKey={(p) => p.id}
                sort={{ key: params.sort, order: params.order }}
                onSortChange={(key: string, order: SortOrder) => update({ sort: key, order })}
                onRowClick={(p) => router.push(`/patients/${p.id}`)}
              />
              <Pagination
                page={data.page}
                pageSize={data.pageSize}
                total={data.total}
                itemLabel="patients"
                onPageChange={(page) => update({ page })}
              />
            </div>
          )
        )}
      </Card>
    </>
  );
}
