"use client";

import type { ReactNode } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import styles from "./StatCard.module.scss";

type Tone = "teal" | "cyan" | "green" | "amber" | "red" | "blue" | "violet";

interface StatCardProps {
  label: string;
  /** Numbers count up on first render; anything else is shown as given. */
  value: ReactNode;
  /** Formats an animated numeric value, e.g. as money. */
  format?: (n: number) => string;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: Tone;
}

function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const current = useCountUp(value);
  const shown = format ? format(current) : Math.round(current).toLocaleString("en-US");
  return (
    <>
      <span aria-hidden="true">{shown}</span>
      <span className="visually-hidden">{format ? format(value) : value.toLocaleString("en-US")}</span>
    </>
  );
}

export function StatCard({ label, value, format, hint, icon, tone = "teal" }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[tone]}`}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      </div>
      <strong className={styles.value}>{typeof value === "number" ? <AnimatedNumber value={value} format={format} /> : value}</strong>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
