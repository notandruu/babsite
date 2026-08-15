"use client";

import { useEffect, useRef } from "react";
import { ARRIVAL_KEY } from "@/components/ShowcaseGateway";
import styles from "@/components/showcaseGateway.module.css";

/**
 * The exit half of the gateway transition. When you arrive from the About
 * page the wash is already at full coverage, so this picks it up there and
 * clears it diagonally rather than fading it — matching the reference,
 * where the entrance rises from the bottom but the exit sweeps off toward
 * the bottom-left.
 *
 * Driven by a ref rather than state on purpose: whether the wash plays is
 * decided once, by a value that lives outside React (sessionStorage), and
 * it never re-renders afterwards. Routing it through setState would just
 * trigger a cascading render to express a one-shot DOM effect. The element
 * stays hidden on a direct visit to /showcase, so the page is untouched for
 * anyone who didn't come through the gateway.
 */
export function ShowcaseArrival() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let arrived = false;
    try {
      arrived = sessionStorage.getItem(ARRIVAL_KEY) === "1";
      if (arrived) sessionStorage.removeItem(ARRIVAL_KEY);
    } catch {
      // storage unavailable; treat as a direct visit
    }
    if (!arrived) return;

    el.hidden = false;
    el.classList.add(styles.washRecede);

    // Hide again once it's done so the overlay isn't left sitting over an
    // interactive WebGL canvas.
    const onEnd = () => {
      el.hidden = true;
      el.classList.remove(styles.washRecede);
    };
    el.addEventListener("animationend", onEnd, { once: true });
    return () => el.removeEventListener("animationend", onEnd);
  }, []);

  return <div ref={ref} hidden className={styles.wash} aria-hidden="true" />;
}
