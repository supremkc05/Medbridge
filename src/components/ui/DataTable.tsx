import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import styles from "./DataTable.module.scss";

export type SortOrder = "asc" | "desc";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
  width?: string;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: { key: string; order: SortOrder };
  onSortChange?: (key: string, order: SortOrder) => void;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ caption, columns, rows, rowKey, sort, onSortChange, onRowClick }: DataTableProps<T>) {
  const toggle = (key: string) => {
    if (!onSortChange) return;
    const order: SortOrder = sort?.key === key && sort.order === "asc" ? "desc" : "asc";
    onSortChange(key, order);
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key;
              const ariaSort = active ? (sort!.order === "asc" ? "ascending" : "descending") : col.sortable ? "none" : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  style={{ width: col.width, textAlign: col.align ?? "left" }}
                >
                  {col.sortable ? (
                    <button type="button" className={styles.sortButton} onClick={() => toggle(col.key)}>
                      {col.header}
                      <span className={`${styles.sortIcon} ${active ? styles.sortActive : ""}`} aria-hidden="true">
                        {active ? sort!.order === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} /> : <ArrowUpDown size={13} />}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={onRowClick ? styles.clickable : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align ?? "left" }}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
