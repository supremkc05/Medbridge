import type { ReactNode } from "react";
import styles from "./StatCard.module.scss";

type Tone = "teal" | "green" | "amber" | "red" | "blue" | "violet";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  tone?: Tone;
}

export function StatCard({ label, value, hint, icon, tone = "teal" }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.icon} ${styles[tone]}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <strong className={styles.value}>{value}</strong>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
