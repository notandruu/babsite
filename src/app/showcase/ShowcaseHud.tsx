"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Logo } from "@/components/Logo";
import { ArrowIcon } from "@/components/ArrowIcon";
import { TIMELINE_STOPS } from "./data";
import { useShowcaseStoreContext } from "./useShowcaseStore";
import styles from "./showcase.module.css";

export function ShowcaseHud() {
  const store = useShowcaseStoreContext();
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const activeStop = TIMELINE_STOPS[snap.activeIndex];
  const focusedStop = snap.focusedIndex !== null ? TIMELINE_STOPS[snap.focusedIndex] : null;

  return (
    <div className={`${styles.stage} ${snap.isFocused ? styles.isFocused : ""}`}>
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.bloom} aria-hidden="true" data-focused={snap.isFocused} />

      <header className={`${styles.hud} ${styles.hudTop}`}>
        <div className={styles.headingSlot}>
          <div className={styles.heading}>
            <span className={styles.kicker}>{activeStop.kicker}</span>
            <h1 className={styles.title}>{activeStop.title}</h1>
            <p className={styles.tagline}>{activeStop.tagline}</p>
          </div>
          <div className={styles.escBackWrap}>
            <button type="button" className={styles.escBack} onClick={() => store.exitFocus()}>
              ← Back
            </button>
          </div>
        </div>

        <div className={styles.metaTop}>
          <Link href="/" className={styles.logoLink} aria-label="Blockchain at Berkeley home">
            <Logo />
          </Link>
        </div>
      </header>

      {focusedStop && (
        <div className={styles.focusInfo} key={focusedStop.id}>
          <p className={styles.focusDesc}>{focusedStop.description}</p>
          <Link href={focusedStop.href} className={styles.openLink}>
            Open {focusedStop.title}
            <span className={styles.openArrow}>
              <ArrowIcon dark />
            </span>
          </Link>
        </div>
      )}

      <footer className={`${styles.hud} ${styles.hudBottom}`}>
        <div className={styles.dots} role="tablist" aria-label="Timeline stops">
          {TIMELINE_STOPS.map((stop, i) => (
            <button
              key={stop.id}
              type="button"
              role="tab"
              aria-selected={i === snap.activeIndex}
              aria-label={stop.title}
              className={`${styles.dot} ${i === snap.activeIndex ? styles.dotOn : ""}`}
              onClick={() => store.selectIndex(i)}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
