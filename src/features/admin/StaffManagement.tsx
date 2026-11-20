"use client";

import { useState, type FormEvent } from "react";
import { Lock, Mail, Plus, Receipt, ShieldCheck, Stethoscope, UserRound, X } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DataTable,
  ErrorState,
  LoadingState,
  Notice,
  PageHeader,
  SelectField,
  TextField,
  type BadgeTone,
  type Column,
  StatCard,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import { ACTION_LABELS, ALL_ACTIONS, can } from "@/lib/permissions";
import { useAppSelector } from "@/store/hooks";
import { ROLE_LABELS, type ApiError, type Role, type StaffMember, type StaffStatus } from "@/types";
import { useGetStaffQuery, useInviteStaffMutation, useUpdateStaffMutation } from "./staffApi";
import styles from "./StaffManagement.module.scss";

const STATUS: Record<StaffStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "success" },
  invited: { label: "Invited", tone: "info" },
  disabled: { label: "Disabled", tone: "neutral" },
};

const ROLES = Object.keys(ROLE_LABELS) as Role[];

const ROLE_META = {
  manager: { icon: ShieldCheck, tone: "violet", hint: "Full administrative access" },
  doctor: { icon: Stethoscope, tone: "teal", hint: "Clinical records" },
  front_desk: { icon: UserRound, tone: "blue", hint: "Registration and scheduling" },
  billing: { icon: Receipt, tone: "amber", hint: "Invoices and payments" },
} as const;
const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));

function InviteForm({ onDone }: { onDone: (name: string) => void }) {
  const [values, setValues] = useState({ name: "", email: "", role: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invite, { isLoading }] = useInviteStaffMutation();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await invite({ ...values, role: values.role as Role }).unwrap();
      onDone(values.name);
    } catch (err) {
      setErrors((err as { data?: ApiError }).data?.fieldErrors ?? { name: "The invitation could not be sent." });
    }
  };

  return (
    <form onSubmit={submit} noValidate className={styles.invite}>
      <TextField id="invite-name" label="Full name" required value={values.name} error={errors.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
      <TextField id="invite-email" label="Work email" type="email" required value={values.email} error={errors.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
      <SelectField id="invite-role" label="Role" required placeholder="Choose a role" options={ROLE_OPTIONS} value={values.role} error={errors.role} onChange={(e) => setValues({ ...values, role: e.target.value })} />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Sending…" : "Send invitation"}
      </Button>
    </form>
  );
}

export function StaffManagement() {
  const role = useAppSelector((s) => s.session.role);
  const canManage = can(role, "staff:manage");
  const { data: staff, isLoading, isError, refetch } = useGetStaffQuery();
  const [updateStaff] = useUpdateStaffMutation();
  const [showInvite, setShowInvite] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "warning"; text: string } | null>(null);

  const change = async (member: StaffMember, changes: { role?: Role; status?: StaffStatus }, text: string) => {
    if (changes.role && !window.confirm(`Change ${member.name}'s role to ${ROLE_LABELS[changes.role]}?`)) return;
    try {
      await updateStaff({ id: member.id, ...changes }).unwrap();
      setMessage({ tone: "success", text });
    } catch (err) {
      setMessage({ tone: "warning", text: (err as { data?: ApiError }).data?.message ?? "The change could not be saved." });
    }
  };

  if (isLoading) return <LoadingState label="Loading staff" />;
  if (isError || !staff) return <ErrorState onRetry={refetch} />;

  const counts = ROLES.map((r) => ({ role: r, count: staff.filter((s) => s.role === r && s.status !== "disabled").length }));

  const columns: Column<StaffMember>[] = [
    {
      key: "name",
      header: "Staff member",
      render: (s) => (
        <div className={styles.person}>
          <Avatar name={s.name} />
          <span>
            <strong>{s.name}</strong>
            <span className={styles.sub}>{s.email}</span>
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (s) =>
        canManage ? (
          <>
            <label htmlFor={`role-${s.id}`} className="visually-hidden">
              Role for {s.name}
            </label>
            <select
              id={`role-${s.id}`}
              className={styles.roleSelect}
              value={s.role}
              disabled={s.status === "disabled"}
              onChange={(e) => change(s, { role: e.target.value as Role }, `${s.name} is now ${ROLE_LABELS[e.target.value as Role]}.`)}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </>
        ) : (
          <span className={`${styles.rolePill} ${styles[s.role]}`}>{ROLE_LABELS[s.role]}</span>
        ),
    },
    { key: "status", header: "Status", render: (s) => <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge> },
    { key: "lastActive", header: "Last active", render: (s) => formatDate(s.lastActive, "Never signed in") },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            render: (s: StaffMember) =>
              s.status === "disabled" ? (
                <Button size="sm" variant="secondary" onClick={() => change(s, { status: "active" }, `${s.name}'s account was re-enabled.`)}>
                  Enable
                </Button>
              ) : s.status === "invited" ? (
                <Button size="sm" variant="ghost" onClick={() => setMessage({ tone: "success", text: `Invitation re-sent to ${s.email}.` })}>
                  <Mail size={14} /> Resend invite
                </Button>
              ) : (
                <Button size="sm" variant="danger" onClick={() => change(s, { status: "disabled" }, `${s.name}'s account was disabled.`)}>
                  Disable
                </Button>
              ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Staff & roles"
        description="Manage who can sign in to the clinic's system and what each person is allowed to do."
        actions={
          canManage && (
            <Button variant={showInvite ? "secondary" : "primary"} onClick={() => setShowInvite((v) => !v)}>
              {showInvite ? <X size={16} /> : <Plus size={16} />} {showInvite ? "Close" : "Invite staff"}
            </Button>
          )
        }
      />

      {!canManage && (
        <Notice tone="info">
          <Lock size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} aria-hidden="true" />
          You are viewing this page as <strong>{ROLE_LABELS[role]}</strong>. Only clinic managers can invite staff or change roles.
        </Notice>
      )}
      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      <div className={styles.counts}>
        {counts.map((c) => {
          const meta = ROLE_META[c.role];
          return (
            <StatCard
              key={c.role}
              label={`${ROLE_LABELS[c.role]}s`.replace("Front desks", "Front desk staff")}
              value={c.count}
              hint={meta.hint}
              icon={<meta.icon size={18} />}
              tone={meta.tone}
            />
          );
        })}
      </div>

      {showInvite && canManage && (
        <div className={styles.section}>
          <Card title="Invite a staff member" description="They will receive an email to set up their account.">
            <InviteForm
              onDone={(name) => {
                setShowInvite(false);
                setMessage({ tone: "success", text: `Invitation sent to ${name}.` });
              }}
            />
          </Card>
        </div>
      )}

      <div className={styles.layout}>
        <Card title="Staff accounts" description={`${staff.length} accounts`} flush>
          <DataTable caption="Staff accounts" columns={columns} rows={staff} rowKey={(s) => s.id} />
        </Card>

        <Card title="Role permissions" description="What each role can do in MedBridge" flush>
          <table className={styles.matrix}>
            <caption className="visually-hidden">Role permissions</caption>
            <thead>
              <tr>
                <th scope="col">Permission</th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" title={ROLE_LABELS[r]}>
                    {ROLE_LABELS[r].split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_ACTIONS.map((a) => (
                <tr key={a}>
                  <th scope="row">{ACTION_LABELS[a]}</th>
                  {ROLES.map((r) => (
                    <td key={r}>
                      {can(r, a) ? (
                        <span className={styles.yes} aria-label="Allowed">
                          ✓
                        </span>
                      ) : (
                        <span className={styles.no} aria-label="Not allowed">
                          –
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
