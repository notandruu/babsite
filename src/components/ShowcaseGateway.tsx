"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./showcaseGateway.module.css";

const BLOCK_COUNT = 28;
// Matches the measured hold in the reference: the wash sits at full coverage
// for roughly this long while the next route swaps in underneath it.
const HOLD_MS = 420;
const RISE_MS = 210;

/** Set just before navigating so /showcase knows to play the exit half of
 * the transition on arrival. sessionStorage (not a query param) keeps the
 * URL clean and the flag dies with the tab. */
export const ARRIVAL_KEY = "showcase-arrival";

export function ShowcaseGateway() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [launching, setLaunching] = useState(false);
  const launchedRef = useRef(false);

  const launch = useCallback(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    setLaunching(true);
    try {
      sessionStorage.setItem(ARRIVAL_KEY, "1");
    } catch {
      // Private mode or storage disabled — the entrance still plays, the
      // arrival half just won't. Not worth blocking navigation over.
    }
    // Navigate under the wash while it's at full coverage, so the route
    // swap is never visible.
    window.setTimeout(() => router.push("/showcase"), RISE_MS + HOLD_MS * 0.5);
  }, [router]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section's top first enters the bottom of the viewport,
      // 1 once its bottom reaches the bottom of the viewport. Since this is
      // the last element on the page, that second condition lands exactly at
      // the end of the document — so the meter completes precisely as you
      // hit the bottom, and not a scroll earlier.
      //
      // Measuring against the full scroll-past distance (height + viewport)
      // instead would be unreachable: nothing follows this section to scroll
      // it up past the top of the screen, so it would cap out around 40%.
      const travelled = vh - rect.top;
      const p = rect.height > 0 ? Math.max(0, Math.min(1, travelled / rect.height)) : 0;
      setProgress(p);
      if (p >= 0.995) launch();
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [launch]);

  const filled = Math.round(progress * BLOCK_COUNT);

  return (
    <>
      <section
        ref={sectionRef}
        className={styles.gateway}
        // Glow ramps on a curve rather than linearly with progress: the
        // reference stays near-black for most of the approach and only
        // blooms in the last stretch, so a straight 1:1 mapping reads as a
        // warm haze hanging around far too early.
        style={{ ["--gw-glow" as string]: Math.pow(progress, 2.2).toFixed(3) }}
      >
        <div className={styles.gatewayGlow} aria-hidden="true" />

        <p className={styles.command}>
          <span className={styles.prompt}>bab@berkeley ~ %</span> showcase --timeline
          <span className={styles.caret} />
        </p>

        <div className={styles.meter}>
          <span className={styles.blocks} aria-hidden="true">
            {Array.from({ length: BLOCK_COUNT }, (_, i) => (
              <span key={i} className={`${styles.block} ${i < filled ? styles.blockOn : ""}`} />
            ))}
          </span>
          <span className={styles.meterLabel}>
            {progress >= 0.995 ? "entering /showcase" : `${Math.round(progress * 100)}%`}
          </span>
        </div>

        {/* Keyboard and screen-reader path — the scroll gesture is an
            enhancement, not the only way through. */}
        <a href="/showcase" className="sr-only focus:not-sr-only">
          Open the showcase timeline
        </a>
      </section>

      {launching && <div className={`${styles.wash} ${styles.washRise}`} aria-hidden="true" />}
    </>
  );
}
