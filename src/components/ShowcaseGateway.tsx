"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./showcaseGateway.module.css";
import { getGatewayEngine, peekGatewayEngine } from "./gatewayEngine";

const BLOCK_COUNT = 28;
// How long after the tide commits before the route swaps. The flood needs to
// have covered the viewport by then, or the navigation shows through it.
const NAV_DELAY_MS = 620;

/**
 * The terminal readout at the foot of the About page, and the input surface
 * that charges the tide.
 *
 * Deliberately *not* a scroll-position meter. Once the page is scrolled to
 * the bottom, further wheel input pumps charge into the engine, and charge
 * always decays — so stopping partway drains the whole system back down and
 * you can feel it resisting. That reversibility is the behaviour the previous
 * build was missing entirely, and it's why this reads as a physical thing
 * being pushed rather than a progress bar being filled.
 */
export function ShowcaseGateway() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [level, setLevel] = useState(0);
  const committedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const engine = getGatewayEngine();
    const unsub = engine.subscribe(setLevel);

    engine.onCommit(() => {
      if (committedRef.current) return;
      committedRef.current = true;
      // Navigate under full coverage, so the route swap is never visible.
      window.setTimeout(() => router.push("/showcase"), NAV_DELAY_MS);
    });

    // Only pump when the gateway is actually in view and the page can't
    // scroll any further — otherwise ordinary scrolling through the page
    // would charge it.
    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;

    const onWheel = (e: WheelEvent) => {
      if (engine.phase !== "charging") return;
      if (e.deltaY <= 0 || !atBottom()) return;
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.75) return;
      engine.pump(e.deltaY);
      // Only swallow the gesture once it's actually doing something, so the
      // page never feels stuck before the tide has engaged.
      if (e.cancelable) e.preventDefault();
    };

    let lastTouch: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      lastTouch = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (lastTouch === null || engine.phase !== "charging") return;
      const y = e.touches[0]?.clientY ?? lastTouch;
      const dy = lastTouch - y;
      lastTouch = y;
      if (dy > 0 && atBottom()) engine.pump(dy * 2.2);
    };
    const onTouchEnd = () => {
      lastTouch = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      unsub();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      // Leaving the page without committing must not strand the canvas; a
      // committed tide is left alone because it's mid-transition.
      peekGatewayEngine()?.releaseIfIdle();
    };
  }, [router]);

  const pct = Math.round(level * 100);
  const filled = Math.round(level * BLOCK_COUNT);

  return (
    <section ref={sectionRef} className={styles.gateway}>
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
          {pct >= 100 ? "entering /showcase" : `hashing timeline… ${pct}%`}
        </span>
      </div>

      <p className={styles.hint} aria-hidden="true">
        keep scrolling to open
      </p>

      {/* The scroll gesture is an enhancement, not the only way through. */}
      <a href="/showcase" className="sr-only focus:not-sr-only">
        Open the showcase timeline
      </a>
    </section>
  );
}
