"use client";

import { useEffect, useRef } from "react";

const HEX = "0123456789abcdef";
const FILL = "01";

interface Cell {
  x: number;
  y: number;
  lum: number;
  ch: string;
  phase: number;
  dist: number; // normalized distance from icon center, drives the decode wave
}

/**
 * Live ASCII rendering of an icon PNG — the same treatment as the hero's 3D
 * bear: glyphs sampled from the render's luminance, constantly churning like
 * the hash matrix, with a soft per-cell shimmer. Swapping `palette` (hover)
 * triggers a radial "decode" sweep: cells scramble briefly and resettle in the
 * new color, spreading outward from the center.
 */
export function AsciiIcon({ src, palette, active, style }: { src: string; palette: string[]; active?: boolean; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<Cell[] | null>(null);
  const dimsRef = useRef({ W: 0, H: 0 });
  const paletteRef = useRef(palette);
  const activeRef = useRef(!!active);
  const decodeStartRef = useRef(0);

  // Track palette swaps; the decode wave only fires on activation (hover in),
  // not on release.
  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);
  useEffect(() => {
    if (active && !activeRef.current) decodeStartRef.current = performance.now();
    activeRef.current = !!active;
  }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    let raf = 0;
    const CHAR_W = 4, CHAR_H = 5.6, FONT = 5.4;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (cancelled) return;

      // Probe pass — content bounding box so margins don't shrink the art.
      const P = 64;
      const probe = document.createElement("canvas");
      probe.width = P; probe.height = P;
      const pctx = probe.getContext("2d", { willReadFrequently: true })!;
      pctx.drawImage(img, 0, 0, P, P);
      const pd = pctx.getImageData(0, 0, P, P).data;
      const bgTransparent = pd[3] < 40;
      const isBg = (l: number, a: number) => a < 0.16 || (!bgTransparent && l > 0.955);
      let bx0 = P, by0 = P, bx1 = 0, by1 = 0;
      for (let y = 0; y < P; y++) {
        for (let x = 0; x < P; x++) {
          const i = (y * P + x) * 4;
          const l = (pd[i] * 0.299 + pd[i + 1] * 0.587 + pd[i + 2] * 0.114) / 255;
          if (isBg(l, pd[i + 3] / 255)) continue;
          if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
          if (y < by0) by0 = y; if (y > by1) by1 = y;
        }
      }
      if (bx1 <= bx0 || by1 <= by0) { bx0 = 0; by0 = 0; bx1 = P - 1; by1 = P - 1; }
      const pad = 2.5;
      const sx = Math.max(0, ((bx0 - pad) / P) * img.width);
      const sy = Math.max(0, ((by0 - pad) / P) * img.height);
      const sw = Math.min(img.width - sx, ((bx1 - bx0 + 2 * pad + 1) / P) * img.width);
      const sh = Math.min(img.height - sy, ((by1 - by0 + 2 * pad + 1) / P) * img.height);

      const W = 320;
      const H = Math.round((W * sh) / sw);
      const cols = Math.floor(W / CHAR_W);
      const rows = Math.floor(H / CHAR_H);

      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const octx = off.getContext("2d", { willReadFrequently: true })!;
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      const data = octx.getImageData(0, 0, cols, rows).data;

      const cells: Cell[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const a = data[i + 3] / 255;
          const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          if (isBg(lum, a)) continue;
          const seed = (r * 31 + c * 7) % 16;
          cells.push({
            x: c * CHAR_W,
            y: r * CHAR_H,
            lum,
            ch: seed === 5 ? HEX[(r * 13 + c * 3) % 16] : FILL[(r + c) % 2],
            phase: ((r * 13 + c * 29) % 100) / 100 * Math.PI * 2,
            dist: 0,
          });
        }
      }
      // Normalized distance from centroid for the decode wave.
      let cx = 0, cy = 0;
      for (const cell of cells) { cx += cell.x; cy += cell.y; }
      cx /= cells.length || 1; cy /= cells.length || 1;
      let maxD = 1;
      for (const cell of cells) {
        const d = Math.hypot(cell.x - cx, cell.y - cy);
        if (d > maxD) maxD = d;
      }
      for (const cell of cells) cell.dist = Math.hypot(cell.x - cx, cell.y - cy) / maxD;

      cellsRef.current = cells;
      dimsRef.current = { W, H };

      const dpr = 2;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.aspectRatio = `${W} / ${H}`;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.font = `${FONT}px "Courier New", monospace`;
      ctx.textBaseline = "top";

      let last = 0;
      const TICK = 80; // ~12fps — matrix churn doesn't need 60
      const draw = (now: number) => {
        if (cancelled) return;
        raf = requestAnimationFrame(draw);
        if (now - last < TICK) return;
        last = now;

        const pal = paletteRef.current;
        const lastBand = pal.length - 1;
        const decodeAge = now - decodeStartRef.current;

        // Churn: a small share of cells mutate their character each tick.
        const n = cells.length;
        for (let k = 0; k < Math.max(1, Math.floor(n * 0.012)); k++) {
          const cell = cells[(Math.random() * n) | 0];
          const r = Math.random();
          cell.ch = r < 0.08 ? HEX[(Math.random() * 16) | 0] : FILL[(Math.random() * 2) | 0];
        }

        ctx.clearRect(0, 0, W, H);
        const t = now / 1000;
        for (const cell of cells) {
          // Decode wave: cells within the travelling ring scramble bright.
          const wave = decodeAge / 650 - cell.dist; // ring position 0..1+
          const scrambling = wave > 0 && wave < 0.22;
          let band = Math.min(lastBand, Math.floor(cell.lum * pal.length));
          let alpha = 0.45 + cell.lum * 0.55;
          let ch = cell.ch;
          if (scrambling) {
            ch = Math.random() < 0.5 ? HEX[(Math.random() * 16) | 0] : FILL[(Math.random() * 2) | 0];
            band = lastBand;
            alpha = 1;
          } else {
            // Gentle shimmer, offset per cell so it ripples rather than pulses.
            alpha *= 0.82 + 0.18 * Math.sin(t * 1.7 + cell.phase);
          }
          ctx.globalAlpha = alpha;
          ctx.fillStyle = pal[band];
          ctx.fillText(ch, cell.x, cell.y);
        }
        ctx.globalAlpha = 1;
      };
      raf = requestAnimationFrame(draw);
    };

    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [src]);

  return <canvas ref={ref} style={{ display: "block", ...style }} />;
}
