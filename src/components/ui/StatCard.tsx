"use client";

import type { ReactNode } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import styles from "./StatCard.module.scss";

interface StatCardProps {
  label: string;
  /** Numbers count up on first render; anything else is shown as given. */
  value: ReactNode;
  /** Formats an animated numeric value, e.g. as money. */
  format?: (n: number) => string;
  hint?: ReactNode;
  /** The one figure a page leads with: drawn on the brand navy. */
  featured?: boolean;
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

/** A label, one number and a line of context. No icons: the number is the content. */
export function StatCard({ label, value, format, hint, featured = false }: StatCardProps) {
  return (
    <div className={`${styles.card} ${featured ? styles.featured : ""}`}>
      <span className={styles.label}>{label}</span>
      <strong className={styles.value}>{typeof value === "number" ? <AnimatedNumber value={value} format={format} /> : value}</strong>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
