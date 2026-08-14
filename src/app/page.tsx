"use client";

import { useRef, useState, useEffect } from "react";
import { Info, Briefcase, GraduationCap, LayoutGrid, ArrowUpRight } from "lucide-react";
import { HashMatrix } from "@/components/HashMatrix";
import { AsciiIcon } from "@/components/AsciiIcon";
import { Logo } from "@/components/Logo";

const LOGOS = [
  "div.client.svg","div.client-1.svg","div.client-2.svg","div.client-3.svg",
  "div.client-4.svg","div.client-5.svg","div.client-6.svg","div.client-7.svg",
  "div.client-8.svg","div.client-9.svg","div.client-10.svg","div.client-11.svg",
  "div.client-12.svg","div.client-13.svg","div.client-14.svg","div.client-16.svg",
  "div.client-18.svg",
];
// duplicate rows so logos never run out during scroll movement
const ROW1 = [...LOGOS, ...LOGOS];
const ROW2 = [...LOGOS.slice(9), ...LOGOS.slice(0, 9), ...LOGOS.slice(9), ...LOGOS.slice(0, 9)];

// Icon glyph palettes: luminance bands dark → bright.
// At rest the icons read white/gray on black; on hover, gold through warm white.
// Soft single-tone ramps — narrow shade ranges so the glyphs read as one
// harmonious color; the dark blob behind the icon supplies the contrast.
const ICON_PALETTE_REST  = ["#9c7c22", "#b08c2a", "#c49c32", "#d8ad3c", "#eabe48"];
const ICON_PALETTE_HOVER = ["#d9bd62", "#e3ca74", "#edd786", "#f5e29a", "#fcecae"];

// Hover backgrounds: a flowing gold field with SEVERAL pale hotspots per card
// (different geometry each), plus a separate blurred "blob" layer — an uneven
// dark mass sitting behind the icon so the glyphs emerge from shadow.
const DEPARTMENTS = [
  {
    label: "ENGINEERING",
    description: "Strategic Web3 advisory for protocols, funds, and enterprises.",
    projects: [{ name: "Ripple", year: "2025", logo: "/assets/projects/cons_ripple.png" }, { name: "Open Ledger", year: "2025", logo: "/assets/projects/cons_openledger.png" }, { name: "Canton", year: "2025", logo: "/assets/projects/cons_canton.png" }],
    icon: "/assets/icons/engineering.png",
    hoverBg: "radial-gradient(58% 42% at 16% 10%, rgba(255,249,224,0.85) 0%, rgba(255,244,200,0) 62%), radial-gradient(46% 38% at 88% 64%, rgba(255,246,210,0.65) 0%, rgba(255,244,200,0) 68%), radial-gradient(52% 40% at 55% 102%, rgba(255,240,185,0.5) 0%, rgba(255,240,185,0) 70%), linear-gradient(153deg, #E2B94E 0%, #C79B2E 32%, #E9CB5F 56%, #B8871E 79%, #D9B44C 100%)",
    blobBg: "radial-gradient(68% 62% at 49% 48%, rgba(68,47,7,0.95) 0%, rgba(96,69,12,0.58) 62%, transparent 90%), radial-gradient(54% 62% at 60% 52%, rgba(84,60,10,0.66) 0%, transparent 84%)",
    blobTilt: "rotate(-6deg) scale(1.05, 0.92)",
  },
  {
    label: "DESIGN",
    description: "Branding, product, and visual systems for crypto-native teams.",
    projects: [{ name: "BDAX", year: "2025", logo: "/assets/projects/design_bdax.png" }, { name: "Brookwell", year: "2025", logo: "/assets/projects/design_brookwell.png" }, { name: "Critiq", year: "2025", logo: "/assets/projects/design_critiq.png" }],
    icon: "/assets/icons/design.png",
    hoverBg: "radial-gradient(52% 40% at 84% 8%, rgba(255,250,228,0.85) 0%, rgba(255,246,205,0) 64%), radial-gradient(44% 36% at 8% 52%, rgba(255,246,212,0.6) 0%, rgba(255,246,212,0) 66%), radial-gradient(50% 42% at 70% 98%, rgba(255,238,180,0.45) 0%, transparent 70%), linear-gradient(205deg, #E5C158 0%, #BE8E22 36%, #EDD37B 62%, #C79B2E 84%, #D9AE3C 100%)",
    blobBg: "radial-gradient(66% 64% at 51% 47%, rgba(67,47,7,0.95) 0%, rgba(95,68,12,0.58) 64%, transparent 90%), radial-gradient(52% 60% at 42% 52%, rgba(83,59,10,0.66) 0%, transparent 82%)",
    blobTilt: "rotate(5deg) scale(0.96, 1.04)",
  },
  {
    label: "RESEARCH",
    description: "Original research on protocols, markets, and infrastructure.",
    projects: [{ name: "Mantle", year: "2025", logo: "/assets/projects/research_mantle.png" }, { name: "Research Lab", year: "2025", logo: "/assets/projects/research_research.png" }, { name: "Sandbox", year: "2025", logo: "/assets/projects/research_sandbox.png" }],
    icon: "/assets/icons/research.png",
    hoverBg: "radial-gradient(50% 44% at 12% 88%, rgba(255,250,226,0.8) 0%, rgba(255,246,206,0) 62%), radial-gradient(46% 36% at 58% 4%, rgba(255,247,215,0.65) 0%, rgba(255,247,215,0) 66%), radial-gradient(40% 34% at 96% 40%, rgba(255,240,188,0.5) 0%, transparent 68%), linear-gradient(27deg, #B8871E 0%, #E7C765 34%, #C1922A 57%, #EDD48A 81%, #C79B2E 100%)",
    blobBg: "radial-gradient(70% 60% at 50% 48%, rgba(65,46,7,0.95) 0%, rgba(93,67,12,0.58) 60%, transparent 89%), radial-gradient(56% 64% at 57% 44%, rgba(81,58,9,0.63) 0%, transparent 84%)",
    blobTilt: "rotate(4deg) scale(1.08, 0.9)",
  },
  {
    label: "EDUCATION",
    description: "Decals, workshops, and curriculum bringing students into Web3.",
    projects: [{ name: "Luma", year: "2025", logo: "/assets/projects/edu_luma.png" }, { name: "Succinct", year: "2025", logo: "/assets/projects/edu_succinct.png" }, { name: "Paradigm", year: "2025", logo: "/assets/projects/edu_paradigm.png" }],
    icon: "/assets/icons/education.png",
    hoverBg: "radial-gradient(54% 42% at 10% 6%, rgba(255,250,226,0.8) 0%, rgba(255,246,206,0) 60%), radial-gradient(48% 38% at 90% 92%, rgba(255,247,212,0.7) 0%, rgba(255,247,212,0) 66%), radial-gradient(42% 34% at 92% 24%, rgba(255,241,190,0.45) 0%, transparent 66%), radial-gradient(128% 104% at 30% 100%, #DBB244 0%, #C1922A 38%, #E9CB5F 68%, #A87A16 100%)",
    blobBg: "radial-gradient(67% 63% at 50% 47%, rgba(67,47,7,0.95) 0%, rgba(95,68,12,0.58) 62%, transparent 90%), radial-gradient(53% 61% at 55% 51%, rgba(84,60,10,0.66) 0%, transparent 83%)",
    blobTilt: "rotate(-4deg) scale(0.94, 1.06)",
  },
];

