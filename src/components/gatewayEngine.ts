/**
 * The gateway tide: one canvas simulation that owns every visual part of the
 * About → /showcase transition.
 *
 * The previous build treated this as "a scroll meter that triggers an
 * animation" — separate glow, dot field, and wash elements that each had to
 * be kept in sync and handed off, which is exactly where every seam and
 * flash came from. Frame-by-frame, the reference is one physical system: a
 * tide of light that rises and falls with your input, and the "transition"
 * is nothing more than that same tide reaching the top of the screen. So
 * this is built as one simulation with one state value, and the pixels that
 * rise while you scroll are literally the pixels that flood the viewport and
 * carry you across the route change.
 *
 * Charge model, not scroll position: wheeling at the bottom of the page
 * pumps `charge` up; it always decays, so stopping midway visibly drains the
 * whole system — field sinks, glow dims, meter empties — and scrolling again
 * picks up from wherever it fell to. At full charge the tide floods, the
 * route swaps under full coverage, the tide holds until the showcase reports
 * ready, then clears through itself.
 *
 * The canvas lives on <body>, outside React, so the same element survives
 * the navigation. It is destroyed when the transition finishes or is
 * abandoned.
 */

const CANVAS_ID = "gateway-tide";
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

type Phase = "charging" | "flooding" | "holding" | "clearing";

// ── Tuning ──────────────────────────────────────────────────────────────────
const CELL_W = 8;
const CELL_H = 11;
const FONT_PX = 9;
const HEX = "0123456789abcdef";
// Fraction of the viewport the field reaches at full charge, before flood.
const MAX_REACH = 0.52;
// Depth of the dithered leading edge, as a fraction of current reach.
const EDGE = 0.55;
// Exponential decay of charge per second — the drain-back when you stop.
const DECAY = 0.55;
// Wheel pixels → charge.
const PUMP_GAIN = 1 / 2400;
const FLOOD_MS = 700;
const CLEAR_MS = 800;
const HOLD_CAP_MS = 4500;

// Strata drawn beneath the crest during flood/hold — brightest nearest the
// rising edge, matching the reference's luminance ramp, in this site's gold.
const STRATA = [
  { gap: 0.0, color: [253, 228, 168] as const, alpha: 0.9 },
  { gap: 0.16, color: [250, 206, 104] as const, alpha: 0.85 },
  { gap: 0.38, color: [232, 160, 52] as const, alpha: 0.8 },
  { gap: 0.64, color: [198, 122, 38] as const, alpha: 0.78 },
];

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

class GatewayEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private lastT = 0;
  private startT = performance.now();

  private charge = 0;
  private phaseName: Phase = "charging";
  private floodStart = 0;
  private commitReach = 0;
  private clearStart = 0;
  private holdSince = 0;
  private pendingClear = false;
  private appliedBlur = -1;

  private cols = 0;
  private rows = 0;
  private thresholds = new Float32Array(0);
  private brightness = new Float32Array(0);
  private chars: string[] = [];

  private levelCb: ((lvl: number) => void) | null = null;
  private commitCb: (() => void) | null = null;
  private reduced =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = CANVAS_ID;
    this.canvas.setAttribute("aria-hidden", "true");
    Object.assign(this.canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "9998",
    } as CSSStyleDeclaration);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    document.body.appendChild(this.canvas);

    // Dev-only handle. The flood is a sub-second window that can't be caught
    // reliably by driving synthetic scroll and screenshotting, so this lets
    // it be stepped to an exact progress value and inspected frame by frame
    // against the reference. Stripped from production builds.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as Record<string, unknown>).__gatewayTide = this;
    }

    this.resize = this.resize.bind(this);
    this.frame = this.frame.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  get phase(): Phase {
    return this.phaseName;
  }

  subscribe(cb: (lvl: number) => void): () => void {
    this.levelCb = cb;
    return () => {
      if (this.levelCb === cb) this.levelCb = null;
    };
  }

  onCommit(cb: () => void): void {
    this.commitCb = cb;
  }

  /** Wheel/touch input while at the bottom of the page. */
  pump(px: number): void {
    if (this.phaseName !== "charging") return;
    this.charge = Math.min(1, this.charge + px * PUMP_GAIN);
  }

  /** Called by the showcase once its scene is ready behind the tide. */
  clearWhenReady(): void {
    if (this.phaseName === "holding") {
      this.phaseName = "clearing";
      this.clearStart = performance.now();
    } else if (this.phaseName === "flooding") {
      this.pendingClear = true;
    }
  }

  /** Gateway unmounted without committing — tear down. */
  releaseIfIdle(): void {
    if (this.phaseName === "charging") this.destroy();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    this.canvas.remove();
    if (engine === this) engine = null;
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.cols = Math.ceil(w / CELL_W);
    this.rows = Math.ceil(h / CELL_H);
    const n = this.cols * this.rows;
    // Fixed per cell so the pattern is stable as the tide moves through it —
    // re-rolling per frame would make the field boil instead of rise.
    this.thresholds = new Float32Array(n);
    this.brightness = new Float32Array(n);
    this.chars = new Array(n);
    for (let i = 0; i < n; i++) {
      this.thresholds[i] = Math.random();
      this.brightness[i] = 0.3 + Math.random() * 0.7;
      this.chars[i] = HEX[(Math.random() * 16) | 0];
    }
  }

  /** Crest height in viewport fractions (0 = top) for column fraction u. */
  private crestFrac(u: number, t: number, reach: number, waveScale: number): number {
    const amp1 = 0.035 * waveScale;
    const amp2 = 0.016 * waveScale;
    return (
      1 -
      reach +
      amp1 * Math.sin(u * 2.6 * Math.PI * 2 + t * 0.5) +
      amp2 * Math.sin(u * 5.3 * Math.PI * 2 - t * 0.8 + 1.7)
    );
  }

  private frame(): void {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastT) / 1000);
    this.lastT = now;
    const t = (now - this.startT) / 1000;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ctx = this.ctx;

    // ── state ──
    if (this.phaseName === "charging") {
      // Commit is tested *before* decay. Applying decay first meant a pump
      // that reached exactly 1.0 was knocked back below the threshold on the
      // very next frame, so the meter asymptoted around 96% and could never
      // fire no matter how hard you scrolled.
      if (this.charge >= 0.999) {
        this.phaseName = "flooding";
        this.floodStart = now;
        this.commitReach = MAX_REACH;
        try {
          sessionStorage.setItem(ARRIVAL_KEY, "1");
        } catch {
          /* still transition; arrival half just won't play */
        }
      } else {
        // Always decaying: stop pumping and the whole system drains back.
        this.charge *= Math.exp(-DECAY * dt);
        if (this.charge < 0.0005) this.charge = 0;
      }
      this.levelCb?.(this.charge);
    }

    let reach: number;
    let waveScale: number;
    let floodT = 0;

    if (this.phaseName === "charging") {
      reach = this.charge * MAX_REACH;
      waveScale = this.charge;
    } else if (this.phaseName === "flooding") {
      floodT = Math.min(1, (now - this.floodStart) / (this.reduced ? 1 : FLOOD_MS));
      const e = easeInOut(floodT);
      reach = this.commitReach + (1.3 - this.commitReach) * e;
      waveScale = 1;
      if (floodT >= 1) {
        this.phaseName = "holding";
        this.holdSince = now;
        this.levelCb?.(1);
        this.commitCb?.();
        if (this.pendingClear) {
          this.phaseName = "clearing";
          this.clearStart = now;
        }
      }
    } else {
      reach = 1.3;
      waveScale = 1;
      floodT = 1;
      if (this.phaseName === "holding" && now - this.holdSince > HOLD_CAP_MS) {
        // Failsafe: never leave the page covered if readiness never fires.
        this.phaseName = "clearing";
        this.clearStart = now;
      }
    }

    let globalAlpha = 1;
    // How far the tide has cooled toward the showcase's own backdrop.
    //
    // The reference's exit looks effortless for a reason that has nothing to
    // do with its motion: its destination page is already warm peach, so the
    // wash clears into a colour it already matches and there is simply no
    // change to notice. Ours clears into a near-black page, so an identical
    // fade reads as the light being switched off. Cooling the tide toward the
    // showcase's surface as it goes reproduces his continuity rather than his
    // mechanics — the light doesn't leave, it becomes the page.
    let coolT = 0;
    if (this.phaseName === "clearing") {
      const ct = Math.min(1, (now - this.clearStart) / (this.reduced ? 1 : CLEAR_MS));
      coolT = easeInOut(Math.min(1, ct * 1.25));
      globalAlpha = 1 - easeInOut(ct);
      if (ct >= 1) {
        this.destroy();
        return;
      }
    }

    // Blur ramps with the flood, not before it. The tide is light rather
    // than geometry, and unblurred sine crests render as crisp cut-out edges
    // where the reference's boundaries are diffuse enough to be hard to
    // locate. It can't be a constant, though: the hash field has to stay
    // legibly sharp during the whole charging phase, so diffusion only
    // arrives as the flood does. CSS-side so the wave maths stays exact and
    // the GPU does the work.
    const blurPx = floodT * 32;
    if (Math.abs(blurPx - this.appliedBlur) > 0.5) {
      this.appliedBlur = blurPx;
      this.canvas.style.filter = blurPx > 0.5 ? `blur(${blurPx.toFixed(1)}px)` : "none";
    }

    // ── draw ──
    ctx.clearRect(0, 0, w, h);
    if (reach <= 0.002) {
      this.raf = requestAnimationFrame(this.frame);
      return;
    }
    ctx.globalAlpha = globalAlpha;

    // Shimmer: a few cells re-roll each frame so the field reads as a live
    // hash being worked, not a frozen texture.
    for (let i = 0; i < 12; i++) {
      const idx = (Math.random() * this.chars.length) | 0;
      this.chars[idx] = HEX[(Math.random() * 16) | 0];
    }

    const crestAtU = (u: number) => this.crestFrac(u, t, reach, waveScale);

    // 1 — glow gathering under the field (charging) / base warmth (flood).
    const glowA = this.phaseName === "charging" ? 0.34 * Math.pow(this.charge, 1.6) : 0.5;
    if (glowA > 0.004) {
      const crestMid = crestAtU(0.5);
      const grad = ctx.createLinearGradient(0, h, 0, Math.max(0, crestMid * h - h * 0.18));
      grad.addColorStop(0, `rgba(232, 172, 58, ${glowA})`);
      grad.addColorStop(0.55, `rgba(224, 150, 46, ${glowA * 0.55})`);
      grad.addColorStop(1, "rgba(224, 150, 46, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2 — flood strata: solid warm bands beneath the crest, the surface the
    // reference shows once the tide is up. Drawn before the cells so the
    // hash speckle rides on top as texture.
    if (floodT > 0) {
      for (const band of STRATA) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 6) {
          const u = x / w;
          const yF = crestAtU(u) + band.gap * (0.9 - 0.4 * floodT);
          ctx.lineTo(x, yF * h);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        // Fade each stratum in over a short distance below its own crest
        // rather than filling flat. Flat fills gave every band a hard edge,
        // so the flood read as stacked paper cut-outs instead of light —
        // the single biggest difference from the reference, which has
        // boundaries you can barely locate.
        const [br, bg, bb] = band.color;
        const r = Math.round(br + (12 - br) * coolT);
        const g = Math.round(bg + (12 - bg) * coolT);
        const b = Math.round(bb + (12 - bb) * coolT);
        const crestMid = crestAtU(0.5) + band.gap * (0.9 - 0.4 * floodT);
        const g0 = crestMid * h;
        const grad = ctx.createLinearGradient(0, g0 - h * 0.03, 0, g0 + h * 0.26);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${band.alpha * floodT})`);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    // 3 — the crest beam. The reference leads its tide with a bright, narrow
    // band of light riding the wave crest, visibly hotter than the fill
    // behind it, and it's what makes the rise read as light breaking upward
    // rather than a coloured region growing. Present from the charging phase
    // onward, brightest just as the flood commits, then washing out as the
    // colour catches up with it.
    //
    // Softened by stacking progressively wider, fainter strokes instead of
    // relying on the CSS blur — the blur is off during charging so the hash
    // field stays sharp, and a single stroke there would read as a hard line.
    const beamA = floodT > 0 ? 0.3 * (1 - 0.6 * floodT) : 0.26 * Math.pow(this.charge, 1.8);
    if (beamA > 0.012) {
      const tracePath = () => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = crestAtU(x / w) * h;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      };
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const base = Math.max(10, h * 0.05);
      // Many passes on a smooth falloff, widest and faintest first. Four
      // passes with large alpha steps produced visible concentric rings and
      // read as a piped rope of light rather than a glow; the reference's
      // beam has no locatable edge at all.
      const PASSES = 10;
      for (let i = PASSES - 1; i >= 0; i--) {
        const f = i / (PASSES - 1); // 1 = widest halo, 0 = hot core
        const widthMul = 0.5 + 5.5 * f * f;
        const alphaMul = Math.pow(1 - f, 0.85) * 0.34 + 0.02;
        tracePath();
        const beamR = Math.round(255 + (24 - 255) * coolT);
        const beamG = Math.round(233 + (22 - 233) * coolT);
        const beamB = Math.round(178 + (18 - 178) * coolT);
        ctx.strokeStyle = `rgba(${beamR}, ${beamG}, ${beamB}, ${(beamA * alphaMul).toFixed(4)})`;
        ctx.lineWidth = base * widthMul;
        ctx.stroke();
      }
    }

    // 4 — the dithered hash field. Presence per cell is a fixed threshold
    // against local density, so the leading edge is a ragged dither that
    // thins to nothing — a mask fade dims all cells together, which is what
    // produced every hard seam this replaced.
    ctx.font = `${FONT_PX}px ui-monospace, "SF Mono", Menlo, monospace`;
    ctx.textBaseline = "top";
    const edgeDepth = Math.max(0.03, EDGE * reach);
    for (let row = 0; row < this.rows; row++) {
      const yFrac = (row * CELL_H) / h;
      // Quick reject: rows far above any possible crest.
      if (yFrac < 1 - reach - 0.09) continue;
      for (let col = 0; col < this.cols; col++) {
        const u = (col * CELL_W) / w;
        const depth = (yFrac - crestAtU(u)) / edgeDepth;
        if (depth <= 0) continue;
        const density = depth > 1 ? 1 : depth;
        const i = row * this.cols + col;
        if (this.thresholds[i] > density) continue;
        const bright = this.brightness[i];
        const a = floodT > 0
          ? 0.1 + 0.16 * bright // over strata: quiet texture
          : bright * (0.14 + 0.6 * density) * (0.35 + 0.65 * this.charge);
        ctx.fillStyle = `rgba(254, 203, 51, ${a.toFixed(3)})`;
        ctx.fillText(this.chars[i], col * CELL_W, row * CELL_H);
      }
    }

    ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this.frame);
  }
}

let engine: GatewayEngine | null = null;

/** Create (or reuse) the engine. Client only. */
export function getGatewayEngine(): GatewayEngine {
  if (!engine) engine = new GatewayEngine();
  return engine;
}

/** The engine if a transition is live, without creating one. */
export function peekGatewayEngine(): GatewayEngine | null {
  return engine;
}
