"use client";

import { Bell, CircleHelp, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { roleChanged } from "@/store/sessionSlice";
import { ROLE_LABELS, type Role } from "@/types";
import styles from "./Topbar.module.scss";

export function Topbar() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.session.role);

  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <Search size={16} aria-hidden="true" />
        <label htmlFor="global-search" className="visually-hidden">
          Search
        </label>
        <input id="global-search" type="search" placeholder="Search patients, invoices, staff…" />
        <kbd>⌘K</kbd>
      </div>

      <div className={styles.right}>
        <span className={styles.chip} title="Recreated interface built after the placement, using generated sample data">
          Recreated demo · sample data
        </span>
        <div className={styles.role}>
          <label htmlFor="role-switcher">Viewing as</label>
          <select id="role-switcher" value={role} onChange={(e) => dispatch(roleChanged(e.target.value as Role))}>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Help">
          <CircleHelp size={19} />
        </button>
        <button type="button" className={styles.iconButton} aria-label="Notifications, 3 unread">
          <Bell size={19} />
          <span className={styles.dot} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
