import styles from "./showcaseGateway.module.css";

/**
 * Owns the transition wash as a single DOM element attached to <body>,
 * deliberately outside React's tree.
 *
 * The wash has to survive a route change. While it was rendered by the
 * About page, navigating unmounted it the moment the route swapped, and the
 * showcase mounted a separate element of its own — so instead of one
 * continuous surface carrying you across, it blinked out at the seam and the
 * arrival never read as connected to the departure. Living on <body> means
 * the same node just keeps animating while the pages change underneath it.
 *
 * It also means cleanup is ours to do, hence removeWash().
 */

const WASH_ID = "showcase-transition-wash";

/** Set just before navigating so the showcase knows to play the exit half of
 * the transition on arrival. Lives here rather than on the gateway component
 * so the arrival side can read it without importing the whole About-page UI. */
export const ARRIVAL_KEY = "showcase-arrival";

/** True if this page load was reached through the gateway. Consumes the flag. */
export function consumeArrivalFlag(): boolean {
  try {
    const arrived = sessionStorage.getItem(ARRIVAL_KEY) === "1";
    if (arrived) sessionStorage.removeItem(ARRIVAL_KEY);
    return arrived;
  } catch {
    return false;
  }
}
// Back to front. Now that these composite normally rather than screen-
// blending, DOM order is paint order and therefore determines the resulting
// hue: coral underneath, gold above it, warm highlight last.
const LAYERS = [styles.layerD, styles.layerB, styles.layerA, styles.layerC];

function existing(): HTMLElement | null {
  return document.getElementById(WASH_ID);
}

/** Fades the wash in over the current page. Safe to call twice. */
export function riseWash(): void {
  if (typeof document === "undefined" || existing()) return;

  const el = document.createElement("div");
  el.id = WASH_ID;
  el.className = `${styles.wash} ${styles.washIn}`;
  el.setAttribute("aria-hidden", "true");

  for (const layer of LAYERS) {
    const child = document.createElement("div");
    child.className = `${styles.washLayer} ${layer}`;
    el.appendChild(child);
  }

  // Dots go on last so they sit above the colour fields — they're a texture
  // over the light, not another light source.
  const dots = document.createElement("div");
  dots.className = styles.washDots;
  el.appendChild(dots);

  document.body.appendChild(el);
}

/**
 * Plays the exit and removes the element. Returns false when there was no
 * wash to dismiss, which is the normal case for a direct visit.
 */
export function dismissWash(): boolean {
  const el = existing();
  if (!el) return false;
  // Marked synchronously, before any async work, so a second call can tell
  // an in-flight exit from a stale leftover. React StrictMode invokes mount
  // effects twice in dev, and without this the second pass tore down the
  // wash that the first pass had just started animating out.
  if (el.dataset.dismissing === "1") return true;
  el.dataset.dismissing = "1";

  // Pin it at full coverage first: the element arrives mid-`gwIn`, and
  // swapping straight to the exit would snap it back to that animation's
  // start values for a frame and flash the page underneath.
  el.classList.remove(styles.washIn);
  el.style.opacity = "0.88";
  el.style.transform = "translate3d(0,0,0) scale(1)";

  // One frame at rest, then hand over to the exit.
  requestAnimationFrame(() => {
    el.style.removeProperty("opacity");
    el.style.removeProperty("transform");
    el.classList.add(styles.washOut);
    el.addEventListener("animationend", () => el.remove(), { once: true });
    // Backstop: if the animation never fires (tab backgrounded mid-transition,
    // reduced-motion shortcuts, interrupted navigation) the wash must not be
    // left covering the page.
    window.setTimeout(() => el.remove(), 1600);
  });

  return true;
}

/**
 * Clears a wash left behind by an interrupted navigation, without touching
 * one that's currently playing its exit. The distinction matters: the naive
 * version removed unconditionally, which meant a direct-visit code path (or
 * a StrictMode second pass) would delete a wash that was mid-dismiss.
 */
export function removeStaleWash(): void {
  const el = existing();
  if (!el || el.dataset.dismissing === "1") return;
  el.remove();
}
