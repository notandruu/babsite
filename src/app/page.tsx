"use client";

import { useRef, useState, useEffect } from "react";
import { HashMatrix } from "@/components/HashMatrix";
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

export default function PrototypePage() {
  const scrollProgressRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);
  const [s3Entered, setS3Entered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  const fadeUp = (delay: number, up = 16) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0px)" : `translateY(${up}px)`,
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  // sp goes 0→3 across 4 sections
  const [sp, setSp] = useState(0);
  const [spFull, setSpFull] = useState(0);

  const STATS = [
    { prefix: "",  target: 300, suffix: "+",  label: "Members" },
    { prefix: "$", target: 2,   suffix: "B+", label: "Assets Advised" },
    { prefix: "",  target: 8,   suffix: "",   label: "Years Active" },
    { prefix: "",  target: 50,  suffix: "+",  label: "Projects" },
  ];
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const countStartedRef = useRef(false);

  function startCountUp() {
    const duration = 1400;
    const start = Date.now();
    const targets = STATS.map(s => s.target);
    function tick() {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCounts(targets.map(t => Math.round(t * eased)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const full = el.scrollTop / window.innerHeight;
    const progress = Math.min(1, full);
    scrollProgressRef.current = progress;
    setSp(progress);
    setSpFull(full);
    setScrolled(el.scrollTop > 20);
    const progress = el.scrollTop / window.innerHeight; // 0–3 across 4 sections
    scrollProgressRef.current = Math.min(1, progress);  // morph uses 0–1
    setSp(progress);
    setScrolled(progress > 0.08);
    if (progress > 1.25) setS3Entered(true);
    else if (progress < 1.0) setS3Entered(false);
    if (progress > 0.8 && !countStartedRef.current) {
      countStartedRef.current = true;
      startCountUp();
    }
  };

  const ss = (x: number) => x * x * (3 - 2 * x); // smoothstep

  // Section fade values
  const s2in  = ss(Math.min(1, Math.max(0, (sp - 0.65) / 0.35)));  // in  0.65→1.0
  const s2out = ss(Math.min(1, Math.max(0, (sp - 1.0)  / 0.5)));   // out 1.0→1.5
  const s2 = s2in * (1 - s2out);

  const s3Raw = Math.min(1, Math.max(0, (sp - 1.2) / 0.5));        // in  1.2→1.7
  const s3 = ss(s3Raw);

  // logo row scroll progress within section 3 (sp 2→3)
  const s3p = Math.min(1, Math.max(0, sp - 2));

  // dark overlay — reaches 1.0 to fully bury the campanile
  const overlayOp = ss(Math.min(1, Math.max(0, (sp - 1.05) / 0.5))); // 1.05→1.55

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0a]">

      {/* Vertical grid lines */}
      <div className="fixed inset-0 z-[3] pointer-events-none" style={fadeUp(0, 0)}>
        {[
          { left: "48px" },
          { left: "calc(25% + 24px)" },
          { left: "50%" },
          { left: "calc(75% - 24px)" },
          { right: "48px" },
        ].map((style, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={style} />
        ))}
      </div>

      {/* Hash matrix canvas — fades out when leaving section 2 into the departments section */}
      {(() => {
        const hashFade = 1 - Math.min(1, Math.max(0, (spFull - 1.4) / 0.4));
        const baseFade = fadeUp(200, 0);
        return (
          <div
            className="fixed inset-0 z-[1]"
            style={{ ...baseFade, opacity: (baseFade.opacity ?? 1) * hashFade }}
          >
            <HashMatrix scrollProgressRef={scrollProgressRef} />
          </div>
        );
      })()}

      {/* Section 3 background overlay — darkens canvas as clients section appears */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none bg-[#0a0a0a]"
        style={{ opacity: overlayOp }}
      />

      {/* Navbar */}
      <div
        className="fixed inset-x-0 top-0 z-30 px-[48px]"
        style={{
          paddingTop: scrolled ? "14px" : "26px",
          paddingBottom: scrolled ? "14px" : "0px",
          background: `rgba(10,10,10,${Math.min(0.8, sp * 5) * 0.8})`,
          backdropFilter: sp > 0.02 ? `blur(${Math.min(1, sp * 5) * 16}px) saturate(${100 + Math.min(1, sp * 5) * 80}%)` : "none",
          WebkitBackdropFilter: sp > 0.02 ? `blur(${Math.min(1, sp * 5) * 16}px) saturate(${100 + Math.min(1, sp * 5) * 80}%)` : "none",
          borderBottom: "1px solid rgba(255,255,255,0)",
          borderBottomColor: `rgba(255,255,255,${Math.min(1, sp * 5) * 0.07})`,
          transition: [
            "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0ms",
            "transform 0.7s cubic-bezier(0.16,1,0.3,1) 0ms",
            "padding 0.4s cubic-bezier(0.16,1,0.3,1)",
          ].join(", "),
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0px)" : "translateY(-12px)",
        }}
      >
        <div className="flex items-center justify-between h-14">
          <Logo />
          <div className="hidden md:flex items-center gap-8 ml-auto">
            <a href="#" className="font-sans text-[13px] tracking-widest text-white/80 hover:text-white transition-colors duration-200">ABOUT</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-white/80 hover:text-white transition-colors duration-200">DEPARTMENTS</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-white/80 hover:text-white transition-colors duration-200">BLOG</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-[#FECB33] hover:text-white transition-colors duration-200">APPLY →</a>
          </div>
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
        <div className="absolute pointer-events-none" style={{ top: 116, left: 48, width: "calc(50% - 48px)" }}>
          <img src="/assets/text.svg" alt="Blockchain at Berkeley" style={{ width: "100%", height: "auto", ...fadeUp(300) }} />
          <p className="mt-4 text-white text-2xl leading-snug" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "-0.03em", ...fadeUp(450) }}>
            We're a student-run organization at UC Berkeley focused on blockchain innovation via consulting, education, design, and research.
          </p>
          <div className="flex flex-col mt-6 pointer-events-auto" style={{ width: "calc(25vw - 24px)", border: "1px solid rgba(255,255,255,0.07)", ...fadeUp(600) }}>
            <a href="#" className="flex items-center justify-between px-5 py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "-0.01em" }}>
              <span>Apply to Join</span><span>→</span>
            </a>
            <a href="#" className="flex items-center justify-between px-5 py-4 text-white/70 text-sm hover:text-white transition-colors" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "-0.01em", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <span>Learn More</span><span>→</span>
            </a>
          </div>
        </div>
      </div>


      {/* Second section content — fades in as scroll reaches section 2 */}
      {(() => {
        const s3 = Math.min(1, Math.max(0, (spFull - 1.5) / 0.4));
        const s2 = Math.min(1, Math.max(0, (sp - 0.65) / 0.35)) * (1 - s3);
        return (
          <div
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              opacity: s2,
              transform: `translateY(${(1 - s2) * 32}px)`,
              transition: "none",
            }}
          >
            {/* Description — left column */}
            <div className="absolute" style={{ top: 200, left: 48, width: "calc(50% - 48px)" }}>
              <p className="text-white/40 text-[11px] tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                About
          </p>
          <p className="text-white text-3xl leading-snug" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "-0.03em", maxWidth: "520px" }}>
            The largest blockchain organization in academia, building the next generation of Web3 leaders through education, consulting, and cutting-edge research.
          </p>
        </div>
        <div
          className="absolute"
          style={{
            bottom: 120, left: 48,
            width: "calc(50% - 48px)",
            display: "grid",
            gridTemplateColumns: "calc(25vw - 24px) 1fr",
            rowGap: 40,
          }}
        >
          {STATS.map(({ prefix, suffix, label }, i) => (
            <div key={i} className="flex flex-col">
              <p className="text-white text-5xl font-light mb-1" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "-0.04em" }}>
                {prefix}{counts[i]}{suffix}
              </p>
              <p className="text-white/40 text-[11px] tracking-[0.15em] uppercase" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — clients marquee */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none flex flex-col justify-center"
        style={{ opacity: s3, transform: `translateY(${(1 - s3) * 14}px)`, transition: "none", gap: 56 }}
      >
        {/* Header */}
        <div style={{ paddingLeft: 48, width: "50%" }}>
          <p
            className="text-white/40 text-[11px] tracking-[0.2em] uppercase mb-3"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              opacity: s3Entered ? 1 : 0,
              transform: s3Entered ? "translateY(0px)" : "translateY(10px)",
              transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0ms",
            }}
          >
            Clients
          </p>
          <p
            className="text-white text-3xl font-light"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              letterSpacing: "-0.03em",
              opacity: s3Entered ? 1 : 0,
              transform: s3Entered ? "translateY(0px)" : "translateY(12px)",
              transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 80ms",
            }}
          >
            Trusted by industry leaders across the globe.
          </p>
          <p
            className="text-white/65 text-base mt-3"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1.55,
              opacity: s3Entered ? 1 : 0,
              transform: s3Entered ? "translateY(0px)" : "translateY(12px)",
              transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 160ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 160ms",
            }}
          >
            From Fortune 500 companies to leading Web3 protocols, we've partnered with organizations shaping the future of finance and technology.
          </p>
        </div>

        {/* Marquee rows */}
        <div>
          {/* Row 1 — moves left as you scroll */}
          <div style={{ overflow: "hidden", margin: "0 49px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", transform: `translateX(calc(-${s3p * 40}vw))`, transition: "none", willChange: "transform" }}>
              {ROW1.map((file, i) => (
                <div key={i} style={{
                  width: "calc(25vw - 24px)", height: 160, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRight: "1px solid rgba(255,255,255,0.07)",
                  background: "#0a0a0a",
                }}>
                  <img src={`/assets/clients/${file}`} alt="" style={{ width: "66%", height: "auto", objectFit: "contain", opacity: 0.65 }} />
                </div>
              ))}
            </div>
          </div>
          {/* Row 2 — moves right as you scroll (starts offset) */}
          <div style={{ overflow: "hidden", margin: "0 49px", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", transform: `translateX(calc(-${(1 - s3p) * 40}vw))`, transition: "none", willChange: "transform" }}>
              {ROW2.map((file, i) => (
                <div key={i} style={{
                  width: "calc(25vw - 24px)", height: 160, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRight: "1px solid rgba(255,255,255,0.07)",
                  background: "#0a0a0a",
                }}>
                  <img src={`/assets/clients/${file}`} alt="" style={{ width: "66%", height: "auto", objectFit: "contain", opacity: 0.65 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Third section — Departments */}
      {(() => {
        const s3 = Math.min(1, Math.max(0, (spFull - 1.5) / 0.4));
        const departments = [
          { label: "Consulting",  description: "Strategic Web3 advisory for protocols, funds, and enterprises.", color: "#D6B048", sticker: "/solidity-sticker.png" },
          { label: "Design",      description: "Branding, product, and visual systems for crypto-native teams.",  color: "#DCB748", frontImage: "/brookwell.png", middleImage: "/bdax.png", backImage: "/simplifi.png", sticker: "/figma-sticker.png" },
          { label: "Education",   description: "Decals, workshops, and curriculum bringing students into Web3.",  color: "#DCB748", sticker: "/x-sticker.png" },
          { label: "Research",    description: "Original research on protocols, markets, and infrastructure.",    color: "#DCB748", sticker: "/hyperliquid-sticker.png" },
        ];
        return (
          <div
            className="fixed inset-0 z-10 pointer-events-none"
            style={{
              opacity: s3,
              transform: `translateY(${(1 - s3) * 32}px)`,
              transition: "none",
            }}
          >
            {/* Section label */}
            <div className="absolute" style={{ top: 116, left: 48, right: 48 }}>
              <p className="text-white/40 text-[11px] tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                Departments
              </p>
              <p className="text-white text-3xl leading-snug" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "-0.03em", maxWidth: 520 }}>
                Four teams working at the intersection of blockchain, design, education, and research.
              </p>
            </div>

          </div>
        );
      })()}

      {/* Cards grid — separate fixed layer at higher z so hover events reach the cards.
          Wheel forwards to the snap scroll container so scrolling past works. */}
      {(() => {
        const s3 = Math.min(1, Math.max(0, (spFull - 1.5) / 0.4));
        const departments = [
          { label: "Consulting",  description: "Strategic Web3 advisory for protocols, funds, and enterprises.", color: "#D6B048", sticker: "/solidity-sticker.png" },
          { label: "Design",      description: "Branding, product, and visual systems for crypto-native teams.",  color: "#DCB748", frontImage: "/brookwell.png", middleImage: "/bdax.png", backImage: "/simplifi.png", sticker: "/figma-sticker.png" },
          { label: "Education",   description: "Decals, workshops, and curriculum bringing students into Web3.",  color: "#DCB748", sticker: "/x-sticker.png" },
          { label: "Research",    description: "Original research on protocols, markets, and infrastructure.",    color: "#DCB748", sticker: "/hyperliquid-sticker.png" },
        ];
        return (
          <div
            className="fixed pointer-events-auto"
            onWheel={(e) => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop += e.deltaY;
              }
            }}
            style={{
              left: 48,
              right: 48,
              bottom: 64,
              top: "34vh",
              zIndex: 25,
              opacity: s3,
              transform: `translateY(${(1 - s3) * 32}px)`,
              display: "grid",
              gridTemplateColumns: "calc(25vw - 36px) calc(25vw - 12px) calc(25vw - 12px) calc(25vw - 36px)",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              pointerEvents: s3 > 0.5 ? "auto" : "none",
            }}
          >
            {departments.map((d) => (
              <DepartmentCard key={d.label} label={d.label} description={d.description} color={d.color} frontImage={d.frontImage} middleImage={d.middleImage} backImage={d.backImage} sticker={d.sticker} />
            ))}
          </div>
        );
      })()}

      {/* Snap scroll container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="fixed inset-0 z-20 overflow-y-scroll pointer-events-none"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
      >
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
        <section className="h-screen pointer-events-auto" style={{ scrollSnapAlign: "start" }} />
      </div>
    </div>
  );
}

function DepartmentCard({ label, description, color, frontImage, middleImage, backImage, sticker }: { label: string; description: string; color: string; frontImage?: string; middleImage?: string; backImage?: string; sticker?: string }) {
  const paperImages: (string | undefined)[] = [backImage, middleImage, frontImage];
  // Solid grays, lightest in the back, darkest in the front.
  const folderFill = color;
  // All papers tilt in the same (counter-clockwise) direction; back is the
  // tallest and least tilted, front sits lowest and is rotated the most.
  const papers = [
    { fill: "#dcdcdc", rot:  -3, dx:   8, dy: -22, z: 1 }, // back  — lightest, least tilt
    { fill: "#a8a8a8", rot:  -9, dx:   0, dy:   0, z: 2 }, // middle
    { fill: "#7a7a7a", rot: -15, dx:  -5, dy:  22, z: 3 }, // front — darkest, most tilt
  ];

  // Stagger amounts: lift on card hover, plus extra lift/rotation when the
  // matching hover-zone for that paper is active. Each paper also rotates a
  // touch in a different direction for a subtle fan-out feel.
  const lift = [5, 8, 11];          // px upward, by index (back, middle, front)
  const hoverRot = [2, -1.5, 2.5];  // deg, alternating directions
  const delay = [0, 60, 120];     // ms cascade delay

  const [cardHover, setCardHover] = useState(false);
  const [paperHover, setPaperHover] = useState<number | null>(null);
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);

  return (
    <div
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => {
        setCardHover(false);
        setPaperHover(null);
        setPressedIdx(null);
        setClickedIdx(null);
      }}
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 0 0 24%",
      }}
    >
      {/* Three equal-height hover zones above the folder — each picks the
          back / middle / front paper for the focused lift. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 280, // height of the folder front below
          display: "grid",
          gridTemplateRows: "repeat(3, 1fr)",
          zIndex: 10,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            onMouseEnter={() => setPaperHover(i)}
            onMouseDown={() => setPressedIdx(i)}
            onMouseUp={() => {
              if (pressedIdx === i) setClickedIdx((prev) => (prev === i ? null : i));
              setPressedIdx(null);
            }}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>

      {/* Papers — 3 solid sheets stacked, rotated, sticking up out of the folder */}
      <div
        style={{
          position: "relative",
          width: "84%",
          height: 200,
          marginLeft: "auto",
          marginRight: "auto",
          marginBottom: -110,
          zIndex: 1,
        }}
      >
        {papers.map((p, i) => {
          const isFocused = paperHover === i;
          const isClicked = clickedIdx === i;
          const isPressed = pressedIdx === i;
          const isOtherFocused = paperHover !== null && !isFocused;
          const isOtherClicked = clickedIdx !== null && !isClicked;
          const ty =
            (cardHover ? lift[i] : 0) +
            (isFocused ? 36 : 0) +
            (isClicked ? 130 : 0) +
            (isOtherFocused ? -6 : 0) +
            (isOtherClicked ? -10 : 0);
          const rot = (cardHover ? hoverRot[i] : 0) + (isFocused ? hoverRot[i] * 0.6 : 0);
          const scale = isClicked ? 1 : isPressed ? 0.96 : 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: p.z,
                transform: `translateY(${-ty}px) rotate(${rot}deg) scale(${scale})`,
                transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: `${cardHover ? delay[i] : 0}ms`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `translate(${p.dx}px, ${p.dy}px) rotate(${p.rot}deg)`,
                  background: paperImages[i] ? `url(${paperImages[i]}) center/cover no-repeat ${p.fill}` : p.fill,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Sticker — small decorative badge on the folder, rotated slightly */}
      {sticker && (
        <img
          src={sticker}
          alt=""
          style={{
            position: "absolute",
            right: 18,
            bottom: 86,
            width: 64,
            height: "auto",
            transform: "rotate(-12deg)",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Folder front — solid, with a tab notch on the upper-left edge */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 280,
          background: `linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 28%, rgba(0,0,0,0.10) 100%), ${folderFill}`,
          boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.18)",
          clipPath: "polygon(0% 8%, 54% 8%, 60% 0%, 100% 0%, 100% 100%, 0% 100%)",
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            bottom: 22,
            color: "#111",
          }}
        >
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 22,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontSize: 12.5,
              lineHeight: 1.45,
              color: "rgba(17,17,17,0.62)",
              letterSpacing: "-0.01em",
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
