"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./memberCards.module.css";

/*
 * Prototype for the member-card section. Standalone route so it can be
 * judged before it goes anywhere near /about or the showcase PR.
 *
 * The intent, per the concept: a serialized physical card for each exec,
 * floating on the club gold. It is deliberately the inverse of the timeline
 * (light where that is dark, a person where that is an event), because the
 * gateway flood between them is this same gold and the contrast is what
 * gives that transition something to travel between.
 *
 * Wheel, drag, arrow keys and the dots all move between cards. When this
 * becomes a section on /about it wants the horizontal axis only, so the
 * page's own vertical scroll stays free for the gateway at the foot.
 */

type Member = {
  name: string;
  role: string;
  gradYear: string;
  issued: string;
  linkedin: string;
  coffee: string;
};

// Placeholder roster. Only the first is from the concept; replace the rest
// with the real exec list and swap the initials block for headshots.
const MEMBERS: Member[] = [
  {
    name: "Tvisha Ranjan",
    role: "Head of Design",
    gradYear: "Class of 2028",
    issued: "June 05 2026",
    linkedin: "#",
    coffee: "#",
  },
  {
    name: "Placeholder Two",
    role: "President",
    gradYear: "Class of 2027",
    issued: "June 05 2026",
    linkedin: "#",
    coffee: "#",
  },
  {
    name: "Placeholder Three",
    role: "Head of Engineering",
    gradYear: "Class of 2027",
    issued: "June 05 2026",
    linkedin: "#",
    coffee: "#",
  },
  {
    name: "Placeholder Four",
    role: "Head of Consulting",
    gradYear: "Class of 2028",
    issued: "June 05 2026",
    linkedin: "#",
    coffee: "#",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

/** Handwritten "hi", drawn on rather than faded in. */
function Doodle({ playToken }: { playToken: number }) {
  const strokeRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const stroke = strokeRef.current;
    const dot = dotRef.current;
    if (!stroke || !dot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stroke.style.strokeDashoffset = "0";
      dot.style.strokeDashoffset = "0";
      return;
    }
    // Restart from scratch each time the token changes: reset the offset,
    // force a reflow so the browser cannot collapse the two style writes
    // into one, then hand it back to the transition.
    for (const [el, ms, delay] of [
      [stroke, 620, 0],
      [dot, 180, 640],
    ] as const) {
      const len = el.getTotalLength();
      el.style.transition = "none";
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      void el.getBoundingClientRect();
      el.style.transition = `stroke-dashoffset ${ms}ms ease-out ${delay}ms`;
      el.style.strokeDashoffset = "0";
    }
  }, [playToken]);

  return (
    <svg className={styles.doodle} viewBox="0 0 62 42" aria-hidden="true">
      <path
        ref={strokeRef}
        className={styles.doodleStroke}
        d="M12 36 C12 29 13 18 16 10 C17.6 6 19.6 7 19 12.5 C18.4 18 15 26 15 36 C15 29 18.5 25 22 25 C25.8 25 26.8 29.5 25.6 36 M33 25 C32.8 29 32.8 32.5 32.8 36"
      />
      <path ref={dotRef} className={styles.doodleStroke} d="M33.2 17.4 L33.2 18.4" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9.5h4v11H3v-11zm7 0h3.8v1.5h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76v5.69h-4v-5.05c0-1.2-.02-2.75-1.9-2.75-1.9 0-2.19 1.3-2.19 2.66v5.14h-4v-11z" />
    </svg>
  );
}

function CoffeeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 3h12l-.6 4H6.6L6 3zm.85 5.5h10.3l-1.1 10.9a2.4 2.4 0 0 1-2.39 2.1h-3.32a2.4 2.4 0 0 1-2.39-2.1L6.85 8.5z" />
    </svg>
  );
}

export function MemberCards() {
  const [index, setIndex] = useState(0);
  const [replays, setReplays] = useState(0);
  const lockRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const move = useCallback((delta: number) => {
    setIndex((i) => Math.max(0, Math.min(MEMBERS.length - 1, i + delta)));
  }, []);

  // Wheel is rate-limited rather than accumulated: a card set is a handful
  // of discrete stops, so a trackpad flick should advance one, not four.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 8 || lockRef.current) return;
      lockRef.current = true;
      window.setTimeout(() => {
        lockRef.current = false;
      }, 420);
      move(d > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
    };

    let startX: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0]?.clientX ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (startX === null) return;
      const dx = (e.changedTouches[0]?.clientX ?? startX) - startX;
      if (Math.abs(dx) > 44) move(dx < 0 ? 1 : -1);
      startX = null;
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [move]);

  return (
    <main ref={stageRef} className={styles.stage}>
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.viewport}>
        {MEMBERS.map((m, i) => {
          const offset = i - index;
          const active = offset === 0;
          return (
            <article
              key={m.name}
              className={`${styles.card} ${active ? "" : styles.cardIdle}`}
              style={{
                transform: `translate(calc(-50% + ${offset} * (var(--card-w) + 34px)), -50%) scale(${
                  active ? 1 : 0.9
                })`,
                zIndex: active ? 2 : 1,
              }}
              aria-hidden={!active}
            >
              <div className={styles.identity}>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatar}>{initials(m.name)}</div>
                  <span className={styles.badge} />
                </div>
                <div>
                  <h2 className={styles.name}>{m.name}</h2>
                  <p className={styles.role}>
                    {m.role} &middot; {m.gradYear}
                  </p>
                </div>
              </div>

              <div className={styles.meta}>
                <div>
                  <div className={styles.metaLabel}>Issued on:</div>
                  <div className={styles.metaValue}>{m.issued}</div>
                </div>
                <div className={styles.doodleCell}>
                  <div className={styles.metaLabel}>Doodle:</div>
                  <div className={styles.doodleRow}>
                    {/* 0 while idle, so becoming active is itself a change and redraws. */}
                    <Doodle playToken={active ? replays + 1 : 0} />
                    <button
                      type="button"
                      className={styles.play}
                      onClick={() => setReplays((r) => r + 1)}
                    >
                      &#9654; Play
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <a className={styles.action} href={m.linkedin}>
                  <LinkedInIcon /> View Profile
                </a>
                <a className={styles.action} href={m.coffee}>
                  <CoffeeIcon /> Coffee Chat
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <p className={styles.caption}>
        B@B Exec Member Card &middot; No. {index + 1}
      </p>

      <div className={styles.dots}>
        {MEMBERS.map((m, i) => (
          <button
            key={m.name}
            type="button"
            aria-label={`Show ${m.name}`}
            className={`${styles.dot} ${i === index ? styles.dotOn : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      <p className={styles.hint}>scroll or drag sideways to flip through the roster</p>
    </main>
  );
}
