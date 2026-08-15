"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./transitionLab.module.css";

/*
 * Transition Lab
 *
 * A standalone study of the bryangarage.dev case-study transition, rebuilt
 * from a frame-by-frame read of a 588-frame screen recording. Nothing here
 * is shared with the rest of the site; the whole effect lives in this route.
 *
 * The grammar, with timings measured off the recording:
 *
 *   1. Sweep (420ms)    A full-height wave of warm light enters from one
 *                       screen edge and crosses to the other at constant
 *                       speed: left to right going forward, right to left
 *                       coming back. A near-opaque red-brown trail collapses
 *                       behind the crest; the page ahead of it stays intact
 *                       and readable until the crest arrives.
 *   2. Swap (at cover)  The page underneath changes once the crest has
 *                       crossed and the trail covers everything.
 *   3. Dim (380ms)      The trail's color collapses into warm near-black,
 *                       then releases onto the landing background.
 *   4. Assembly         Landing copy blur-resolves in a top-down stagger.
 *   5. Dot grid         The media panel accretes a dot matrix center-out;
 *                       dots cycle ring / gray / orange / cream in slow waves.
 *   6. Block reveal     The image flips on in blocks of exactly twice the dot
 *                       pitch, expanding from center with noise. That noise is
 *                       what produces the checkerboard rim seen in the frames.
 */

/* ------------------------------ shared bits ------------------------------ */

type View = "index" | "study";

const SWEEP_MS = 420; // crest entering one edge to exiting the other
const DIM_MS = 380; // full cover to warm near-black
const RELEASE_MS = 260; // near-black veil fading off the landing

