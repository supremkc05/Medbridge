"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.scss";

const NAV = [
  {
    group: "Clinic",
    items: [
      { href: "/appointments", label: "Appointments", icon: "◷", disabled: true },
      { href: "/patients", label: "Patients", icon: "♙" },
      { href: "/billing", label: "Billing", icon: "$" },
    ],
  },
  {
    group: "Administration",
    items: [
      { href: "/admin/staff", label: "Staff & roles", icon: "⚇" },
      { href: "/admin/settings", label: "Clinic settings", icon: "⚙" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          M
        </span>
        <span>
          MedBridge
          <small className={styles.demo}>Recreated demo</small>
        </span>
      </div>
      <nav aria-label="Main">
        {NAV.map((section) => (
          <div key={section.group} className={styles.group}>
            <p className={styles.groupLabel}>{section.group}</p>
            <ul>
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <span className={`${styles.link} ${styles.disabled}`} title="Not part of this demo">
                        <span className={styles.icon} aria-hidden="true">
                          {item.icon}
                        </span>
                        {item.label}
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.link} ${active ? styles.active : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className={styles.icon} aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <p className={styles.footer}>Generated test data only</p>
    </aside>
  );
}
