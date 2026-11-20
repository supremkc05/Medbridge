import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./PageHeader.module.scss";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            {breadcrumbs.map((c, i) => (
              <span key={c.label}>
                {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                {i < breadcrumbs.length - 1 && <span className={styles.sep}>/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
