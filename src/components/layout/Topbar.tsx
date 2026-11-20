"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { roleChanged } from "@/store/sessionSlice";
import { ROLE_LABELS, type Role } from "@/types";
import { initials } from "@/lib/format";
import styles from "./Topbar.module.scss";

export function Topbar() {
  const dispatch = useAppDispatch();
  const { role, userName } = useAppSelector((s) => s.session);

  return (
    <header className={styles.topbar}>
      <p className={styles.banner}>
        Recreated demo · built after the placement · not client code · generated test data
      </p>
      <div className={styles.user}>
        <label htmlFor="role-switcher" className={styles.roleLabel}>
          Viewing as
        </label>
        <select
          id="role-switcher"
          className={styles.select}
          value={role}
          onChange={(e) => dispatch(roleChanged(e.target.value as Role))}
        >
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <span className={styles.avatar} aria-hidden="true">
          {initials(userName)}
        </span>
      </div>
    </header>
  );
}
