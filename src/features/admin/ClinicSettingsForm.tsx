"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, EmptyState, ErrorState, LoadingState, Notice, PageHeader, SelectField, TextField } from "@/components/ui";
import { can } from "@/lib/permissions";
import { validateSettings, type SettingsErrors } from "@/lib/validation/settings";
import { useAppSelector } from "@/store/hooks";
import { ROLE_LABELS, type ApiError, type ClinicSettings } from "@/types";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "./settingsApi";
import styles from "./ClinicSettingsForm.module.scss";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMEZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles"].map((t) => ({
  value: t,
  label: t.replace("America/", "").replace("_", " ") + ` (${t})`,
}));
const LENGTHS = [10, 15, 20, 30, 45, 60].map((m) => ({ value: String(m), label: `${m} minutes` }));

function SettingsEditor({ initial }: { initial: ClinicSettings }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [saved, setSaved] = useState(false);
  const [save, { isLoading }] = useUpdateSettingsMutation();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  const set = <K extends keyof ClinicSettings>(key: K, value: ClinicSettings[K]) => {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: value }));
  };

  const toggleDay = (day: string) =>
    set("workingDays", values.workingDays.includes(day) ? values.workingDays.filter((d) => d !== day) : DAYS.filter((d) => d === day || values.workingDays.includes(d)));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateSettings(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await save(values).unwrap();
      setSaved(true);
    } catch (err) {
      setErrors(((err as { data?: ApiError }).data?.fieldErrors ?? {}) as SettingsErrors);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={styles.form}>
      {saved && <Notice tone="success">Clinic settings saved.</Notice>}

      <Card title="Clinic details" description="Shown on appointment reminders and invoices.">
        <div className={styles.grid}>
          <div className={styles.full}>
            <TextField id="name" label="Clinic name" required value={values.name} error={errors.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <TextField id="phone" label="Phone" required value={values.phone} error={errors.phone} onChange={(e) => set("phone", e.target.value)} />
          <TextField id="email" label="Contact email" type="email" value={values.email} error={errors.email} onChange={(e) => set("email", e.target.value)} />
          <div className={styles.full}>
            <TextField id="address" label="Address" required value={values.address} error={errors.address} onChange={(e) => set("address", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card title="Scheduling" description="Used when booking appointments.">
        <div className={styles.grid}>
          <SelectField id="timezone" label="Time zone" options={TIMEZONES} value={values.timezone} onChange={(e) => set("timezone", e.target.value)} />
          <SelectField id="appointmentLength" label="Default appointment length" options={LENGTHS} value={String(values.appointmentLength)} onChange={(e) => set("appointmentLength", Number(e.target.value))} />
          <TextField id="openingTime" label="Opening time" type="time" value={values.openingTime} onChange={(e) => set("openingTime", e.target.value)} />
          <TextField id="closingTime" label="Closing time" type="time" value={values.closingTime} error={errors.closingTime} onChange={(e) => set("closingTime", e.target.value)} />
          <fieldset className={`${styles.full} ${styles.days}`} aria-describedby={errors.workingDays ? "days-error" : undefined}>
            <legend>Working days</legend>
            <div className={styles.dayList}>
              {DAYS.map((d) => (
                <label key={d} className={`${styles.day} ${values.workingDays.includes(d) ? styles.dayOn : ""}`}>
                  <input type="checkbox" checked={values.workingDays.includes(d)} onChange={() => toggleDay(d)} />
                  {d}
                </label>
              ))}
            </div>
            {errors.workingDays && (
              <p id="days-error" className={styles.error} role="alert">
                {errors.workingDays}
              </p>
            )}
          </fieldset>
        </div>
      </Card>

      <Card title="Billing" description="Defaults for new invoices.">
        <div className={styles.grid3}>
          <SelectField id="currency" label="Currency" options={[{ value: "USD", label: "US dollar (USD)" }]} value={values.currency} onChange={(e) => set("currency", e.target.value)} />
          <TextField id="invoicePrefix" label="Invoice number prefix" value={values.invoicePrefix} error={errors.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} hint={`Next invoice: ${values.invoicePrefix || "?"}1250`} />
          <TextField id="paymentTermsDays" label="Payment terms (days)" type="number" min={0} max={120} value={values.paymentTermsDays} error={errors.paymentTermsDays} onChange={(e) => set("paymentTermsDays", Number(e.target.value))} />
        </div>
      </Card>

      <div className={styles.actions}>
        {dirty && <span className={styles.unsaved}>You have unsaved changes</span>}
        <Button variant="secondary" disabled={!dirty || isLoading} onClick={() => { setValues(initial); setErrors({}); }}>
          Discard
        </Button>
        <Button type="submit" disabled={!dirty || isLoading}>
          {isLoading ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

export function ClinicSettingsForm() {
  const role = useAppSelector((s) => s.session.role);
  const allowed = can(role, "settings:edit");
  const { data, isLoading, isError, refetch } = useGetSettingsQuery(undefined, { skip: !allowed });

  return (
    <>
      <PageHeader title="Clinic settings" description="Clinic-wide information and defaults for scheduling and billing." />
      {!allowed ? (
        <Card>
          <EmptyState
            title="Access restricted"
            description={`Clinic settings can only be changed by a clinic manager. You are signed in as ${ROLE_LABELS[role]}.`}
          />
        </Card>
      ) : isLoading ? (
        <LoadingState label="Loading settings" />
      ) : isError || !data ? (
        <ErrorState onRetry={refetch} />
      ) : (
        // Re-mount the editor when saved data changes so the form starts from the latest values.
        <SettingsEditor key={JSON.stringify(data)} initial={data} />
      )}
    </>
  );
}
