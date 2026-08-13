"use client";

import { createContext, useContext } from "react";

export const CARD_SPACING = 3.6;
const ARROW_IMPULSE = 90;
// Exponential ease rate (1/s) for eased travel toward a `travelTarget`
// (dot clicks, and the pan phase before a card click enters focus). ~0.75s
// to cover 90% of the distance — still a visible pan, not a cut, but no
// longer a wait (was 2.1 / ~1.1s).
const TRAVEL_EASE_LAMBDA = 3.1;
// How close trackX needs to get to travelTarget before we call it "arrived"
// (settling pendingFocusIndex into focus, or clearing the target). Exponential
// easing asymptotes rather than truly reaching the target, so a tiny epsilon
// here forces waiting through a long, invisible decay tail after the pan
// already looks finished — 0.002 (out of a 3.6 CARD_SPACING) meant up to ~2.4s
// of dead air before the zoom-in actually started. 0.1 is still visually
// indistinguishable from "exactly arrived" but clears almost immediately.
const SETTLE_EPSILON = 0.1;

export interface ShowcaseSnapshot {
  activeIndex: number;
  focusedIndex: number | null;
  isFocused: boolean;
}

/**
 * Mutable physics + travel state shared between the R3F scene (which mutates
 * it every frame via useFrame, off the React render cycle) and the DOM HUD
 * (which only needs to re-render on the rarer activeIndex/focusedIndex
 * transitions, read via useSyncExternalStore).
 */
export class ShowcaseStore {
  readonly stopCount: number;
  readonly maxX: number;

  trackX = 0;
  velocity = 0;
  focusedIndex: number | null = null;

  private travelTarget: number | null = null;
  // Set when a card click needs to pan to its position before entering
  // focus (see toggleFocus) — consumed once travelTarget settles.
  private pendingFocusIndex: number | null = null;
  private snapshot: ShowcaseSnapshot = { activeIndex: 0, focusedIndex: null, isFocused: false };
  private listeners = new Set<() => void>();

  constructor(stopCount: number) {
    this.stopCount = stopCount;
    this.maxX = Math.max(0, (stopCount - 1) * CARD_SPACING);
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): ShowcaseSnapshot => this.snapshot;

  private publish() {
    for (const listener of this.listeners) listener();
  }

  private recompute() {
    const nearest = Math.round(this.trackX / CARD_SPACING);
    const activeIndex = Math.max(0, Math.min(this.stopCount - 1, nearest));
    const isFocused = this.focusedIndex !== null;
    if (
      activeIndex !== this.snapshot.activeIndex ||
      this.focusedIndex !== this.snapshot.focusedIndex ||
      isFocused !== this.snapshot.isFocused
    ) {
      this.snapshot = { activeIndex, focusedIndex: this.focusedIndex, isFocused };
      this.publish();
    }
  }

  /** Called once per rendered frame from ShowcaseScene's useFrame. */
  tick(dtMs: number) {
    const dt = Math.min(dtMs, 64); // clamp huge tab-switch gaps
    if (this.focusedIndex === null) {
      if (this.travelTarget !== null) {
        const factor = 1 - Math.exp(-TRAVEL_EASE_LAMBDA * (dt / 1000));
        this.trackX += (this.travelTarget - this.trackX) * factor;
        this.velocity = 0;
        if (Math.abs(this.travelTarget - this.trackX) < SETTLE_EPSILON) {
          this.trackX = this.travelTarget;
          this.travelTarget = null;
          if (this.pendingFocusIndex !== null) {
            this.focusedIndex = this.pendingFocusIndex;
            this.pendingFocusIndex = null;
          }
        }
      } else if (this.velocity !== 0) {
        this.trackX += this.velocity * (dt / 16.67);
        // Gentler decay than before (was 0.88) — a longer, smoother glide
        // instead of a quick snap-to-stop.
        this.velocity *= Math.pow(0.94, dt / 16.67);
        if (Math.abs(this.velocity) < 0.0008) this.velocity = 0;
      }
      const clamped = Math.max(0, Math.min(this.maxX, this.trackX));
      if (clamped !== this.trackX) {
        this.trackX = clamped;
        this.velocity = 0;
      }
    } else {
      // While focused, ease trackX onto the focused card so framing stays put.
      const target = this.focusedIndex * CARD_SPACING;
      this.trackX += (target - this.trackX) * Math.min(1, dt / 180);
    }
    this.recompute();
  }

  /** Continuous free-roam travel from wheel input. */
  applyWheel(deltaX: number, deltaY: number) {
    if (this.focusedIndex !== null) return;
    this.travelTarget = null;
    this.pendingFocusIndex = null;
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    // Lower gain + lower cap than before — same scroll gesture now covers
    // meaningfully less ground, at a calmer top speed.
    this.velocity -= delta * 0.001;
    this.velocity = Math.max(-0.85, Math.min(0.85, this.velocity));
  }

  /** Continuous free-roam travel from ← / → keys. */
  travelKey(direction: 1 | -1) {
    if (this.focusedIndex !== null) return;
    this.applyWheel(direction * ARROW_IMPULSE, 0);
  }

  /** Ease the camera to park exactly on a stop, without entering focus mode. */
  selectIndex(index: number) {
    if (this.focusedIndex !== null) return;
    this.velocity = 0;
    this.pendingFocusIndex = null;
    this.travelTarget = Math.max(0, Math.min(this.stopCount - 1, index)) * CARD_SPACING;
  }

  /**
   * Card click: enter focus on `index`, or exit if it's already focused.
   * If the card isn't already the one we're parked on, this first eases the
   * camera across to it (same travel as a dot click) and only enters focus
   * once it arrives — clicking a card off to the side should read as a
   * deliberate pan-then-zoom, not a jump-cut straight into the close-up.
   */
  toggleFocus(index: number) {
    if (this.focusedIndex === index) {
      this.exitFocus();
      return;
    }
    if (this.focusedIndex !== null) {
      // Switching focus directly from one focused card to another isn't
      // reachable from the current UI (you always exit focus first), but
      // keep it well-defined rather than leaving stale travel state.
      this.focusedIndex = index;
      this.travelTarget = null;
      this.pendingFocusIndex = null;
      this.recompute();
      return;
    }
    this.velocity = 0;
    this.pendingFocusIndex = index;
    this.travelTarget = Math.max(0, Math.min(this.stopCount - 1, index)) * CARD_SPACING;
  }

  exitFocus() {
    if (this.focusedIndex === null) return;
    this.travelTarget = this.focusedIndex * CARD_SPACING;
    this.pendingFocusIndex = null;
    this.focusedIndex = null;
    this.recompute();
  }
}

export const ShowcaseStoreContext = createContext<ShowcaseStore | null>(null);

export function useShowcaseStoreContext(): ShowcaseStore {
  const store = useContext(ShowcaseStoreContext);
  if (!store) throw new Error("useShowcaseStoreContext must be used within ShowcaseExperience");
  return store;
}
