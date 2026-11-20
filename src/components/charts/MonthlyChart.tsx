import { formatMoney } from "@/lib/format";
import type { InvoiceSummary } from "@/backend/invoices";
import styles from "./MonthlyChart.module.scss";

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

export function MonthlyChart({ data }: { data: InvoiceSummary["byMonth"] }) {
  const W = 640;
  const H = 200;
  const pad = { top: 10, right: 8, bottom: 26, left: 48 };
  const max = Math.max(1, ...data.map((m) => m.paid + m.outstanding));
  // Pick a "nice" step (1, 2, 2.5 or 5 × 10^n) so that four steps cover the maximum.
  const raw = max / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((v) => v >= raw) ?? raw;
  const top = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const slot = innerW / data.length;
  const barW = Math.min(36, slot * 0.55);
  const y = (v: number) => pad.top + innerH - (v / top) * innerH;
  const money = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `$${Math.round(v)}`);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="Monthly invoiced amounts, paid and outstanding">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} className={styles.gridLine} />
          <text x={pad.left - 10} y={y(t) + 4} textAnchor="end" className={styles.axis}>
            {money(t)}
          </text>
        </g>
      ))}
      {data.map((m, i) => {
        const x = pad.left + slot * i + (slot - barW) / 2;
        const paidTop = y(m.paid);
        const outTop = y(m.paid + m.outstanding);
        return (
          <g key={m.month}>
            <title>{`${m.month}: ${formatMoney(m.paid)} paid, ${formatMoney(m.outstanding)} outstanding`}</title>
            <rect x={x} y={outTop} width={barW} height={paidTop - outTop} rx={0} className={styles.svgOutstanding} />
            <rect x={x} y={paidTop} width={barW} height={pad.top + innerH - paidTop} className={styles.svgPaid} />
            <rect x={x} y={outTop} width={barW} height={Math.min(6, pad.top + innerH - outTop)} rx={3} className={m.outstanding ? styles.svgOutstanding : styles.svgPaid} />
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" className={styles.axis}>
              {MONTH.format(new Date(`${m.month}-01T00:00:00Z`))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

