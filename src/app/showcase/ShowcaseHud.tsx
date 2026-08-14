"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ArrowIcon } from "@/components/ArrowIcon";
import { TIMELINE_STOPS } from "./data";
import { CARD_SPACING, useShowcaseStoreContext } from "./useShowcaseStore";
import { useShowcaseSound } from "./useShowcaseSound";
import styles from "./showcase.module.css";

const RULER_SCALE = 90;

export function ShowcaseHud() {
  const store = useShowcaseStoreContext();
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const sound = useShowcaseSound();
  const rulerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (rulerRef.current) {
        rulerRef.current.style.transform = `translateX(${-store.trackX * RULER_SCALE}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [store]);

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
          <Link href="/" className={styles.backLink}>
            ← Home
          </Link>
          <button
            type="button"
            className={styles.soundBtn}
            aria-pressed={sound.enabled}
            aria-label={sound.enabled ? "Mute sound" : "Enable sound"}
            title={sound.enabled ? "Sound on" : "Click to enable sound"}
            onClick={sound.toggle}
          >
            {sound.enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </div>
      </header>

      <aside className={styles.era} aria-label="Currently viewing">
        <span className={styles.eraTools}>{activeStop.tags.join(" · ")}</span>
      </aside>

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
        <div className={styles.ruler}>
          <div ref={rulerRef} className={styles.rulerTrack}>
            {TIMELINE_STOPS.map((stop, i) => (
              <span key={stop.id} className={styles.rulerTick} style={{ left: i * CARD_SPACING * RULER_SCALE }}>
                {stop.year}
                {stop.year === "NOW" && <span className={styles.caret} />}
              </span>
            ))}
          </div>
        </div>

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

        <p className={styles.hint}>scroll or ← → to travel · click a card to focus</p>
      </footer>
    </div>
  );
}
