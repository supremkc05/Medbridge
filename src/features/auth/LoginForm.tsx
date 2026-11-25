"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck, Eye, EyeOff, LoaderCircle, Lock, Mail, Receipt, ShieldCheck, Users } from "lucide-react";
import logo from "@/assets/brand/medbridge-logo.png";
import { Button, TextField } from "@/components/ui";
import { routes } from "@/lib/routes";
import styles from "./LoginForm.module.scss";

const POINTS = [
  { icon: CalendarCheck, title: "Today's schedule at a glance", text: "Check-ins and openings update as the day moves." },
  { icon: Users, title: "One record per patient", text: "Visits, notes and invoices in the same place." },
  { icon: Receipt, title: "Billing that follows the visit", text: "Invoices and reminders from the same data." },
  { icon: ShieldCheck, title: "Access by role", text: "Front desk, doctors and managers see what they need." },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("alex.morgan@clinic.example");
  const [password, setPassword] = useState("••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !password) {
      setError("Enter your work email and password.");
      return;
    }
    setBusy(true);
    router.push(routes.dashboard);
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <Image src={logo} alt="MedBridge — Connect, Care, Heal" className={styles.logo} priority />
        <div className={styles.copy}>
          <h1>Welcome back</h1>
          <p>Sign in to manage appointments, patient records and billing for your clinic.</p>
        </div>
        <form onSubmit={submit} noValidate className={styles.form}>
          <TextField
            id="email"
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error && !email.includes("@") ? error : undefined}
            autoComplete="username"
            leading={<Mail size={17} />}
          />
          <TextField
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && !password ? error : undefined}
            autoComplete="current-password"
            leading={<Lock size={17} />}
            trailing={
              <button
                type="button"
                className={styles.reveal}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />
          <div className={styles.row}>
            <label className={styles.remember}>
              <input type="checkbox" defaultChecked /> Keep me signed in
            </label>
            <a href="#" className={styles.link} onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>
          <Button type="submit" disabled={busy} className={styles.submit} aria-busy={busy}>
            {busy ? (
              <>
                <LoaderCircle size={17} className={styles.spin} /> Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight size={17} className={styles.arrow} />
              </>
            )}
          </Button>
        </form>
        <p className={styles.footer}>
          <ShieldCheck size={14} /> Two-factor sign-in · HIPAA-aware data handling
        </p>
      </section>

      <aside className={styles.hero} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbA}`} />
        <span className={`${styles.orb} ${styles.orbB}`} />

        <div className={styles.heroInner}>
          <p className={styles.kicker}>Connect · Care · Heal</p>
          <h2>
            One place for your <span className={styles.accent}>clinic&apos;s day</span>.
          </h2>
          <p className={styles.heroText}>
            Scheduling, patient records and billing share the same data, so the front desk, doctors and managers see the same picture.
          </p>

          {/* heartbeat trace drawn across the panel */}
          <svg className={styles.pulse} viewBox="0 0 520 80" preserveAspectRatio="none">
            <path className={styles.trace} pathLength={1} d="M0 44 H150 L168 44 L180 18 L196 70 L210 8 L224 58 L236 44 H330 L344 44 L352 30 L362 52 L372 44 H520" />
          </svg>

          <ul className={styles.points}>
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className={styles.pointIcon}>
                  <Icon size={18} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
