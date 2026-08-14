"use client";

import { useEffect, useRef } from "react";
import { TIMELINE_STOPS } from "./data";
import { CARD_SPACING, useShowcaseStoreContext } from "./useShowcaseStore";

// Every year of the club's life, 2014 through now — no gaps, no sampling.
// The hex field behind the cards is a ledger, and a ledger doesn't skip
// blocks: the years with no card behind them (2015, 2025) still get counted,
// which is exactly the point. A decade of continuous operation is the
// credential; a highlight reel of four would undersell it.
const YEAR_START = 2014;
const YEAR_END = 2026;
const YEARS = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => String(YEAR_START + i));
const YEAR_DIGITS = 4;

// Ambient hex field, same visual language as the homepage hero
// (src/components/HashMatrix.tsx). Where the homepage seeds its noise with
// generic blockchain vocabulary, this seeds it with B@B's actual record —
// the partners, the scale, the numbers. It reads as texture at a glance and
// as a résumé if you actually look, which is the right way to carry
// credibility on a page like this: earned by density, not announced in a
// banner. Every token below is sourced from the club's own history deck
// (see data.ts) or the homepage's own stat blocks.
const HEX = "0123456789abcdef";
const CREDENTIALS = [
  "QUALCOMM", "CONSENSYS", "RIPPLE", "BASF", "FORD", "ALEO",
  "ETHGLOBAL", "BERKELEY HAAS", "SUTARDJA", "ETHEREUM", "CESC",
  "$2B+ ADVISED", "300+ MEMBERS", "200K+ STUDENTS", "50+ CLIENTS",
  "12+ INDUSTRIES", "4 CONTINENTS", "EST 2014",
];

const CREDENTIAL_RATE = 0.08; // roughly one token in twelve

function randomHex(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)];
  return s;
}

/**
 * Builds one row of the field and reports which column ranges hold
 * credential text, so those cells can be exempted from the per-frame
 * mutation below. Without that exemption the tokens don't survive: the
 * mutation loop rewrites ~40 random cells a frame, which fully randomizes
 * a ~16k-cell field within seconds, so seeded credentials decayed to zero
 * about eight seconds after load.
 *
 * Holding them fixed while the hex around them keeps churning is also the
 * more honest version of the metaphor — committed entries don't change,
 * the noise is what's ephemeral.
 */
function buildLine(cols: number): { text: string; spans: Array<[number, number]> } {
  let text = "";
  const spans: Array<[number, number]> = [];
  while (text.length < cols) {
    const isCredential = Math.random() < CREDENTIAL_RATE;
    const fragment = isCredential
      ? CREDENTIALS[Math.floor(Math.random() * CREDENTIALS.length)]
      : randomHex(8);
    if (isCredential) spans.push([text.length, text.length + fragment.length]);
    text += fragment + " ";
  }
  return { text: text.slice(0, cols), spans };
}

// Large enough, and low enough, that the card row actually overlaps and
// eclipses its lower portion — the numeral reads as a big object the cards
// float in front of, visible in the gaps around and above them, rather than
// a shape confined to a strip that avoids the cards entirely.
const GLYPH_CENTER_Y_FRAC = 0.34;
const GLYPH_FONT_FRAC = 0.4;
const GLYPH_TRACKING_FRAC = 0.16;
// A light stroke on top of the fill to thicken the strokes. Archivo Black
// is already the heaviest weight available, so extra weight has to come
// from here — but it has to stay small: an earlier version used 0.18 and
// that closed up the counters of 0/6/8/9 into solid discs.
const GLYPH_WEIGHT_FRAC = 0.055;

// Whatever random hex character happened to be sitting at a lit cell made a
// poor "pixel" for the numeral — each glyph has its own shape and ink
// weight, so the outline read as noisy static rather than a digit. A fixed
// glyph makes every lit cell read the same way, so the silhouette carries
// the shape.
const GLYPH_PIXEL = "0";

// Per-digit resolve, not a whole-numeral swap. This is the fix for the
// strobing: at one year per step, 2014 -> 2015 changes exactly one of four
// digits, so three quarters of the numeral never moves and the year stays
// continuously readable. A fast scroll then reads as a cascading roll —
// like an odometer or a departure board spinning up — instead of the entire
// shape blinking off and on. Digits settle left to right (LADDER_MS apart),
// which is what makes the cascade feel mechanical and deliberate rather
// than simultaneous.
const RESOLVE_MS = 260;
const LADDER_MS = 55;

interface LitCell {
  x: number;
  y: number;
  row: number;
  col: number;
}

/**
 * Loads the numeral's font once, shared. Canvas `ctx.font` silently falls
 * back if the family isn't resolvable yet, so without awaiting this the
 * year first paints in Arial Black and then visibly re-flows when Archivo
 * Black arrives. ShowcaseExperience awaits the same promise before
 * revealing the page, which is what keeps that swap off screen.
 */
let numeralFontPromise: Promise<unknown> | null = null;
export function loadNumeralFont(): Promise<unknown> {
  if (numeralFontPromise) return numeralFontPromise;
  if (typeof document === "undefined") return Promise.resolve();
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap";
  document.head.appendChild(link);
  numeralFontPromise = document.fonts.load('400 40px "Archivo Black"').catch(() => {});
  return numeralFontPromise;
}

interface DigitSlot {
  char: string;
  cells: LitCell[];
  resolveUntil: number;
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
    // 1 where a cell holds credential text — those cells are exempt from the
    // per-frame mutation, so the tokens persist instead of decaying into
    // noise. See buildLine.
    let locked = new Uint8Array(0);
    let raf = 0;
    // Offscreen canvas at exactly one pixel per character cell (cols x rows,
    // not screen pixels) — same trick HashMatrix uses to sample where a 3D
    // model lands on the character grid, but here it's a digit rendered
    // directly at grid resolution, so sampling its alpha per cell gives the
    // exact set of grid cells that outline that digit.
    let glyphCanvas: HTMLCanvasElement | null = null;
    let glyphCtx: CanvasRenderingContext2D | null = null;

