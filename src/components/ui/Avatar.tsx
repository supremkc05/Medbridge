import { initials } from "@/lib/format";
import { useMonochrome } from "./TableTone";
import styles from "./Avatar.module.scss";

const PALETTE = ["teal", "blue", "violet", "amber", "rose", "sky", "emerald", "indigo"] as const;

function paletteFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const tone = useMonochrome() ? "mono" : paletteFor(name);
  return (
    <span className={`${styles.avatar} ${styles[size]} ${styles[tone]}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
