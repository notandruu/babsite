"use client";

import { useEffect, useRef } from "react";
import { TIMELINE_STOPS } from "./data";
import { CARD_SPACING, useShowcaseStoreContext } from "./useShowcaseStore";

// Sparse era markers rather than one per card — cycling through all eleven
// real stops meant some (2016/2017/2018/2019) flashed past within a couple
// seconds of travel. Four evenly-spaced round years read as a slower,
// sweeping sense of scale instead, independent of which card is active.
const MILESTONE_YEARS = ["2014", "2018", "2022", "2026"];

// Same hex-noise language as the homepage hero (src/components/HashMatrix.tsx,
// backgroundOnly mode) — this is a smaller, purpose-built sibling rather than
// a shared import, since it also needs to weave in real timeline years and
// react to store.activeIndex, neither of which the homepage version knows about.
const HEX = "0123456789abcdef";
function randomHex(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)];
  return s;
}
function buildLine(cols: number) {
  let line = "";
  while (line.length < cols) line += randomHex(8) + " ";
  return line.slice(0, cols);
}

// The homepage's logo->campanile transition (HashMatrix.tsx) reads as
// "snappy" because it's a real particle flight: every lit character-cell of
// the old shape gets assigned a destination cell in the new shape and
// travels there. A cross-fade or in-place scramble can't produce that same
// feeling because nothing actually moves — so this uses the identical
// technique, just retargeted at year numerals instead of logo/campanile.
const TRANSITION_MS = 480;

/** Overshoots past 1 then settles back — the "snap" in the motion, as
 * opposed to a linear or ease-in-out arrival. */
function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const p = t - 1;
  return 1 + c3 * p * p * p + c1 * p * p;
}

// Large enough, and low enough, that the card row actually overlaps and
// eclipses its lower portion — the numeral reads as a big object the cards
// float in front of, visible in the gaps around and above them, rather than
// a shape confined to a strip that avoids the cards entirely.
const GLYPH_CENTER_Y_FRAC = 0.34;
const GLYPH_FONT_FRAC = 0.4;

// A fast scroll fling can walk the active index through several stops a
// second — far faster than TRANSITION_MS. Starting a new flight on top of
// one that's still mid-air was the "jumble": abandoned particles snapping
// off toward a stale destination. Below this gap since the last change, skip
// the animation and just snap straight to the new shape; only a change that
// stands on its own for a beat gets the full flight.
const MIN_ANIMATED_GAP_MS = 260;

// Whatever random hex character happened to be sitting at a lit cell in the
// ambient field made a poor "pixel" for the numeral — each glyph has its own
// shape and ink weight, so the outline read as noisy static rather than a
// digit. A fixed glyph makes every lit cell read the same way, so the
// silhouette carries the shape — a solid block was legible but read as a
// flat, overly-saturated painted-on shape rather than something built out
// of the same hex-character material as the rest of the field.
const GLYPH_PIXEL = "0";

interface LitCell {
  x: number;
  y: number;
  row: number;
  col: number;
}

interface Morph {
  count: number;
  sx: Float32Array;
  sy: Float32Array;
  dx: Float32Array;
  dy: Float32Array;
  chars: string[];
}

