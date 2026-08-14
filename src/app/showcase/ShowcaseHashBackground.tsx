"use client";

import { useEffect, useRef } from "react";
import { TIMELINE_STOPS } from "./data";
import { useShowcaseStoreContext } from "./useShowcaseStore";

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

// The numeral used to sit dead-center, which is exactly where the active
// card always is — so the card just covered it. This puts it in the gap
// between the DOM heading and the card row instead (browse-mode camera in
// ShowcaseScene.tsx aims to keep that gap open), sized to actually fit it.
const GLYPH_CENTER_Y_FRAC = 0.22;
const GLYPH_FONT_FRAC = 0.14;

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

    function sampleLit(index: number): LitCell[] {
      if (!glyphCtx || !glyphCanvas) return [];
      glyphCtx.clearRect(0, 0, cols, rows);
      glyphCtx.fillStyle = "#fff";
      glyphCtx.textAlign = "center";
      glyphCtx.textBaseline = "middle";
      glyphCtx.font = `600 ${Math.round(rows * GLYPH_FONT_FRAC)}px "Courier New", monospace`;
      glyphCtx.fillText(TIMELINE_STOPS[index].year, cols / 2, rows * GLYPH_CENTER_Y_FRAC);
      const data = glyphCtx.getImageData(0, 0, cols, rows).data;
      const lit: LitCell[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (data[(row * cols + col) * 4 + 3] > 40) {
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
        chars[i] = lines[src.row]?.[src.col] ?? HEX[Math.floor(Math.random() * 16)];
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

      const activeIndex = store.getSnapshot().activeIndex;
      if (activeIndex !== shownIndex) {
        const newLit = sampleLit(activeIndex);
        if (shownIndex === -1) {
          // Nothing to fly in from on first paint — appear directly.
          currentLit = newLit;
        } else {
          morph = buildMorph(currentLit, newLit);
          currentLit = newLit;
          transitionStart = performance.now();
        }
        shownIndex = activeIndex;
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
          ctx!.fillStyle = "rgba(254,203,51,0.55)";
          ctx!.fillText(morph.chars[i], x, y);
        }
      } else {
        morph = null;
        for (const cell of currentLit) {
          const hv = heat[cell.col + cell.row * cols] ?? 0;
          ctx!.fillStyle = `rgba(254,203,51,${(0.34 + hv * 0.12).toFixed(3)})`;
          ctx!.fillText(lines[cell.row]?.[cell.col] ?? HEX[0], cell.x, cell.y);
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
