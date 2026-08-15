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
/**
 * The wash surface is drawn on a canvas rather than assembled from CSS
 * gradients.
 *
 * The reference's leading edge is a horizontal band with a sine-like
 * undulation running across the full width, and on the destination you can
 * see several of those bands stacked as strata. Radial gradients can't
 * express that — offset ellipses approximate a bumpy edge but read as
 * drifting clouds, which is why the CSS version never looked like his no
 * matter how it was tuned. Two superimposed sines per band, at frequencies
 * that don't divide evenly, give a genuine travelling wave that never
 * visibly repeats.
 *
 * Softness comes from a CSS blur on the canvas element, so the wave maths
 * stays cheap and exact and the GPU does the diffusion.
 */
interface Band {
  /** Resting height as a fraction of viewport, measured from the bottom. */
  base: number;
  amp1: number;
  freq1: number;
  amp2: number;
  freq2: number;
  speed: number;
  phase: number;
  /** Vertical gradient stops, top of band -> bottom of screen. */
  top: string;
  bottom: string;
}

// Back to front: the deepest, highest band first so brighter, lower bands
// paint over it — the same luminance ramp the reference has, brighter toward
// the edge the wash rises from.
const BANDS: Band[] = [
  {
    base: 0.72,
    amp1: 0.045,
    freq1: 1.7,
    amp2: 0.022,
    freq2: 3.9,
    speed: 0.16,
    phase: 0,
    top: "rgba(198, 122, 38, 0)",
    bottom: "rgba(198, 122, 38, 0.62)",
  },
  {
    base: 0.52,
    amp1: 0.038,
    freq1: 2.3,
    amp2: 0.019,
    freq2: 5.1,
    speed: -0.21,
    phase: 1.9,
    top: "rgba(232, 160, 52, 0)",
    bottom: "rgba(232, 160, 52, 0.72)",
  },
  {
    base: 0.3,
    amp1: 0.03,
    freq1: 3.1,
    amp2: 0.014,
    freq2: 6.7,
    speed: 0.27,
    phase: 4.1,
    top: "rgba(250, 206, 104, 0)",
    bottom: "rgba(250, 206, 104, 0.8)",
  },
  {
    base: 0.13,
    amp1: 0.022,
    freq1: 4.3,
    amp2: 0.011,
    freq2: 8.3,
    speed: -0.33,
    phase: 2.6,
    top: "rgba(253, 228, 168, 0)",
    bottom: "rgba(253, 228, 168, 0.85)",
  },
];

/** Draws the animated wave strata. Returns a stop function. */
function startWaveCanvas(host: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  canvas.className = styles.washCanvas;
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let raf = 0;
  let w = 0;
  let h = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const start = performance.now();
  const draw = () => {
    const t = (performance.now() - start) / 1000;
    ctx.clearRect(0, 0, w, h);

    for (const b of BANDS) {
      const baseY = h * (1 - b.base);
      ctx.beginPath();
      ctx.moveTo(0, h);
      // Step in a few px rather than per-pixel; the blur hides the faceting
      // and it keeps this comfortably inside a frame budget.
      for (let x = 0; x <= w; x += 6) {
        const u = x / w;
        const y =
          baseY +
          h * b.amp1 * Math.sin(u * b.freq1 * Math.PI * 2 + t * b.speed + b.phase) +
          h * b.amp2 * Math.sin(u * b.freq2 * Math.PI * 2 - t * b.speed * 1.4 + b.phase);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      // Ramp to full colour over a short distance below the crest rather
      // than across the whole screen. Canvas gradients clamp past their end
      // stop, so everything lower stays solid — which gives each band a
      // readable leading edge instead of every band fading across the full
      // height and dissolving into one flat sheet.
      const grad = ctx.createLinearGradient(0, baseY - h * 0.01, 0, baseY + h * 0.2);
      grad.addColorStop(0, b.top);
      grad.addColorStop(1, b.bottom);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  };

  resize();
  raf = requestAnimationFrame(draw);
  window.addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}

function existing(): HTMLElement | null {
  return document.getElementById(WASH_ID);
}

/** Per-element teardown for the wave loop, keyed weakly so a removed wash
 * can't keep its rAF alive. */
const waveStoppers = new WeakMap<HTMLElement, () => void>();

/** Removes the wash and stops its animation loop. */
function destroy(el: HTMLElement): void {
  waveStoppers.get(el)?.();
  waveStoppers.delete(el);
  el.remove();
}

/** Fades the wash in over the current page. Safe to call twice. */
export function riseWash(): void {
  if (typeof document === "undefined" || existing()) return;

  const el = document.createElement("div");
  el.id = WASH_ID;
  el.className = `${styles.wash} ${styles.washIn}`;
  el.setAttribute("aria-hidden", "true");

  const stopWaves = startWaveCanvas(el);
  // Stashed on the node so removal can stop the loop — the element outlives
  // React here, so nothing else is tracking it.
  waveStoppers.set(el, stopWaves);

  // Dots go on last so they sit above the light, as a texture over it rather
  // than another source of it.
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
    el.addEventListener("animationend", () => destroy(el), { once: true });
    // Backstop: if the animation never fires (tab backgrounded mid-transition,
    // reduced-motion shortcuts, interrupted navigation) the wash must not be
    // left covering the page.
    window.setTimeout(() => destroy(el), 1600);
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
  destroy(el);
}