export function ShowcaseHashBackground() {
  const store = useShowcaseStoreContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const FONT_SIZE = 9;
    const LINE_HEIGHT = 12;

    let cols = 0;
    let rows = 0;
    let charW = 0;
    let lines: string[] = [];
    let heat = new Float32Array(0);
    let raf = 0;
    // Offscreen canvas at exactly one pixel per character cell (cols x rows,
    // not screen pixels) — same trick HashMatrix uses to sample where a 3D
    // model lands on the character grid, but here it's a year numeral
    // rendered directly at grid resolution, so sampling its alpha per cell
    // gives the exact set of grid cells that outline that year.
    let glyphCanvas: HTMLCanvasElement | null = null;
    let glyphCtx: CanvasRenderingContext2D | null = null;

    let shownIndex = -1;
    let currentLit: LitCell[] = [];
    let morph: Morph | null = null;
    let transitionStart = 0;
    let lastChangeAt = 0;

    // EB Garamond for the numeral stencil specifically (not the ambient
    // field, which stays Courier New to keep the hex-code look) — canvas
    // ctx.font needs the actual family loaded before it'll draw with it, so
    // fetch the stylesheet and wait on it rather than assuming it's ready.
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@600;700&display=swap";
    document.head.appendChild(fontLink);
    document.fonts
      .load('700 40px "EB Garamond"')
      .then(() => {
        shownIndex = -1; // force a re-sample now that the real font is ready
      })
      .catch(() => {});

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      ctx!.font = `${FONT_SIZE}px "Courier New", monospace`;
      charW = ctx!.measureText("M").width;
      cols = Math.ceil(w / charW);
      rows = Math.ceil(h / LINE_HEIGHT);
      lines = Array.from({ length: rows }, () => buildLine(cols));
      heat = new Float32Array(cols * rows);

      glyphCanvas = document.createElement("canvas");
      glyphCanvas.width = cols;
      glyphCanvas.height = rows;
      glyphCtx = glyphCanvas.getContext("2d");
      shownIndex = -1;
      currentLit = [];
      morph = null;
    }
    resize();
    window.addEventListener("resize", resize);

    function sampleLit(year: string): LitCell[] {
      if (!glyphCtx || !glyphCanvas) return [];
      glyphCtx.clearRect(0, 0, cols, rows);
      glyphCtx.fillStyle = "#fff";
      glyphCtx.strokeStyle = "#fff";
      glyphCtx.textAlign = "center";
      glyphCtx.textBaseline = "middle";
      const fontPx = Math.round(rows * GLYPH_FONT_FRAC);
      glyphCtx.font = `700 ${fontPx}px "EB Garamond", Georgia, serif`;
      // Digits sitting flush against each other were part of why the shape
      // read as a blob rather than four distinct characters — spacing them
      // out gives each one room to be told apart from its neighbors.
      glyphCtx.letterSpacing = `${Math.round(fontPx * 0.16)}px`;
      const x = cols / 2;
      const y = rows * GLYPH_CENTER_Y_FRAC;
      // Stroke on top of fill to bulk up the strokes — at this small a
      // render size a plain fill leaves most of the glyph under the
      // anti-aliasing threshold, so the sampled shape came out as sparse,
      // barely-legible flecks instead of a solid numeral.
      glyphCtx.lineWidth = Math.max(1, fontPx * 0.18);
      glyphCtx.fillText(year, x, y);
      glyphCtx.strokeText(year, x, y);
      const data = glyphCtx.getImageData(0, 0, cols, rows).data;
      const lit: LitCell[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (data[(row * cols + col) * 4 + 3] > 15) {
            lit.push({ x: col * charW, y: row * LINE_HEIGHT, row, col });
          }
        }
      }
      return lit;
    }

    /** Assigns every old-shape cell a (shuffled) destination cell in the new
     * shape — wrapping around whichever list is shorter, same overflow
     * handling as HashMatrix's buildMorphSnapshot. */
    function buildMorph(oldLit: LitCell[], newLit: LitCell[]): Morph {
      const shuffled = [...newLit];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const count = Math.max(oldLit.length, shuffled.length, 1);
      const sx = new Float32Array(count);
      const sy = new Float32Array(count);
      const dx = new Float32Array(count);
      const dy = new Float32Array(count);
      const chars: string[] = new Array(count);
      for (let i = 0; i < count; i++) {
        const src = oldLit.length > 0 ? oldLit[i % oldLit.length] : shuffled[i % shuffled.length];
        const dst = shuffled.length > 0 ? shuffled[i % shuffled.length] : src;
        sx[i] = src.x;
        sy[i] = src.y;
        dx[i] = dst.x;
        dy[i] = dst.y;
        chars[i] = GLYPH_PIXEL;
      }
      return { count, sx, sy, dx, dy, chars };
    }

    function animate() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      for (let i = 0; i < Math.floor(cols * rows * 0.0025); i++) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const line = lines[row];
        if (line) {
          const ch = line.split("");
          ch[col] = HEX[Math.floor(Math.random() * 16)];
          lines[row] = ch.join("");
          heat[row * cols + col] = 1;
        }
      }
      for (let i = 0; i < cols * rows; i++) {
        if (heat[i] > 0) heat[i] = Math.max(0, heat[i] - 0.012);
      }

      const totalRange = (TIMELINE_STOPS.length - 1) * CARD_SPACING;
      const segment = totalRange / MILESTONE_YEARS.length;
      const milestoneIndex = Math.max(
        0,
        Math.min(MILESTONE_YEARS.length - 1, Math.floor(store.trackX / segment))
      );
      if (milestoneIndex !== shownIndex) {
        const now = performance.now();
        const gap = now - lastChangeAt;
        const newLit = sampleLit(MILESTONE_YEARS[milestoneIndex]);
        if (shownIndex === -1 || gap < MIN_ANIMATED_GAP_MS) {
          // First paint, or the active card is still changing faster than a
          // flight can resolve (mid fast-scroll) — snap instead of layering
          // another animation on top of one that hasn't landed yet.
          currentLit = newLit;
          morph = null;
        } else {
          morph = buildMorph(currentLit, newLit);
          currentLit = newLit;
          transitionStart = now;
        }
        lastChangeAt = now;
        shownIndex = milestoneIndex;
      }

      // Base hash field — every cell, unconditionally. The old numeral's
      // former cells fall right back into this plain noise the instant its
      // characters depart, so nothing lingers behind mid-flight.
      ctx!.clearRect(0, 0, w, h);
      ctx!.textBaseline = "top";
      ctx!.font = `${FONT_SIZE}px "Courier New", monospace`;
      for (let row = 0; row < rows; row++) {
        const line = lines[row];
        if (!line) continue;
        for (let col = 0; col < cols; col++) {
          const ch = line[col];
          if (!ch || ch === " ") continue;
          const hv = heat[col + row * cols] ?? 0;
          ctx!.fillStyle = `rgba(255,255,255,${(0.035 + hv * 0.14).toFixed(3)})`;
          ctx!.fillText(ch, col * charW, row * LINE_HEIGHT);
        }
      }

      const elapsed = morph ? performance.now() - transitionStart : Infinity;
      const rawT = Math.min(1, elapsed / TRANSITION_MS);

      if (morph && rawT < 1) {
        // In flight — gold characters travel from their old positions to
        // their new ones, overshooting slightly before settling.
        const t = easeOutBack(rawT);
        for (let i = 0; i < morph.count; i++) {
          const x = morph.sx[i] + (morph.dx[i] - morph.sx[i]) * t;
          const y = morph.sy[i] + (morph.dy[i] - morph.sy[i]) * t;
          ctx!.fillStyle = "rgba(255,232,190,0.34)";
          ctx!.fillText(morph.chars[i], x, y);
        }
      } else {
        morph = null;
        for (const cell of currentLit) {
          const hv = heat[cell.col + cell.row * cols] ?? 0;
          ctx!.fillStyle = `rgba(255,232,190,${(0.22 + hv * 0.1).toFixed(3)})`;
          ctx!.fillText(GLYPH_PIXEL, cell.x, cell.y);
        }
      }

      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [store]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
