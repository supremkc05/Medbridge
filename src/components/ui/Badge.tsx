import type { ReactNode } from "react";
import { useMonochrome } from "./TableTone";
import styles from "./Badge.module.scss";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  tone?: BadgeTone;
  /** Pulses the status dot for live states such as "Checked in". */
  pulse?: boolean;
  children: ReactNode;
}

// Tones that need attention keep emphasis through weight, not colour, when monochrome.
const URGENT: BadgeTone[] = ["warning", "danger"];

export function Badge({ tone = "neutral", pulse = false, children }: BadgeProps) {
  const mono = useMonochrome();
  const classes = mono
    ? [styles.badge, styles.mono, URGENT.includes(tone) && styles.monoStrong, tone === "neutral" && styles.monoQuiet]
    : [styles.badge, styles[tone], pulse && styles.pulse];
  return <span className={classes.filter(Boolean).join(" ")}>{children}</span>;
}