// Sampled straight off the recording. The wave is a horizontal brightness
// profile around the crest: a wide amber shoulder ahead of it, a gold core,
// and a trail that collapses to near-opaque red-brown within about 18% of
// the screen width, with a faint echo hump trailing the crest.
const CREST: readonly [number, number, number] = [196, 130, 58];
const LEAD: readonly [number, number, number] = [150, 92, 40];
const TRAIL_RED: readonly [number, number, number] = [92, 46, 24];
const DEEP_TRAIL: readonly [number, number, number] = [56, 31, 21];
const SETTLE: readonly [number, number, number] = [23, 23, 23]; // landing bg

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => v * v * (3 - 2 * v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Deterministic per-cell noise so the accretion and flip order are stable
// across frames without storing per-cell state.
const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* --------------------------------- veil ---------------------------------- */

/**
 * The full-screen canvas that owns phases 1 to 3. Painted at 1/8 resolution
 * and upscaled, which supplies the reference's enormous blur for free.
 * `begin(1)` sweeps left to right, `begin(-1)` right to left.
 */
function useVeil(onCover: () => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const running = useRef(false);
  const coverFired = useRef(false);
  const onCoverRef = useRef(onCover);
  useEffect(() => {
    onCoverRef.current = onCover;
  });

  const begin = useCallback((dir: 1 | -1) => {
    const canvas = canvasRef.current;
    if (!canvas || running.current) return false;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // A zero-sized viewport (mid-load, background tab) breaks the painting
    // math; bail and let the caller swap instantly.
    if (!vw || !vh) return false;
    const scale = 8;
    const w = Math.max(2, Math.round(vw / scale));
    const h = Math.max(2, Math.round(vh / scale));
    canvas.width = w;
    canvas.height = h;
    canvas.style.opacity = "1";
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    running.current = true;
    coverFired.current = false;
    const start = performance.now();
    const total = SWEEP_MS + DIM_MS + RELEASE_MS;
    // Reused every frame; the band is written per pixel so the crest can
    // undulate per row instead of being one straight gradient.
    const band = ctx.createImageData(w, h);
    const px = band.data;

    const frame = (now: number) => {
      const t = now - start;
      // Linear crest travel, straight from the frame measurements: the
      // reference sweeps at constant speed, no easing.
      const sweepT = clamp01(t / SWEEP_MS);
      const dimT = smooth(clamp01((t - SWEEP_MS) / DIM_MS));
      const releaseT = clamp01((t - SWEEP_MS - DIM_MS) / RELEASE_MS);

      if (!coverFired.current && t >= SWEEP_MS) {
        coverFired.current = true;
        onCoverRef.current();
      }

      // While dimming, every color slides toward the landing background and
      // a share of alpha bleeds off so the landing ghosts in through the
      // darkening veil, exactly as the reference does.
      const veilAlpha = (1 - releaseT) * (1 - 0.35 * dimT);
      const dimc = (c: readonly [number, number, number]) =>
        [
          lerp(c[0], SETTLE[0], dimT),
          lerp(c[1], SETTLE[1], dimT),
          lerp(c[2], SETTLE[2], dimT),
        ] as const;
      const rgba = (c: readonly [number, number, number], a: number) =>
        `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${a.toFixed(3)})`;

      ctx.clearRect(0, 0, w, h);

      // Crest position in unit x, entering just off one edge and exiting
      // past the other. The crest loses brightness over the last quarter of
      // its travel, which the profiles show clearly.
      const crest = dir === 1 ? lerp(-0.18, 1.18, sweepT) : lerp(1.18, -0.18, sweepT);
      const crestGain = 1 - 0.45 * smooth(clamp01((sweepT - 0.7) / 0.3));

      // The band, written per pixel. Each row offsets the crest with three
      // superimposed sines at non-dividing frequencies, so the front is a
      // living wavy edge rather than one straight gradient line.
      const T = t / 1000;
      const dCrest = dimc(CREST);
      const dLead = dimc(LEAD);
      const dRed = dimc(TRAIL_RED);
      const dDeep = dimc(DEEP_TRAIL);
      const alphaScale = veilAlpha * 255;
      for (let y = 0; y < h; y++) {
        const vy = y / h;
        const wobble =
          0.05 * Math.sin(vy * 5.1 + T * 1.9) +
          0.032 * Math.sin(vy * 11.3 - T * 1.3) +
          0.02 * Math.sin(vy * 23.0 + T * 0.7);
        const rowCrest = crest + wobble * dir;
        for (let x = 0; x < w; x++) {
          const u = x / (w - 1);
          const d = (u - rowCrest) * dir; // > 0 is ahead of the crest
          let r: number;
          let gc: number;
          let b: number;
          let a: number;
          if (d >= 0) {
            // wide soft amber shoulder ahead of the crest; the page there
            // is still readable until the crest arrives. Long-tailed on
            // purpose: a tight shoulder makes the crest read as a drawn
            // line instead of light.
            const f = clamp01(d / 0.42);
            r = lerp(dCrest[0], dLead[0], f);
            gc = lerp(dCrest[1], dLead[1], f);
            b = lerp(dCrest[2], dLead[2], f);
            a = Math.pow(1 - f, 1.4) * 0.9 * crestGain;
          } else if (d > -0.4) {
            // slow collapse from the gold core into the red trail, with the
            // faint echo hump the profiles show about 22% behind the crest
            const f = clamp01(-d / 0.4);
            const echo = Math.exp(-Math.pow((d + 0.22) / 0.08, 2)) * 0.22 * crestGain;
            r = lerp(lerp(dCrest[0], dRed[0], f), dCrest[0], echo);
            gc = lerp(lerp(dCrest[1], dRed[1], f), dCrest[1], echo);
            b = lerp(lerp(dCrest[2], dRed[2], f), dCrest[2], echo);
            a = lerp(0.9 * crestGain + 0.06, 0.93, f);
          } else {
            // deep trail: near-opaque red-brown settling darker
            const f = clamp01((-d - 0.4) / 0.55);
            r = lerp(dRed[0], dDeep[0], f);
            gc = lerp(dRed[1], dDeep[1], f);
            b = lerp(dRed[2], dDeep[2], f);
            a = 0.94;
          }
          const o = (y * w + x) * 4;
          px[o] = r;
          px[o + 1] = gc;
          px[o + 2] = b;
          px[o + 3] = a * alphaScale;
        }
      }
      ctx.putImageData(band, 0, 0);

      // Gold blobs riding the crest thicken the wavy front into the chunky,
      // organic shape the reference has. Big and faint: their job is to
      // swell the front, not to read as individual lights.
      for (let i = 0; i < 5; i++) {
        const n = hash2(i, 3.3);
        const by = (0.08 + i * 0.2 + 0.06 * Math.sin(T * 2.1 + i * 2.6)) * h;
        const bx = (crest + dir * (0.05 * Math.sin(T * 1.7 + i * 1.9) - 0.02)) * w;
        const br = (0.2 + 0.24 * n) * h;
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bg.addColorStop(0, rgba(dCrest, 0.42 * crestGain * veilAlpha));
        bg.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // Guarantee full cover at the swap regardless of the profile tails.
      const coverT = smooth(clamp01((sweepT - 0.8) / 0.2));
      if (coverT > 0) {
        ctx.fillStyle = rgba(dimc(DEEP_TRAIL), coverT * 0.9 * veilAlpha);
        ctx.fillRect(0, 0, w, h);
      }

      if (t < total) {
        raf.current = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
        canvas.style.opacity = "0";
        running.current = false;
      }
    };
    raf.current = requestAnimationFrame(frame);
    return true;
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return { canvasRef, begin, running };
}

/* ---------------------------- materialization ----------------------------- */

const PITCH = 28; // dot grid pitch in CSS px, measured off the frames
const DOT_R = 2.25;
const BLOCK = PITCH * 2; // reveal block size, exactly two pitches

const ACCRETE_START = 620; // ms after the panel mounts (veil has just dimmed)
const ACCRETE_SPREAD = 380;
const ACCRETE_JITTER = 260;
const REVEAL_START = 1580;
const REVEAL_SPREAD = 220;
const REVEAL_JITTER = 70;

const DOT_GRAY = "rgb(148, 148, 148)";
const DOT_ORANGE = "rgb(232, 114, 42)";
const DOT_CREAM = "rgb(232, 199, 154)";
const RING = "rgba(255, 255, 255, 0.16)";
const PANEL_BG = "rgb(20, 20, 20)";

/**
 * Paints the stand-in case-study artwork. Generated instead of shipped as an
 * asset so the route stays dependency free; the composition mirrors the
 * reference (blue gradient field, chat card, chart card, red accent).
 */
function paintArtwork(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const sky = ctx.createLinearGradient(0, 0, w, h);
  sky.addColorStop(0, "#2e63d8");
  sky.addColorStop(0.45, "#8fb4f2");
  sky.addColorStop(1, "#e3ecfb");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const streak = ctx.createLinearGradient(w * 0.2, 0, w, h * 0.5);
  streak.addColorStop(0, "rgba(255, 255, 255, 0)");
  streak.addColorStop(0.55, "rgba(255, 255, 255, 0.35)");
  streak.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = streak;
  ctx.fillRect(0, 0, w, h);

  const card = (x: number, y: number, cw: number, ch: number, alpha: number) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.roundRect(x, y, cw, ch, 14);
    ctx.fill();
  };
  const bar = (x: number, y: number, bw: number, bh: number, fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, bh, bh / 2);
    ctx.fill();
  };

  // Question card with an avatar, top right.
  card(w * 0.08, h * 0.1, w * 0.68, h * 0.15, 0.85);
  bar(w * 0.12, h * 0.145, w * 0.2, 8, "#2f6bde");
  bar(w * 0.34, h * 0.145, w * 0.28, 8, "#3a3f4a");
  bar(w * 0.12, h * 0.185, w * 0.38, 8, "#3a3f4a");
  ctx.fillStyle = "#22262e";
  ctx.beginPath();
  ctx.arc(w * 0.84, h * 0.175, Math.min(w, h) * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Answer card with a small chart: one red bar and cool flows.
  card(w * 0.08, h * 0.32, w * 0.8, h * 0.52, 0.9);
  bar(w * 0.12, h * 0.37, w * 0.44, 8, "#3a3f4a");
  bar(w * 0.12, h * 0.41, w * 0.3, 8, "#3a3f4a");
  ctx.fillStyle = "#4a72e0";
  ctx.fillRect(w * 0.14, h * 0.5, 10, h * 0.26);
  ctx.fillStyle = "#d84a3e";
  ctx.fillRect(w * 0.56, h * 0.48, 10, h * 0.09);
  const flows: Array<[number, string]> = [
    [0.5, "#8ea4d8"],
    [0.58, "#c4a4d0"],
    [0.66, "#e0b48e"],
    [0.74, "#9ec49a"],
  ];
  for (const [fy, fill] of flows) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(w * 0.155, h * (fy + 0.02));
    ctx.bezierCurveTo(w * 0.32, h * (fy + 0.02), w * 0.38, h * fy, w * 0.55, h * fy);
    ctx.stroke();
  }
}

/**
 * The media panel: dot-grid placeholder that accretes in, idles in waves,
 * then flips to the artwork block by block.
 */
function MaterializePanel() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const rect = host.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const art = document.createElement("canvas");
    art.width = w * dpr;
    art.height = h * dpr;
    const artCtx = art.getContext("2d");
    if (!artCtx) return;
    artCtx.scale(dpr, dpr);
    paintArtwork(artCtx, w, h);

    if (prefersReducedMotion()) {
      ctx.drawImage(art, 0, 0, w, h);
      return;
    }

    const cols = Math.ceil(w / PITCH);
    const rows = Math.ceil(h / PITCH);
    const bCols = Math.ceil(w / BLOCK);
    const bRows = Math.ceil(h / BLOCK);
    const cxCell = (cols - 1) / 2;
    const cyCell = (rows - 1) / 2;
    const maxCellDist = Math.hypot(cxCell, cyCell) || 1;
    const cxBlock = (bCols - 1) / 2;
    const cyBlock = (bRows - 1) / 2;
    const maxBlockDist = Math.hypot(cxBlock, cyBlock) || 1;

    const start = performance.now();
    let raf = 0;
    let settled = false;

    const frame = (now: number) => {
      const t = now - start;
      const T = t / 1000;
      ctx.fillStyle = PANEL_BG;
      ctx.fillRect(0, 0, w, h);

      let allFlipped = t > REVEAL_START + REVEAL_SPREAD + REVEAL_JITTER + 60;

      for (let by = 0; by < bRows; by++) {
        for (let bx = 0; bx < bCols; bx++) {
          const bn = hash2(bx * 3.7, by * 5.1);
          const bDist = Math.hypot(bx - cxBlock, by - cyBlock) / maxBlockDist;
          const flipAt = REVEAL_START + bDist * REVEAL_SPREAD + bn * REVEAL_JITTER;
          const flipped = t >= flipAt;
          if (!flipped) allFlipped = false;

          const px = bx * BLOCK;
          const py = by * BLOCK;
          if (flipped) {
            // A flipped block shows its slice of the artwork, sharp, no fade.
            // The binary flip is what the reference does; anything softer
            // loses the mosaic read.
            ctx.drawImage(
              art,
              px * dpr,
              py * dpr,
              BLOCK * dpr,
              BLOCK * dpr,
              px,
              py,
              BLOCK,
              BLOCK,
            );
            continue;
          }

          // Un-flipped blocks keep their dots: two pitches per block.
          for (let sy = 0; sy < 2; sy++) {
            for (let sx = 0; sx < 2; sx++) {
              const gx = bx * 2 + sx;
              const gy = by * 2 + sy;
              if (gx >= cols || gy >= rows) continue;
              const n = hash2(gx * 1.3, gy * 2.1);
              const appearAt =
                ACCRETE_START +
                (Math.hypot(gx - cxCell, gy - cyCell) / maxCellDist) * ACCRETE_SPREAD +
                n * ACCRETE_JITTER;
              if (t < appearAt) continue;

              // Slow waves drifting through the grid decide each dot's state.
              const wave =
                Math.sin(gx * 0.55 + T * 1.1) +
                Math.sin(gy * 0.4 - T * 0.8) +
                Math.sin((gx + gy) * 0.3 + T * 0.6);
              const v = wave / 3 + (n - 0.5) * 0.9;

              const dx = gx * PITCH + PITCH / 2;
              const dy = gy * PITCH + PITCH / 2;
              ctx.beginPath();
              ctx.arc(dx, dy, DOT_R, 0, Math.PI * 2);
              if (v < -0.28) {
                ctx.strokeStyle = RING;
                ctx.lineWidth = 1;
                ctx.stroke();
              } else {
                ctx.fillStyle = v < 0.14 ? DOT_GRAY : v < 0.55 ? DOT_ORANGE : DOT_CREAM;
                ctx.fill();
              }
            }
          }
        }
      }

      if (allFlipped) {
        if (!settled) {
          settled = true;
          ctx.drawImage(art, 0, 0, w, h);
        }
        return; // reveal done, stop animating
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={hostRef} className={styles.panel}>
      <canvas ref={canvasRef} className={styles.panelCanvas} aria-hidden="true" />
    </div>
  );
}

/* --------------------------------- views ---------------------------------- */

function IndexView({ onOpen }: { onOpen: () => void }) {
  return (
    <main className={styles.page}>
      <h1 className={`${styles.title} ${styles.in}`}>Transition Lab</h1>
      <p className={`${styles.lede} ${styles.in}`} style={{ "--d": "90ms" } as React.CSSProperties}>
        A study of a click-through page transition: a warm bloom floods the
        viewport, the route swaps under full cover, and the landing content
        materializes from a dot matrix.
      </p>

      <div className={`${styles.entry} ${styles.in}`} style={{ "--d": "180ms" } as React.CSSProperties}>
        <div className={styles.entryMeta}>
          <span className={styles.entryRole}>Conversational Analytics</span>
          <span className={styles.entrySub}>Blockchain at Berkeley (2022-26)</span>
        </div>
        <button type="button" className={styles.cta} onClick={onOpen}>
          View case study <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <p className={`${styles.hint} ${styles.in}`} style={{ "--d": "270ms" } as React.CSSProperties}>
        click through, then come back; both directions run the full grammar
      </p>
    </main>
  );
}

function StudyView({ onBack }: { onBack: () => void }) {
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
  return (
    <main className={styles.page}>
      <header className={styles.studyHeader}>
        <div className={`${styles.brand} ${styles.in}`} style={d(150)}>
          <button type="button" className={styles.back} onClick={onBack}>
            &larr; index
          </button>
          <span className={styles.brandName}>B@B Labs</span>
          <span className={styles.brandRole}>Case Study, via Transition Lab</span>
        </div>
        <p className={`${styles.headline} ${styles.in}`} style={d(280)}>
          Designed an agent-powered conversational analytics surface that lets
          engineers explore complex on-chain data through natural language,{" "}
          <span className={`${styles.in}`} style={d(560)}>
            replacing a set of separate dashboards with one conversational
            workflow.
          </span>
        </p>
      </header>

      <div className={styles.studyBody}>
        <nav className={styles.sidebar} aria-label="Case study sections">
          {[
            "Why conversation",
            "Design challenges",
            "Overview",
            "Patterns",
            "Inspect",
            "Full suite",
          ].map((label, i) => (
            <span key={label} className={`${styles.navItem} ${styles.in}`} style={d(420 + i * 70)}>
              {label}
            </span>
          ))}
        </nav>

        <MaterializePanel />

        <div className={styles.notes}>
          {[
            "0 to 1 agent-powered analytics for protocol teams.",
            "Multi-agent orchestration behind one conversation.",
            "Progressive disclosure builds trust in answers.",
            "Persistent workspace for deep dives.",
          ].map((line, i) => (
            <p key={line} className={`${styles.note} ${styles.in}`} style={d(640 + i * 90)}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}

/* --------------------------------- root ----------------------------------- */

export function TransitionLab() {
  const [view, setView] = useState<View>("index");
  const pendingView = useRef<View>("index");
  const { canvasRef, begin, running } = useVeil(() => setView(pendingView.current));

  const go = (next: View) => () => {
    if (running.current) return;
    pendingView.current = next;
    if (prefersReducedMotion()) {
      setView(next);
      return;
    }
    // Forward sweeps left to right, coming back sweeps right to left.
    if (!begin(next === "study" ? 1 : -1)) setView(next);
  };

  return (
    <div className={styles.root}>
      {/* key remounts the view so the assembly stagger re-runs every swap */}
      {view === "index" ? (
        <IndexView key="index" onOpen={go("study")} />
      ) : (
        <StudyView key="study" onBack={go("index")} />
      )}
      <canvas ref={canvasRef} className={styles.veil} aria-hidden="true" />
    </div>
  );
}
