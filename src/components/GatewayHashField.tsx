"use client";

import { useEffect, useRef } from "react";

/**
 * The field that rises out of the bottom of the page as the gateway meter
 * fills.
 *
 * Two things make this read the way the reference does, and neither is
 * achievable with a CSS gradient:
 *
 * 1. Its height is driven by progress, so it climbs in step with the meter
 *    rather than just brightening in place.
 *
 * 2. The upper boundary is a *density* falloff, not an opacity fade. Each
 *    cell holds a fixed random threshold and lights only when the local
 *    density exceeds it, so the leading edge is a ragged dither that thins
 *    out into nothing. Fading a uniform grid instead — which is what a mask
 *    does — always leaves a visible horizontal seam where the fade begins,
 *    because every cell dims together.
 *
 * The cells are hex characters rather than plain dots: same material as the
 * hash field on /showcase and the homepage hero, so the page you're leaving
 * is already made of what you're arriving into, and it reads as a hash being
 * worked out rather than a loading texture.
 */

const HEX = "0123456789abcdef";
const CELL_W = 8;
const CELL_H = 11;
const FONT_PX = 9;
// How much of the section's height the field can eventually cover.
const MAX_REACH = 0.72;
// Width of the dithered leading edge as a fraction of the field. Wider means
// a longer, softer scatter before it fully thins out.
const EDGE = 0.42;

export function GatewayHashField({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Progress reaches the draw loop through a ref so the canvas effect can
  // stay mounted for the lifetime of the component instead of tearing down
  // and re-seeding the whole grid on every scroll frame. Synced in its own
  // effect rather than assigned during render, which isn't allowed.
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let thresholds = new Float32Array(0);
    let brightness = new Float32Array(0);
    let chars: string[] = [];
    let raf = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / CELL_W);
      rows = Math.ceil(height / CELL_H);
      const n = cols * rows;
      // Fixed per cell so the pattern is stable as it rises — re-rolling
      // these every frame would make the whole field boil.
      thresholds = new Float32Array(n);
      brightness = new Float32Array(n);
      chars = new Array(n);
      for (let i = 0; i < n; i++) {
        thresholds[i] = Math.random();
        // Deliberately dim. The field is a texture the terminal line sits in
        // front of, not a competing surface — at full strength the hex read
        // as brighter than the command itself and flattened the hierarchy.
        brightness[i] = 0.16 + Math.random() * 0.40;
        chars[i] = HEX[(Math.random() * 16) | 0];
      }
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const p = progressRef.current;
      if (p > 0.001) {
        // Mutate a few cells per frame so the field shimmers like a live
        // hash rather than sitting frozen.
        for (let i = 0; i < 14; i++) {
          const idx = (Math.random() * chars.length) | 0;
          chars[idx] = HEX[(Math.random() * 16) | 0];
        }

        const reach = p * MAX_REACH;
        ctx.font = `${FONT_PX}px var(--font-dm-mono), ui-monospace, "SF Mono", monospace`;
        ctx.textBaseline = "top";

        for (let row = 0; row < rows; row++) {
          // 0 at the top of the element, 1 at the bottom.
          const yFrac = row / rows;
          // How far into the risen field this row sits.
          const depth = (yFrac - (1 - reach)) / (EDGE * Math.max(reach, 0.001));
          if (depth <= 0) continue;
          const density = depth > 1 ? 1 : depth;

          for (let col = 0; col < cols; col++) {
            const i = row * cols + col;
            if (thresholds[i] > density) continue;
            const a = brightness[i] * (0.25 + 0.75 * density);
            ctx.fillStyle = `rgba(254, 203, 51, ${a.toFixed(3)})`;
            ctx.fillText(chars[i], col * CELL_W, row * CELL_H);
          }
        }
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
