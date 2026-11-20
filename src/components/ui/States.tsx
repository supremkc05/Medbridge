import type { ReactNode } from "react";
import { CircleCheck, Info, SearchX, TriangleAlert } from "lucide-react";
import { Button } from "./Button";
import styles from "./States.module.scss";

export function LoadingState({ rows = 6, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className="visually-hidden">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon} aria-hidden="true">
        {icon ?? <SearchX size={22} />}
      </div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.title}>Something went wrong</p>
      <p className={styles.description}>{message ?? "The data could not be loaded. Please try again."}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning" | "success"; children: ReactNode }) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role={tone === "success" ? "status" : undefined}>
      {tone === "success" ? <CircleCheck size={18} /> : tone === "warning" ? <TriangleAlert size={18} /> : <Info size={18} />}
      <div>{children}</div>
    </div>
  );
}
