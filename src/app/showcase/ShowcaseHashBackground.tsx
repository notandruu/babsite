"use client";

import { useEffect, useRef } from "react";
import { TIMELINE_STOPS } from "./data";
import { CARD_SPACING, useShowcaseStoreContext } from "./useShowcaseStore";

// Same hex-noise language as the homepage hero (src/components/HashMatrix.tsx,
// backgroundOnly mode) — this is a smaller, purpose-built sibling rather than
// a shared import, since it also needs to weave in real timeline years and
// track store.trackX, neither of which the homepage version knows about.
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

// Rough world-unit-to-pixel scale for the parallax years — not the actual
// camera projection (that depends on fov/distance/viewport and would be
// overkill for a decorative wash), just enough to make the giant year marks
// drift in the right direction and rough proportion as the camera travels.
const WORLD_TO_PX = 90;

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
    }
    resize();
    window.addEventListener("resize", resize);

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
          ctx!.fillStyle = `rgba(255,255,255,${(0.045 + hv * 0.16).toFixed(3)})`;
          ctx!.fillText(ch, col * charW, row * LINE_HEIGHT);
        }
      }

      // Giant faded years, drifting with camera travel — the "years inside
      // the background" reference cue, rendered in the same monospace hash
      // language as the rest of the scene instead of a separate typeface.
      const originPx = w * 0.5 - store.trackX * WORLD_TO_PX;
      ctx!.textAlign = "center";
      ctx!.font = `700 ${Math.min(w, h) * 0.32}px "Courier New", monospace`;
      for (let i = 0; i < TIMELINE_STOPS.length; i++) {
        const x = originPx + i * CARD_SPACING * WORLD_TO_PX;
        if (x < -400 || x > w + 400) continue;
        ctx!.fillStyle = "rgba(255,255,255,0.032)";
        ctx!.fillText(TIMELINE_STOPS[i].year, x, h * 0.5);
      }
      ctx!.textAlign = "left";

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
