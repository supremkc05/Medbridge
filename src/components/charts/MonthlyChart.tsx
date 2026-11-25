"use client";

import { useId, useState } from "react";
import { formatMoney } from "@/lib/format";
import type { InvoiceSummary } from "@/backend/invoices";
import styles from "./MonthlyChart.module.scss";

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const MONTH_LONG = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export function MonthlyChart({ data }: { data: InvoiceSummary["byMonth"] }) {
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);

  const W = 640;
  const H = 220;
  const pad = { top: 14, right: 8, bottom: 28, left: 48 };
  const max = Math.max(1, ...data.map((m) => m.paid + m.outstanding));
  // Pick a "nice" step (1, 2, 2.5 or 5 × 10^n) so that four steps cover the maximum.
  const raw = max / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((v) => v >= raw) ?? raw;
  const top = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const base = pad.top + innerH;
  const slot = innerW / data.length;
  const barW = Math.min(38, slot * 0.56);
  const y = (v: number) => pad.top + innerH - (v / top) * innerH;
  const money = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `$${Math.round(v)}`);
  const date = (m: string) => new Date(`${m}-01T00:00:00Z`);

  const tip = active === null ? null : data[active];
  const tipX = active === null ? 0 : ((pad.left + slot * active + slot / 2) / W) * 100;
  const tipY = tip ? (y(tip.paid + tip.outstanding) / H) * 100 : 0;
  const clampedX = Math.min(84, Math.max(16, tipX));

  return (
    <div className={styles.wrap} onMouseLeave={() => setActive(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Monthly invoiced amounts, paid and outstanding">
        <defs>
          <linearGradient id={`paid-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f74ea" />
            <stop offset="100%" stopColor="#0f3c8f" />
          </linearGradient>
          <linearGradient id={`out-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fe0dd" />
            <stop offset="100%" stopColor="#3cbfbb" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} className={t === 0 ? styles.baseLine : styles.gridLine} />
            <text x={pad.left - 10} y={y(t) + 4} textAnchor="end" className={styles.axis}>
              {money(t)}
            </text>
          </g>
        ))}

        {data.map((m, i) => {
          const x = pad.left + slot * i + (slot - barW) / 2;
          const paidTop = y(m.paid);
          const outTop = y(m.paid + m.outstanding);
          const state = active === null ? "" : active === i ? styles.on : styles.off;
          return (
            <g
              key={m.month}
              className={`${styles.bar} ${state}`}
              tabIndex={0}
              role="button"
              aria-label={`${MONTH_LONG.format(date(m.month))}: ${formatMoney(m.paid)} paid, ${formatMoney(m.outstanding)} outstanding`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              {/* full-height hit area so thin bars are easy to hover */}
              <rect x={pad.left + slot * i} y={pad.top} width={slot} height={innerH} className={styles.hit} />
              <g className={styles.grow} style={{ animationDelay: `${120 + i * 55}ms` }}>
                <rect x={x} y={outTop} width={barW} height={base - outTop} rx={6} fill={`url(#out-${uid})`} />
                <rect x={x} y={paidTop} width={barW} height={base - paidTop} rx={m.outstanding ? 0 : 6} fill={`url(#paid-${uid})`} />
                {/* square off the bottom corners */}
                <rect x={x} y={base - 6} width={barW} height={6} fill={m.paid ? "#0f3c8f" : "#3cbfbb"} />
              </g>
              <text x={pad.left + slot * i + slot / 2} y={H - 8} textAnchor="middle" className={styles.axis}>
                {MONTH.format(date(m.month))}
              </text>
            </g>
          );
        })}
      </svg>

      {tip && (
        <div
          className={styles.tooltip}
          // keep the tooltip inside the card; the arrow still points at the bar
          style={{ left: `${clampedX}%`, top: `${tipY}%`, ["--arrow" as string]: `calc(50% + ${(tipX - clampedX).toFixed(2)}cqw)` }}
          role="status"
        >
          <p className={styles.tipTitle}>{MONTH_LONG.format(date(tip.month))}</p>
          <p>
            <i className={styles.dotPaid} /> Paid <strong>{formatMoney(tip.paid)}</strong>
          </p>
          <p>
            <i className={styles.dotOut} /> Outstanding <strong>{formatMoney(tip.outstanding)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
