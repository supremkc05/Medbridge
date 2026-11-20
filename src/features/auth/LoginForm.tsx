"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Lock, Mail, ShieldCheck, Users } from "lucide-react";
import logo from "@/assets/brand/medbridge-logo.png";
import { Button, TextField } from "@/components/ui";
import { routes } from "@/lib/routes";
import styles from "./LoginForm.module.scss";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("alex.morgan@clinic.example");
  const [password, setPassword] = useState("••••••••••");
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
          <TextField id="email" label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error && !email.includes("@") ? error : undefined} autoComplete="username" />
          <TextField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={error && !password ? error : undefined} autoComplete="current-password" />
          <div className={styles.row}>
            <label className={styles.remember}>
              <input type="checkbox" defaultChecked /> Keep me signed in
            </label>
            <a href="#" className={styles.link} onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </div>
          <Button type="submit" disabled={busy} className={styles.submit}>
            <Lock size={16} /> {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className={styles.footer}>Protected by two-factor authentication · HIPAA-aware data handling</p>
      </section>

      <aside className={styles.hero} aria-hidden="true">
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Connect · Care · Heal</p>
          <h2>One place for your clinic&apos;s day.</h2>
          <p className={styles.heroText}>Scheduling, patient records and billing share the same data, so the front desk, doctors and managers see the same picture.</p>
          <ul className={styles.points}>
            <li>
              <CalendarCheck size={18} /> Today&apos;s schedule at a glance
            </li>
            <li>
              <Users size={18} /> Complete patient history in one record
            </li>
            <li>
              <ShieldCheck size={18} /> Role-based access for every team member
            </li>
            <li>
              <Mail size={18} /> Invoices and reminders from the same system
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