// Rotating stats for the clients section's typing cells.
const STAT_POOL = [
  { value: "50+",  label: "Clients Served" },
  { value: "$2B+", label: "Assets Advised" },
  { value: "12+",  label: "Industries" },
  { value: "4",    label: "Continents" },
];
const HEX_CHARS = "0123456789abcdef";

// Fractal-noise grain, tiled and blended over the card gradients.
const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function PrototypePage() {
  const scrollProgressRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const snapResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deptNavRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [deptNavOpen, setDeptNavOpen] = useState(false);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (deptNavRef.current && !deptNavRef.current.contains(e.target as Node)) {
        setDeptNavOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [s3Entered, setS3Entered] = useState(false);
  const [sDeptEntered, setSDeptEntered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  // Scrolling: native, with gentle "proximity" snap (mandatory snap was what
  // yanked the page around). Wheel events over fixed overlay layers (e.g. the
  // department cards) never reach the scroll container, so forward those
  // manually — with snap paused while the wheel drives, then restored so the
  // page can still settle onto a section.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.contains(e.target as Node)) return; // native scroll handles it
      el.style.scrollSnapType = "none";
      el.scrollTop += e.deltaY;
      if (snapResetTimer.current) clearTimeout(snapResetTimer.current);
      snapResetTimer.current = setTimeout(() => {
        el.style.scrollSnapType = "y proximity";
      }, 180);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const fadeUp = (delay: number, up = 16) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0px)" : `translateY(${up}px)`,
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  // sp goes 0→4 across 4 sections (section 4 is 200vh)
  const [sp, setSp] = useState(0);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const progress = el.scrollTop / window.innerHeight;
    scrollProgressRef.current = Math.min(1, progress);  // morph uses 0–1
    setSp(progress);
    if (progress > 1.85) setS3Entered(true);
    else if (progress < 1.7) setS3Entered(false);
    if (progress > 3.85) setSDeptEntered(true);
    else if (progress < 3.7) setSDeptEntered(false);
  };

  const ss = (x: number) => x * x * (3 - 2 * x); // smoothstep

  // About section — fades in 0.65→1.0, fades out 1.5→2.0
  const s2in  = ss(Math.min(1, Math.max(0, (sp - 0.65) / 0.35)));
  const s2out = ss(Math.min(1, Math.max(0, (sp - 1.5)  / 0.5)));
  const s2 = s2in * (1 - s2out);

  // Clients section — fades in 1.5→2.0, fades out 3.7→4.0
  const s3Raw = Math.min(1, Math.max(0, (sp - 1.5) / 0.5));
  const s3out = ss(Math.min(1, Math.max(0, (sp - 3.7) / 0.3)));
  const s3 = ss(s3Raw) * (1 - s3out);

  // Marquee scroll progress within clients section (sp 2→4, full 200vh)
  const s3p = Math.min(1, Math.max(0, (sp - 2) / 2));

  // Departments section — fades in 3.7→4.0
  const sDept = ss(Math.min(1, Math.max(0, (sp - 3.7) / 0.3)));

  // Footer — fades in 4.7→5.0 while departments fade out
  const sFoot = ss(Math.min(1, Math.max(0, (sp - 4.7) / 0.3)));
  const sDeptVis = sDept * (1 - sFoot);

  // Dark overlay — reaches 1.0 to fully bury the campanile
  const overlayOp = ss(Math.min(1, Math.max(0, (sp - 1.05) / 0.5))); // 1.05→1.55

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0a]">

      {/* Left rail — the one vertical line shared by every section */}
      <div className="fixed inset-0 z-[3] pointer-events-none" style={fadeUp(0, 0)}>
        <div className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={{ left: "4.56%" }} />
      </div>

      {/* Hash matrix canvas */}
      <div className="fixed inset-0 z-[1]" style={{ ...fadeUp(200, 0), opacity: ready ? Math.max(0, 1 - Math.max(0, sp - 1.1) / 0.55) : 0 }}>
        <HashMatrix scrollProgressRef={scrollProgressRef} />
      </div>

      {/* Background overlay — darkens canvas as campanile section fades */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none bg-[#0a0a0a]"
        style={{ opacity: overlayOp }}
      />

      {/* Side nav rail — icons in the gutter left of the rail line */}
      <div
        className="fixed top-0 bottom-0 left-0 z-30 flex flex-col items-center"
        style={{
          width: "4.56%",
          paddingTop: 22,
          paddingBottom: 26,
          transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0ms",
          opacity: ready ? 1 : 0,
          transform: ready ? "translateX(0px)" : "translateX(-12px)",
        }}
      >
        <a href="/" aria-label="Home"><Logo /></a>
        <nav className="flex-1 flex flex-col items-center justify-center gap-7">
          {[
            { href: "/about",   label: "ABOUT",   Icon: Info },
            { href: "/work",    label: "WORK",    Icon: Briefcase },
            { href: "/courses", label: "COURSES", Icon: GraduationCap },
          ].map(({ href, label, Icon }) => (
            <a key={label} href={href} className="group relative flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200">
              <Icon size={18} strokeWidth={1.5} />
              <span className="absolute left-full ml-4 px-2 py-1 font-sans text-[10px] tracking-widest whitespace-nowrap text-white/80 bg-[#0c0c0c] border border-[rgba(255,255,255,0.07)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {label}
              </span>
            </a>
          ))}
          {/* Departments flyout */}
          <div className="relative flex items-center justify-center" ref={deptNavRef}>
            <button
              onClick={() => setDeptNavOpen(o => !o)}
              aria-label="Departments"
              className={`group relative flex items-center justify-center transition-colors duration-200 ${deptNavOpen ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              <LayoutGrid size={18} strokeWidth={1.5} />
              {!deptNavOpen && (
                <span className="absolute left-full ml-4 px-2 py-1 font-sans text-[10px] tracking-widest whitespace-nowrap text-white/80 bg-[#0c0c0c] border border-[rgba(255,255,255,0.07)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  DEPARTMENTS
                </span>
              )}
            </button>
            {deptNavOpen && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-[#0c0c0c] border border-[rgba(255,255,255,0.07)] min-w-[180px] z-50">
                {[
                  { href: "/department/consulting", label: "CONSULTING" },
                  { href: "/department/education",  label: "EDUCATION" },
                  { href: "/department/design",     label: "DESIGN" },
                  { href: "/department/research",   label: "RESEARCH" },
                ].map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setDeptNavOpen(false)}
                    className="block px-5 py-3 font-sans text-[12px] tracking-widest text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors border-b border-[rgba(255,255,255,0.07)] last:border-b-0"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
        <a href="/apply" aria-label="Apply" className="group relative flex items-center justify-center text-[#FECB33] hover:text-white transition-colors duration-200">
          <ArrowUpRight size={20} strokeWidth={1.5} />
          <span className="absolute left-full ml-4 px-2 py-1 font-sans text-[10px] tracking-widest whitespace-nowrap text-[#FECB33] bg-[#0c0c0c] border border-[rgba(255,255,255,0.07)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            APPLY
          </span>
        </a>
      </div>

      {/* Hero structural lines — fixed in place, fade out on scroll (translating a
          full-height line up with the text reads as a glitch) */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{ opacity: ready ? Math.max(0, 1 - sp / 0.45) : 0, transition: "opacity 0.3s ease-out" }}
      >
        {/* Section vertical line — closes off the text column */}
        <div className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={{ left: "43.39%" }} />

        {/* Horizontal rules bracketing the title */}
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "48.3%", left: "4.56%", width: "38.83%" }} />
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "80.35%", left: "4.56%", width: "38.83%" }} />

        {/* 01 marker */}
        <div className="absolute" style={{ top: "46.9%", left: "4.56%" }}>
          <div style={{ position: "absolute", width: 6, height: 6, background: "linear-gradient(135deg, #E4BD41 6.25%, #9F7715 93.75%)" }} />
          <div style={{ position: "absolute", left: 6, top: 6, width: 6, height: 6, background: "linear-gradient(0deg, rgba(255,255,255,0.3), rgba(255,255,255,0.3)), linear-gradient(135deg, #E4BD41 6.25%, #9F7715 93.75%)" }} />
          <p style={{ position: "absolute", left: 18, top: 0, fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, lineHeight: "0.81", letterSpacing: "-0.36px", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>01</p>
        </div>
      </div>

      {/* Hero content — scrolls up and out */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          transform: `translateY(${-sp * 110}vh)`,
          transformOrigin: "center top",
          willChange: "transform",
        }}
      >
        {/* Title */}
        <div className="absolute" style={{ left: "7.74%", top: "53.9%" }}>
          <p style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500, fontSize: "6.33vw", lineHeight: 0.81, letterSpacing: "-0.03em", color: "#fff", ...fadeUp(300) }}>
            Blockchain
          </p>
          <p style={{ fontFamily: "var(--font-eb-garamond), serif", fontWeight: 500, fontSize: "7.81vw", lineHeight: 0.81, letterSpacing: "-0.0244em", color: "#fff", marginTop: "0.6vw", ...fadeUp(400) }}>
            at Berkeley
          </p>
        </div>

        {/* Subtitle — below the lower rule */}
        <p
          className="absolute text-white"
          style={{
            left: "7.74%",
            top: "84.1%",
            width: "31.68%",
            fontFamily: "'Instrument Sans', sans-serif",
            fontSize: "clamp(16px, 1.52vw, 26px)",
            lineHeight: 1.4,
            letterSpacing: "-0.03em",
            ...fadeUp(500),
          }}
        >
          We're a student-run organization at UC Berkeley focused on blockchain innovation via consulting, education, design, and research.
        </p>
      </div>

      {/* Section 2 — about + stats */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{ opacity: s2, transform: `translateY(${(1 - Math.min(1, s2)) * 32}px)`, transition: "none" }}
      >
        {/* Section vertical lines */}
        <div className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={{ left: "25.6%" }} />
        <div className="absolute bottom-0 w-px bg-white/[0.07]" style={{ left: "74.4%", top: "22.34%" }} />
        <div className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={{ left: "95.44%" }} />

        {/* Full-width rule under the header row */}
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "22.34%", left: "4.56%", width: "90.88%" }} />

        {/* 02 marker — sits on the rule */}
        <div className="absolute" style={{ top: "20.94%", left: "4.56%" }}>
          <div style={{ position: "absolute", left: 6, top: 0, width: 6, height: 6, background: "linear-gradient(0deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2)), linear-gradient(135deg, #A43E04 6.25%, #522306 93.75%)" }} />
          <div style={{ position: "absolute", left: 0, top: 6, width: 6, height: 6, background: "linear-gradient(135deg, #E4BD41 6.25%, #9F7715 93.75%)" }} />
          <p style={{ position: "absolute", left: 18, top: 0, fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, lineHeight: "0.81", letterSpacing: "-0.36px", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>02</p>
        </div>

        {/* Header row — big serif About + intro paragraph */}
        <p
          className="absolute text-white"
          style={{ left: "7.21%", top: "6.67%", fontFamily: "var(--font-eb-garamond), serif", fontWeight: 500, fontSize: "6.35vw", lineHeight: 0.81, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}
        >
          About
        </p>
        <p
          className="absolute text-white"
          style={{ left: "28.97%", top: "5.61%", width: "64.15%", fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(16px, 1.52vw, 26px)", lineHeight: 1.4, letterSpacing: "-0.03em" }}
        >
          We're Blockchain at Berkeley, the campus's blockchain engineering, research, and education group. Our members have shipped for Samsung and Arbitrum, modeled consensus attacks for Ripple, and built the course PayPal ran as internal training. We're looking for the next thing to build.
        </p>

        {/* Left stat column */}
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "54.85%", left: "4.56%", width: "21.03%" }} />
        <p className="absolute" style={{ left: "6.15%", top: "59.53%", fontFamily: "var(--font-eb-garamond), serif", fontSize: "3.7vw", lineHeight: 0.81, letterSpacing: "-0.03em", color: "#e7b93c", whiteSpace: "nowrap" }}>$10M</p>
        <p className="absolute" style={{ left: "6.15%", top: "67.6%", width: "17.86%", fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(12px, 1.06vw, 18px)", lineHeight: 1.4, letterSpacing: "-0.32px", color: "#f9edce" }}>
          Cumulatively raised for their startups by our last batch of student members
        </p>
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "77.43%", left: "4.56%", width: "21.03%" }} />
        <p className="absolute" style={{ left: "6.15%", top: "82.1%", fontFamily: "var(--font-eb-garamond), serif", fontSize: "3.7vw", lineHeight: 0.81, letterSpacing: "-0.03em", color: "#e7b93c", whiteSpace: "nowrap" }}>200k+</p>
        <p className="absolute" style={{ left: "6.15%", top: "90.18%", width: "17.86%", fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(12px, 1.06vw, 18px)", lineHeight: 1.4, letterSpacing: "-0.32px", color: "#f9edce" }}>
          Learners reached by our curriculum, later PayPal's internal training
        </p>

        {/* Right stat column */}
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "49.7%", left: "74.4%", width: "21.03%" }} />
        <p className="absolute" style={{ left: "75.99%", top: "54.39%", fontFamily: "var(--font-eb-garamond), serif", fontSize: "3.7vw", lineHeight: 0.81, letterSpacing: "-0.03em", color: "#e7b93c", whiteSpace: "nowrap" }}>Billions</p>
        <p className="absolute" style={{ left: "75.99%", top: "62.46%", width: "18%", fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(12px, 1.06vw, 18px)", lineHeight: 1.4, letterSpacing: "-0.32px", color: "#f9edce" }}>
          On-chain value moved by protocols our alumni founded — Aleo, Osmosis, and EVMOS
        </p>
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "74.85%", left: "74.4%", width: "21.03%" }} />
        <p className="absolute" style={{ left: "75.99%", top: "79.53%", fontFamily: "var(--font-eb-garamond), serif", fontSize: "3.7vw", lineHeight: 0.81, letterSpacing: "-0.03em", color: "#e7b93c", whiteSpace: "nowrap" }}>Since 2016</p>
        <p className="absolute" style={{ left: "75.99%", top: "87.6%", width: "18%", fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(12px, 1.06vw, 18px)", lineHeight: 1.4, letterSpacing: "-0.32px", color: "#f9edce" }}>
          Shipping production blockchain work with industry partners for nearly a decade
        </p>
      </div>

      {/* Section 3 — Departments header */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{ opacity: sDeptVis, transform: `translateY(${(1 - sDept) * 32}px)`, transition: "none" }}
      >
        {/* Right rail line */}
        <div className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={{ left: "95.44%" }} />

        {/* Bottom band — rule, marker, title, divider, paragraph */}
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "77.78%", left: "4.56%", width: "90.88%" }} />
        <div className="absolute bottom-0 w-px bg-white/[0.07]" style={{ left: "41.93%", top: "77.78%" }} />

        {/* 04 marker */}
        <div className="absolute" style={{ top: "77.9%", left: "4.56%" }}>
          <div style={{ position: "absolute", left: 6, top: 0, width: 6, height: 6, background: "linear-gradient(0deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2)), linear-gradient(135deg, #A43E04 6.25%, #522306 93.75%)" }} />
          <div style={{ position: "absolute", left: 0, top: 6, width: 6, height: 6, background: "linear-gradient(135deg, #E4BD41 6.25%, #9F7715 93.75%)" }} />
          <div style={{ position: "absolute", left: 6, top: 6, width: 6, height: 6, background: "linear-gradient(0deg, rgba(255,255,255,0.3), rgba(255,255,255,0.3)), linear-gradient(135deg, #E4BD41 6.25%, #9F7715 93.75%)" }} />
          <p style={{ position: "absolute", left: 20, top: 4, fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, lineHeight: "0.81", letterSpacing: "-0.36px", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>04</p>
        </div>

        <p
          className="absolute text-white"
          style={{
            left: "7.74%", top: "83.4%",
            fontFamily: "var(--font-eb-garamond), serif", fontWeight: 500, fontSize: "6.35vw", lineHeight: 0.81, letterSpacing: "-0.03em", whiteSpace: "nowrap",
            opacity: sDeptEntered ? 1 : 0,
            transform: sDeptEntered ? "translateY(0px)" : "translateY(12px)",
            transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0ms",
          }}
        >
          Departments
        </p>
        <p
          className="absolute text-white"
          style={{
            left: "45.1%", top: "83.27%", width: "47.2%",
            fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(16px, 1.52vw, 26px)", lineHeight: 1.4, letterSpacing: "-0.03em",
            opacity: sDeptEntered ? 1 : 0,
            transform: sDeptEntered ? "translateY(0px)" : "translateY(12px)",
            transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 100ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 100ms",
          }}
        >
          Each department brings specialized expertise — from on-chain consulting and prototype research to design systems and student-led education.
        </p>
      </div>

      {/* Department cards grid — separate layer so hover events work */}
      <div
        className="fixed pointer-events-auto"
        style={{
          left: "4.56%",
          right: "4.56%",
          top: "24.33%",
          height: "53.57%",
          zIndex: 25,
          opacity: sDeptVis,
          transform: `translateY(${(1 - sDept) * 32}px)`,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          pointerEvents: sDeptVis > 0.5 ? "auto" : "none",
        }}
      >
        {DEPARTMENTS.map((d, i) => {
          const delay = 200 + i * 110;
          return (
            <div
              key={d.label}
              style={{
                height: "100%",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                borderLeft: "none",
                opacity: sDeptEntered ? 1 : 0,
                transform: sDeptEntered ? "translateY(0px)" : "translateY(20px)",
                transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
              }}
            >
              <DepartmentCard label={d.label} description={d.description} projects={d.projects} icon={d.icon} hoverBg={d.hoverBg} blobBg={d.blobBg} blobTilt={d.blobTilt} />
            </div>
          );
        })}
      </div>

      {/* Section 4 — Our Clients grid + marquee */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none"
        style={{ opacity: s3, transform: `translateY(${(1 - s3) * 14}px)`, transition: "none" }}
      >
        {/* Structural lines */}
        <div className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={{ left: "95.44%" }} />
        <div className="absolute w-px bg-white/[0.07]" style={{ left: "41.93%", top: "13.57%", height: "43.39%" }} />
        {["13.57%", "56.96%", "71.7%", "86.43%"].map((top) => (
          <div key={top} className="absolute h-px bg-white/[0.07]" style={{ top, left: "4.56%", width: "90.88%" }} />
        ))}
        <div className="absolute h-px bg-white/[0.07]" style={{ top: "34.5%", left: "4.56%", width: "37.37%" }} />

        {/* 03 marker */}
        <div className="absolute" style={{ top: "13.68%", left: "4.56%" }}>
          <div style={{ position: "absolute", width: 6, height: 6, background: "linear-gradient(135deg, #E4BD41 6.25%, #9F7715 93.75%)" }} />
          <div style={{ position: "absolute", left: 6, top: 0, width: 6, height: 6, background: "linear-gradient(0deg, rgba(255,255,255,0.3), rgba(255,255,255,0.3)), linear-gradient(135deg, #E4BD41 6.25%, #9F7715 93.75%)" }} />
          <div style={{ position: "absolute", left: 0, top: 6, width: 6, height: 6, background: "linear-gradient(0deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2)), linear-gradient(135deg, #A43E04 6.25%, #522306 93.75%)" }} />
          <p style={{ position: "absolute", left: 20, top: 4, fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, lineHeight: "0.81", letterSpacing: "-0.36px", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>03</p>
        </div>

        {/* Title + paragraph */}
        <p
          className="absolute text-white"
          style={{
            left: "7.74%", top: "19.77%",
            fontFamily: "var(--font-eb-garamond), serif", fontWeight: 500, fontSize: "6.35vw", lineHeight: 0.81, letterSpacing: "-0.03em", whiteSpace: "nowrap",
            opacity: s3Entered ? 1 : 0,
            transform: s3Entered ? "translateY(0px)" : "translateY(12px)",
            transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0ms",
          }}
        >
          Our Clients
        </p>
        <p
          className="absolute text-white"
          style={{
            left: "7.74%", top: "40.12%", width: "31%",
            fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(16px, 1.52vw, 26px)", lineHeight: 1.4, letterSpacing: "-0.03em",
            opacity: s3Entered ? 1 : 0,
            transform: s3Entered ? "translateY(0px)" : "translateY(12px)",
            transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 80ms",
          }}
        >
          From Fortune 500 companies to leading Web3 protocols, we've partnered with organizations shaping the future of finance and technology.
        </p>

        {/* Stat board — one hash grid spanning all four boxes edge to edge */}
        <div
          className="absolute"
          style={{
            left: "41.93%", top: "13.57%", width: "53.51%", height: "43.39%",
            opacity: s3Entered ? 1 : 0,
            transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 160ms",
          }}
        >
          <HashStatBoard pool={STAT_POOL} active={s3Entered} />
        </div>

        {/* Marquee rows — inside the bottom two bands of the grid */}
        <div className="absolute" style={{ top: "56.96%", left: "4.56%", width: "90.88%", height: "14.74%", overflow: "hidden" }}>
          <div style={{ display: "flex", height: "100%", transform: `translateX(calc(-${s3p * 40}vw))`, transition: "none", willChange: "transform" }}>
            {ROW1.map((file, i) => (
              <div key={i} style={{
                width: "22.75vw", height: "100%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRight: "1px solid rgba(255,255,255,0.07)",
              }}>
                <img src={`/assets/clients/${file}`} alt="" style={{ width: "56%", height: "auto", objectFit: "contain", opacity: 0.65 }} />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute" style={{ top: "71.7%", left: "4.56%", width: "90.88%", height: "14.73%", overflow: "hidden" }}>
          <div style={{ display: "flex", height: "100%", transform: `translateX(calc(-${(1 - s3p) * 40}vw))`, transition: "none", willChange: "transform" }}>
            {ROW2.map((file, i) => (
              <div key={i} style={{
                width: "22.75vw", height: "100%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRight: "1px solid rgba(255,255,255,0.07)",
              }}>
                <img src={`/assets/clients/${file}`} alt="" style={{ width: "56%", height: "auto", objectFit: "contain", opacity: 0.65 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6 — footer */}
      <div
        className="fixed inset-0 z-10"
        style={{
          opacity: sFoot,
          transform: `translateY(${(1 - sFoot) * 24}px)`,
          transition: "none",
          pointerEvents: sFoot > 0.5 ? "auto" : "none",
        }}
      >
        {/* Right rail */}
        <div className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={{ left: "95.44%" }} />

        {/* Hash art band — abstract drifting world map in the section-3 grid style */}
        <div style={{ position: "absolute", left: "4.56%", top: 0, width: "90.88%", height: "50.06%" }}>
          <FooterHash />
        </div>

        {/* Link boxes — one container, shared internal dividers */}
        <div
          className="absolute"
          style={{
            left: "4.56%", width: "90.88%", top: "50.06%", height: "26.2%",
            border: "1px solid rgba(42,42,42,0.65)",
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          {[
            {
              label: "SECTIONS",
              cols: [
                [{ name: "Home", href: "/" }, { name: "About", href: "/about" }, { name: "Apply", href: "/apply" }],
                [{ name: "Departments", href: "/department/consulting" }, { name: "Case Studies", href: "/work" }],
              ],
            },
            { label: "CONTACT", cols: [[{ name: "Home", href: "/" }, { name: "About", href: "/about" }, { name: "Apply", href: "/apply" }]] },
            { label: "TERMS",   cols: [[{ name: "Home", href: "/" }, { name: "About", href: "/about" }, { name: "Apply", href: "/apply" }]] },
          ].map(({ label, cols }, bi) => (
            <div key={label} style={{ position: "relative", borderRight: bi < 2 ? "1px solid rgba(42,42,42,0.65)" : "none" }}>
              <p style={{ position: "absolute", left: 32, top: 32, fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, lineHeight: "0.81", letterSpacing: "-0.36px", color: "rgba(255,255,255,0.5)" }}>
                {label}
              </p>
              {cols.map((links, ci) => (
                <div key={ci} style={{ position: "absolute", left: ci === 0 ? 32 : 154, top: 74 }}>
                  {links.map(({ name, href }) => (
                    <a
                      key={name}
                      href={href}
                      className="block text-white hover:text-[#e7b93c] transition-colors duration-200"
                      style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 16, lineHeight: 1.4, letterSpacing: "-0.48px", marginBottom: 24 }}
                    >
                      {name}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* The big line */}
        <p
          className="absolute text-white"
          style={{
            left: "7.54%", top: "82.2%",
            fontFamily: "var(--font-eb-garamond), serif", fontWeight: 500,
            fontSize: "9.47vw", lineHeight: 0.81, letterSpacing: "-0.03em", whiteSpace: "nowrap",
          }}
        >
          The Future Is On Chain
        </p>
      </div>

      {/* Snap scroll container — 6 sections (clients spans 2 × h-screen for an intermediate stop) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="fixed inset-0 z-20 overflow-y-scroll pointer-events-none"
        style={{ scrollSnapType: "y proximity", scrollbarWidth: "none" }}
      >
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
      </div>
    </div>
  );
}

/**
 * The stat board: ONE continuous hash grid spanning the whole merged stat
 * panel. One stat at a time engrains across the FULL area — grid cells inside
 * the giant glyphs (number + label) light up gold, swept left-to-right with a
 * hex-flickering edge — holds, wipes, then types the next stat. An arrow
 * pointer rides the typing edge and parks bottom-right while idle.
 */
function HashStatBoard({ pool, active }: { pool: { value: string; label: string }[]; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const W = parent.clientWidth || 810;
    const H = parent.clientHeight || 370;
    const dpr = 2;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const FONT = 6.8;
    const cols = Math.floor(W / 5.2), rows = Math.floor(H / 7.2);
    // stretch cells so the grid fills the panel exactly edge to edge
    const CW = W / cols, CH = H / rows;
    const grid: string[] = Array.from({ length: cols * rows }, () => HEX_CHARS[(Math.random() * 16) | 0]);

    // Rasterize value + label into a full-board mask.
    const maskFor = (value: string, label: string) => {
      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.clearRect(0, 0, cols, rows);
      o.fillStyle = "#fff";
      o.textBaseline = "alphabetic";
      // Model the section's own type: serif number (EB Garamond), sans label.
      const gara = getComputedStyle(document.documentElement).getPropertyValue("--font-eb-garamond").trim() || "serif";
      const numPx = Math.floor(rows * 0.58);
      o.font = `500 ${numPx}px ${gara}, serif`;
      const tw = o.measureText(value).width;
      const nScale = Math.min(1.6, (cols * 0.84) / tw);
      o.setTransform(nScale, 0, 0, 1, cols * 0.05, 0);
      o.fillText(value, 0, rows * 0.56);
      o.setTransform(1, 0, 0, 1, 0, 0);
      const lblPx = Math.max(8, Math.floor(rows * 0.24));
      o.font = `500 ${lblPx}px 'Instrument Sans', sans-serif`;
      const lw = o.measureText(label).width;
      const lScale = Math.min(1.4, (cols * 0.86) / lw);
      o.setTransform(lScale, 0, 0, 1, cols * 0.05, 0);
      o.fillText(label, 0, rows * 0.92);
      o.setTransform(1, 0, 0, 1, 0, 0);
      const d = o.getImageData(0, 0, cols, rows).data;
      const m = new Uint8Array(cols * rows);
      let maxC = 0;
      for (let i = 0; i < cols * rows; i++) {
        if (d[i * 4 + 3] > 80) { m[i] = 1; const c = i % cols; if (c > maxC) maxC = c; }
      }
      return { m, maxC };
    };

    let idx = 0;
    let sweep = 0;
    let phase: "type" | "hold" | "wipe" = "type";
    let holdUntil = 0;
    let wipeX = 0;
    let cur = maskFor(pool[idx].value, pool[idx].label.toUpperCase());

    let raf = 0, last = 0;
    const TICK = 55;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < TICK) return;
      last = now;

      for (let j = 0; j < Math.max(1, (cols * rows * 0.01) | 0); j++) {
        grid[(Math.random() * cols * rows) | 0] = HEX_CHARS[(Math.random() * 16) | 0];
      }

      if (activeRef.current) {
        if (phase === "type") {
          sweep += 3.2;
          if (sweep > cur.maxC + 3) { phase = "hold"; holdUntil = now + 2600; }
        } else if (phase === "hold") {
          if (now > holdUntil) { phase = "wipe"; wipeX = 0; }
        } else {
          wipeX += cols * 0.1;
          if (wipeX > cols + 4) {
            idx = (idx + 1) % pool.length;
            cur = maskFor(pool[idx].value, pool[idx].label.toUpperCase());
            phase = "type"; sweep = 0;
          }
        }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.font = `${FONT}px "Courier New", monospace`;
      ctx.textBaseline = "top";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const gi = r * cols + c;
          let lit = cur.m[gi] === 1 && (phase !== "type" || c <= sweep);
          const edge = lit && phase === "type" && c > sweep - 3;
          if (phase === "wipe" && c < wipeX) lit = false;
          if (lit) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = edge ? "#fff3c2" : "#e7b93c";
            ctx.fillText(edge ? HEX_CHARS[(Math.random() * 16) | 0] : grid[gi], c * CW, r * CH);
          } else {
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = "#9a9a9a";
            ctx.fillText(grid[gi], c * CW, r * CH);
          }
        }
      }
      ctx.globalAlpha = 1;

    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [pool]);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
}

/**
 * Footer hash band: the section-3 grid treatment rendering an abstract,
 * slowly drifting world map — dim gold "landmasses" from layered value noise
 * over a faint gray "ocean" whose brightness ripples like slow water.
 */
function FooterHash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const W = parent.clientWidth || 1254;
    const H = parent.clientHeight || 428;
    const dpr = 2;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const cols = Math.floor(W / 5.2), rows = Math.floor(H / 7.2);
    const CW = W / cols, CH = H / rows;
    const grid: string[] = Array.from({ length: cols * rows }, () => HEX_CHARS[(Math.random() * 16) | 0]);

    const hash2 = (x: number, y: number) => {
      const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    };
    const smooth = (a: number) => a * a * (3 - 2 * a);
    const vnoise = (x: number, y: number) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = smooth(x - xi), yf = smooth(y - yi);
      const a = hash2(xi, yi), b = hash2(xi + 1, yi), c2 = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
      return a + (b - a) * xf + (c2 - a) * yf + (a - b - c2 + d) * xf * yf;
    };
    const fbm = (x: number, y: number) =>
      0.55 * vnoise(x, y) + 0.28 * vnoise(x * 2.1, y * 2.1) + 0.17 * vnoise(x * 4.3, y * 4.3);

    let raf = 0, last = 0;
    const TICK = 110;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < TICK) return;
      last = now;
      const t = now / 1000;

      for (let j = 0; j < Math.max(1, (cols * rows * 0.008) | 0); j++) {
        grid[(Math.random() * cols * rows) | 0] = HEX_CHARS[(Math.random() * 16) | 0];
      }

      ctx.clearRect(0, 0, W, H);
      ctx.font = `6.8px "Courier New", monospace`;
      ctx.textBaseline = "top";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // continents drift very slowly; the ocean flow moves faster
          const land = fbm(c * 0.028 + t * 0.008, r * 0.052);
          const flow = fbm(c * 0.06 + t * 0.14, r * 0.11 - t * 0.05);
          if (land > 0.56) {
            const shore = Math.min(1, (land - 0.56) / 0.08);
            ctx.globalAlpha = 0.28 + shore * 0.3 + flow * 0.12;
            ctx.fillStyle = "#b8952c";
          } else {
            ctx.globalAlpha = 0.05 + flow * 0.09;
            ctx.fillStyle = "#9a9a9a";
          }
          ctx.fillText(grid[r * cols + c], c * CW, r * CH);
        }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
}

function DepartmentCard({ label, description, projects, icon, hoverBg, blobBg, blobTilt }: { label: string; description: string; projects: { name: string; year: string }[]; icon: string; hoverBg: string; blobBg: string; blobTilt: string }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", height: "100%", cursor: "pointer" }}
    >
      {/* Project list — stacks above the card on hover */}
      <div
        style={{
          position: "absolute",
          bottom: "100%",
          left: 0,
          right: 0,
          zIndex: 5,
          opacity: hover ? 1 : 0,
          transform: hover ? "translateY(0px)" : "translateY(10px)",
          transition: "opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: "none",
        }}
      >
        {projects.map(({ name, year }) => (
          <div
            key={name}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              height: 47, padding: "0 18px",
              background: "#fff", borderBottom: "1px solid #e5e5e5",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, background: "#111", borderRadius: 999 }} />
              <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 14, color: "#111", letterSpacing: "-0.01em" }}>{name}</span>
            </div>
            <span style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 11, color: "rgba(17,17,17,0.45)" }}>{year}</span>
          </div>
        ))}
      </div>

      {/* Card face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          transition: "background 0.35s ease",
        }}
      >
        {/* Flowing gold field — hover only; rest state is plain black */}
        <div style={{ position: "absolute", inset: 0, background: hoverBg, opacity: hover ? 1 : 0, transition: "opacity 0.5s ease" }} />
        {/* Grain — heavy over the gradient, absent at rest */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: GRAIN_URL,
            opacity: hover ? 0.65 : 0,
            mixBlendMode: "overlay",
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
          }}
        />
        {/* Uneven dark blob behind the icon — blurred so it melts into the field,
            with its own grain masked to the blob's shape */}
        <div
          style={{
            position: "absolute", left: "2%", right: "2%", top: "9%", bottom: "15%",
            transform: blobTilt,
            opacity: hover ? 1 : 0,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: blobBg, filter: "blur(18px)" }} />
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: GRAIN_URL,
              maskImage: blobBg,
              WebkitMaskImage: blobBg,
              mixBlendMode: "overlay",
              opacity: 0.75,
            }}
          />
        </div>
        <p
          style={{
            position: "relative", left: "9.3%", top: "7%", width: "fit-content",
            fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(11px, 1.06vw, 17px)", letterSpacing: "0.2em",
            color: hover ? "#231a02" : "#f9edce",
            transition: "color 0.35s ease",
          }}
        >
          {label}
        </p>
        <AsciiIcon
          src={icon}
          palette={hover ? ICON_PALETTE_HOVER : ICON_PALETTE_REST}
          active={hover}
          style={{ position: "absolute", left: "50%", top: "47%", transform: "translate(-50%, -50%)", width: "74%" }}
        />
        <p
          style={{
            position: "absolute", left: "9.3%", bottom: "10.5%", width: "81.4%",
            fontFamily: "'Instrument Sans', sans-serif", fontSize: "clamp(11px, 1.06vw, 17px)", lineHeight: 1.4, letterSpacing: "-0.32px",
            color: hover ? "rgba(35,26,2,0.85)" : "#ffffff",
            transition: "color 0.35s ease",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
