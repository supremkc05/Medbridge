"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import logo from "@/assets/brand/medbridge-logo.png";
import { routes } from "@/lib/routes";
import { Avatar } from "@/components/ui/Avatar";
import { useAppSelector } from "@/store/hooks";
import { ROLE_LABELS } from "@/types";
import styles from "./Sidebar.module.scss";

const NAV: { group: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    group: "Clinic",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/appointments", label: "Appointments", icon: CalendarDays },
      { href: "/patients", label: "Patients", icon: Users },
      { href: "/billing", label: "Billing", icon: Receipt },
    ],
  },
  {
    group: "Administration",
    items: [
      { href: "/admin/staff", label: "Staff & roles", icon: ShieldCheck },
      { href: "/admin/settings", label: "Clinic settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, userName } = useAppSelector((s) => s.session);

  return (
    <aside className={styles.sidebar}>
      <Link href={routes.dashboard} className={styles.brand} aria-label="MedBridge home">
        <Image src={logo} alt="MedBridge" className={styles.logo} priority />
      </Link>

      <div className={styles.clinic}>
        <span className={styles.clinicMark} aria-hidden="true">
          LF
        </span>
        <span className={styles.clinicText}>
          <strong>Lakeside Family Clinic</strong>
          <span>Madison, WI</span>
        </span>
        <ChevronsUpDown size={16} className={styles.clinicIcon} aria-hidden="true" />
      </div>

      <nav aria-label="Main" className={styles.nav}>
        {NAV.map((section) => (
          <div key={section.group} className={styles.group}>
            <p className={styles.groupLabel}>{section.group}</p>
            <ul>
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`${styles.link} ${active ? styles.active : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon size={18} strokeWidth={2} aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.user}>
        <Avatar name={userName} />
        <span className={styles.userText}>
          <strong>{userName}</strong>
          <span>{ROLE_LABELS[role]}</span>
        </span>
        <Link href={routes.login} className={styles.signOut} aria-label="Sign out" title="Sign out">
          <LogOut size={17} />
        </Link>
      </div>
    </aside>
  );
}
