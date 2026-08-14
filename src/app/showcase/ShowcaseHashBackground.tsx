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

// How long the digit-scramble plays before the real year resolves — a snap,
// not a fade, echoing the homepage's morph feeling "assembled" rather than
// dissolved.
const SCRAMBLE_MS = 220;

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
    // rendered directly at grid resolution. Sampling its alpha per cell is
    // what lets the numeral's shape be "drawn" using the hash characters
    // themselves, rather than painted as a flat shape on top of them.
    let glyphCanvas: HTMLCanvasElement | null = null;
    let glyphCtx: CanvasRenderingContext2D | null = null;
    let glyphData: Uint8ClampedArray | null = null;

    let shownIndex = -1;
    let scrambleUntil = 0;

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
      shownIndex = -1; // force a redraw of the stencil at the new resolution
    }
    resize();
    window.addEventListener("resize", resize);

    function redrawGlyph(index: number) {
      if (!glyphCtx || !glyphCanvas) return;
      glyphCtx.clearRect(0, 0, cols, rows);
      glyphCtx.fillStyle = "#fff";
      glyphCtx.textAlign = "center";
      glyphCtx.textBaseline = "middle";
      // Kept modest and letter-spaced rather than filling the frame edge to
      // edge — a giant numeral read as too tall/heavy for this site.
      glyphCtx.font = `600 ${Math.round(rows * 0.46)}px "Courier New", monospace`;
      glyphCtx.fillText(TIMELINE_STOPS[index].year, cols / 2, rows / 2);
      glyphData = glyphCtx.getImageData(0, 0, cols, rows).data;
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

      // Exactly one year on screen, tied to the active stop (not a
      // continuously-interpolated travel position) — it snaps the instant
      // the active card changes, then plays a brief scramble instead of
      // cross-fading between two numerals.
      const activeIndex = store.getSnapshot().activeIndex;
      if (activeIndex !== shownIndex) {
        shownIndex = activeIndex;
        redrawGlyph(shownIndex);
        scrambleUntil = performance.now() + SCRAMBLE_MS;
      }
      const scrambling = performance.now() < scrambleUntil;

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
          const gi = (row * cols + col) * 4;
          const glyphAlpha = glyphData ? glyphData[gi + 3] / 255 : 0;
          if (glyphAlpha > 0.15) {
            // Inside the numeral's silhouette — brighter, gold-tinted, so
            // the year reads clearly while still being made of the same hex
            // characters as the rest of the field. Mid-scramble it flickers
            // through random hex instead of holding still, which is what
            // sells the snap rather than a soft dissolve.
            const drawCh = scrambling ? HEX[Math.floor(Math.random() * 16)] : ch;
            const intensity = scrambling ? 0.55 : 0.16 + glyphAlpha * 0.3 + hv * 0.12;
            ctx!.fillStyle = `rgba(254,203,51,${intensity.toFixed(3)})`;
            ctx!.fillText(drawCh, col * charW, row * LINE_HEIGHT);
          } else {
            ctx!.fillStyle = `rgba(255,255,255,${(0.035 + hv * 0.14).toFixed(3)})`;
            ctx!.fillText(ch, col * charW, row * LINE_HEIGHT);
          }
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
