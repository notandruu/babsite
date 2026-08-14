"use client";

import { useEffect, useRef } from "react";
import { TIMELINE_STOPS } from "./data";
import { CARD_SPACING, useShowcaseStoreContext } from "./useShowcaseStore";

// Evenly-spaced, one year apart — cycling through all eleven real stops
// meant some (2016/2017/2018/2019) flashed past within a couple seconds of
// travel, so this is a steadier backdrop clock rather than tied 1:1 to
// whichever card happens to be active.
const MILESTONE_START = 2014;
const MILESTONE_END = 2026;
const MILESTONE_YEARS = Array.from(
  { length: MILESTONE_END - MILESTONE_START + 1 },
  (_, i) => String(MILESTONE_START + i)
);

// Same hex-noise language as the homepage hero (src/components/HashMatrix.tsx,
// backgroundOnly mode) — this is a smaller, purpose-built sibling rather than
// a shared import, since it also needs to weave in real timeline years and
// react to store.trackX, neither of which the homepage version knows about.
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

// Large enough, and low enough, that the card row actually overlaps and
// eclipses its lower portion — the numeral reads as a big object the cards
// float in front of, visible in the gaps around and above them, rather than
// a shape confined to a strip that avoids the cards entirely.
const GLYPH_CENTER_Y_FRAC = 0.34;
const GLYPH_FONT_FRAC = 0.4;

// Whatever random hex character happened to be sitting at a lit cell in the
// ambient field made a poor "pixel" for the numeral — each glyph has its own
// shape and ink weight, so the outline read as noisy static rather than a
// digit. A fixed glyph makes every lit cell read the same way, so the
// silhouette carries the shape.
const GLYPH_PIXEL = "0";

interface LitCell {
  x: number;
  y: number;
  row: number;
  col: number;
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

    // EB Garamond for the numeral stencil specifically (not the ambient
    // field, which stays Courier New to keep the hex-code look) — canvas
    // ctx.font needs the actual family loaded before it'll draw with it, so
    // fetch the stylesheet and wait on it rather than assuming it's ready.
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap";
    document.head.appendChild(fontLink);
    document.fonts
      .load('400 40px "Archivo Black"')
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
      glyphCtx.font = `400 ${fontPx}px "Archivo Black", "Arial Black", sans-serif`;
      // Digits sitting flush against each other were part of why the shape
      // read as a blob rather than four distinct characters — spacing them
      // out gives each one room to be told apart from its neighbors.
      glyphCtx.letterSpacing = `${Math.round(fontPx * 0.16)}px`;
      const x = cols / 2;
      const y = rows * GLYPH_CENTER_Y_FRAC;
      // No stroke pass here, unlike the thinner serif this replaced —
      // Archivo Black is already maximum-weight, and stroking an outline on
      // top of that filled in the counters of digits like 0/6/8/9, turning
      // them into solid discs instead of recognizable characters.
      glyphCtx.fillText(year, x, y);
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
        currentLit = sampleLit(MILESTONE_YEARS[milestoneIndex]);
        shownIndex = milestoneIndex;
      }

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

      for (const cell of currentLit) {
        const hv = heat[cell.col + cell.row * cols] ?? 0;
        ctx!.fillStyle = `rgba(255,232,190,${(0.22 + hv * 0.1).toFixed(3)})`;
        ctx!.fillText(GLYPH_PIXEL, cell.x, cell.y);
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
