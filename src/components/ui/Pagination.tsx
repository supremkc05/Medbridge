import { Button } from "./Button";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function Pagination({ page, pageSize, total, onPageChange, itemLabel = "results" }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary}>
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong> {itemLabel}
      </p>
      <div className={styles.controls}>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <span className={styles.page} aria-current="page">
          Page {page} of {pageCount}
        </span>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
          Next
        </Button>
      </div>
    </nav>
  );
}
