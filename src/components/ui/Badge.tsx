import type { ReactNode } from "react";
import styles from "./Badge.module.scss";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  tone?: BadgeTone;
  /** Pulses the status dot for live states such as "Checked in". */
  pulse?: boolean;
  children: ReactNode;
}

export function Badge({ tone = "neutral", pulse = false, children }: BadgeProps) {
  return <span className={[styles.badge, styles[tone], pulse && styles.pulse].filter(Boolean).join(" ")}>{children}</span>;
}