    let shownYear = "";
    let slots: DigitSlot[] = [];

    // Archivo Black for the numeral stencil specifically (not the ambient
    // field, which stays Courier New to keep the hex-code look).
    loadNumeralFont().then(() => {
      shownYear = ""; // re-sample in case this resolved after first paint
    });

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
      heat = new Float32Array(cols * rows);
      locked = new Uint8Array(cols * rows);
      lines = [];
      for (let row = 0; row < rows; row++) {
        const { text, spans } = buildLine(cols);
        lines.push(text);
        for (const [start, end] of spans) {
          for (let col = start; col < Math.min(end, cols); col++) locked[row * cols + col] = 1;
        }
      }

      glyphCanvas = document.createElement("canvas");
      glyphCanvas.width = cols;
      glyphCanvas.height = rows;
      glyphCtx = glyphCanvas.getContext("2d");
      shownYear = "";
      slots = [];
    }
    resize();
    window.addEventListener("resize", resize);

    /** Grid-cell center for digit slot `i` of a YEAR_DIGITS-wide numeral.
     * Digits are positioned by hand rather than via canvas letterSpacing so
     * each one can be sampled independently — that per-slot isolation is
     * what makes the odometer resolve possible. */
    function digitCenterX(i: number, digitW: number, tracking: number) {
      const total = YEAR_DIGITS * digitW + (YEAR_DIGITS - 1) * tracking;
      return cols / 2 - total / 2 + i * (digitW + tracking) + digitW / 2;
    }

    function sampleDigit(ch: string, slotIndex: number): LitCell[] {
      if (!glyphCtx || !glyphCanvas) return [];
      const fontPx = Math.round(rows * GLYPH_FONT_FRAC);
      glyphCtx.clearRect(0, 0, cols, rows);
      glyphCtx.fillStyle = "#fff";
      glyphCtx.strokeStyle = "#fff";
      glyphCtx.lineJoin = "round";
      glyphCtx.textAlign = "center";
      glyphCtx.textBaseline = "middle";
      glyphCtx.font = `400 ${fontPx}px "Archivo Black", "Arial Black", sans-serif`;
      const digitW = glyphCtx.measureText("0").width;
      const tracking = fontPx * GLYPH_TRACKING_FRAC;
      const x = digitCenterX(slotIndex, digitW, tracking);
      const y = rows * GLYPH_CENTER_Y_FRAC;
      glyphCtx.lineWidth = fontPx * GLYPH_WEIGHT_FRAC;
      glyphCtx.fillText(ch, x, y);
      glyphCtx.strokeText(ch, x, y);
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
      const now = performance.now();

      for (let i = 0; i < Math.floor(cols * rows * 0.0025); i++) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (locked[row * cols + col]) continue; // committed entry, not noise
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

      // Continuous readout of scroll position, updated the instant it
      // changes — no hold or throttle. An earlier version gated how often
      // the year could change, which stopped it from tracking where you
      // actually were during a fast scroll and read as stale.
      const totalRange = (TIMELINE_STOPS.length - 1) * CARD_SPACING;
      const t = totalRange > 0 ? store.trackX / totalRange : 0;
      const yearIndex = Math.max(0, Math.min(YEARS.length - 1, Math.round(t * (YEARS.length - 1))));
      const year = YEARS[yearIndex];

      if (year !== shownYear) {
        const fresh = slots.length !== YEAR_DIGITS;
        for (let i = 0; i < YEAR_DIGITS; i++) {
          const ch = year[i];
          // Re-sample only the digits whose character actually changed —
          // resampling an unchanged digit would be identical work for an
          // identical result.
          if (fresh || slots[i].char !== ch) {
            slots[i] = { char: ch, cells: sampleDigit(ch, i), resolveUntil: 0 };
          }
          // ...but every digit lights up, changed or not, so the whole year
          // reads as one event. Only lighting the changed digits made the
          // year look like a counter incrementing a single column. The
          // left-to-right stagger keeps it from being a flat simultaneous
          // blink, and since a resolving cell draws brighter than a settled
          // one this is a pulse across the numeral, never a dropout.
          slots[i].resolveUntil = now + RESOLVE_MS + i * LADDER_MS;
        }
        shownYear = year;
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
          // Credential text sits a step above the noise floor — enough to
          // register as structure if you look, not enough to read as UI.
          const base = locked[row * cols + col] ? 0.075 : 0.035;
          ctx!.fillStyle = `rgba(255,255,255,${(base + hv * 0.14).toFixed(3)})`;
          ctx!.fillText(ch, col * charW, row * LINE_HEIGHT);
        }
      }

      // A resolving digit is drawn *brighter* than a settled one, never
      // dimmer or absent — so scrolling fast lights the numeral up rather
      // than blinking it out.
      for (const slot of slots) {
        if (!slot) continue;
        const resolving = now < slot.resolveUntil;
        for (const cell of slot.cells) {
          const hv = heat[cell.col + cell.row * cols] ?? 0;
          if (resolving) {
            ctx!.fillStyle = "rgba(255,232,190,0.52)";
            ctx!.fillText(HEX[Math.floor(Math.random() * 16)], cell.x, cell.y);
          } else {
            ctx!.fillStyle = `rgba(255,232,190,${(0.22 + hv * 0.1).toFixed(3)})`;
            ctx!.fillText(GLYPH_PIXEL, cell.x, cell.y);
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
