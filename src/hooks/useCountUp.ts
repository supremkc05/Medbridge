import { useEffect, useState } from "react";

/** True when the user (or the environment, e.g. jsdom) gives no reason to animate. */
function prefersStillness(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animates from 0 to `target` once, then follows later changes directly.
 * Returns the target immediately when motion is reduced, so screen readers
 * and tests always see the real value.
 */
export function useCountUp(target: number, duration = 900): number {
  const still = prefersStillness();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (still) return;
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(from + (target - from) * easeOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, still]);

  return still ? target : value;
}
