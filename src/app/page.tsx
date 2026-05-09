"use client";

import { useRef, useState, useEffect } from "react";
import { HashMatrix } from "@/components/HashMatrix";
import { Logo } from "@/components/Logo";

export default function PrototypePage() {
  const scrollProgressRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  const fadeUp = (delay: number, up = 16) => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0px)" : `translateY(${up}px)`,
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  const [sp, setSp] = useState(0);

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
    const progress = Math.min(1, el.scrollTop / window.innerHeight);
    scrollProgressRef.current = progress;
    setSp(progress);
    setScrolled(el.scrollTop > 20);
    if (progress > 0.8 && !countStartedRef.current) {
      countStartedRef.current = true;
      startCountUp();
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0a]">

      {/* Vertical grid lines */}
      <div className="fixed inset-0 z-[3] pointer-events-none" style={fadeUp(0, 0)}>
        {[
          { left: "48px" },
          { left: "calc(25% + 12px)" },
          { left: "50%" },
          { left: "calc(75% - 12px)" },
          { right: "48px" },
        ].map((style, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-white/[0.07]" style={style} />
        ))}
      </div>

      {/* Hash matrix canvas */}
      <div className="fixed inset-0 z-[1]" style={fadeUp(200, 0)}>
        <HashMatrix scrollProgressRef={scrollProgressRef} />
      </div>

      {/* Navbar */}
      <div
        className="fixed inset-x-0 top-0 z-30 px-[48px]"
        style={{
          paddingTop: scrolled ? "14px" : "26px",
          paddingBottom: scrolled ? "14px" : "0px",
          background: scrolled ? "rgba(10,10,10,0.8)" : "rgba(10,10,10,0)",
          backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "blur(0px)",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "blur(0px)",
          borderBottom: "1px solid rgba(255,255,255,0)",
          borderBottomColor: scrolled ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0)",
          transition: [
            "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0ms",
            "transform 0.7s cubic-bezier(0.16,1,0.3,1) 0ms",
            "background 0.4s ease",
            "backdrop-filter 0.4s ease",
            "-webkit-backdrop-filter 0.4s ease",
            "border-color 0.4s ease",
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

      {/* Hero content — scroll zooms entire block off the top of screen */}
      <div
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          transform: `translateY(${-sp * 70}vh)`,
          transformOrigin: "center top",
          willChange: "transform",
        }}
      >
        {/* text.svg + description + buttons in one flow column */}
        <div className="absolute pointer-events-none" style={{ top: 116, left: 48, width: "calc(50% - 48px)" }}>
          <img src="/assets/text.svg" alt="Blockchain at Berkeley" style={{ width: "100%", height: "auto", ...fadeUp(300) }} />
          <p className="mt-4 text-white text-2xl leading-snug" style={{ fontFamily: "'Instrument Sans', sans-serif", letterSpacing: "-0.03em", ...fadeUp(450) }}>
            We're a student-run organization at UC Berkeley focused on blockchain innovation via consulting, education, design, and research.
          </p>
          {/* Buttons stacked, between line 1 and line 2 — container border matches grid lines */}
          <div className="flex flex-col mt-6 pointer-events-auto" style={{ width: "calc(25vw - 36px)", border: "1px solid rgba(255,255,255,0.07)", ...fadeUp(600) }}>
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
        const s2 = Math.max(0, (sp - 0.65) / 0.35);
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

            {/* CLIENT GRID — saved for next section
            {(() => {
              const all = [
                "div.client.svg","div.client-1.svg","div.client-2.svg","div.client-3.svg",
                "div.client-4.svg","div.client-5.svg","div.client-6.svg","div.client-7.svg",
                "div.client-8.svg","div.client-9.svg",
                "div.client-10.svg","div.client-11.svg","div.client-12.svg","div.client-13.svg",
                "div.client-14.svg","div.client-15.svg","div.client-16.svg","div.client-17.svg",
                "div.client-18.svg","div.client-19.svg",
              ];
              const cellSize = "calc((50vw - 48px) / 4)";
              return (
                <div className="absolute" style={{ top:0, left:"50%", right:48, display:"grid", gridTemplateColumns:`repeat(4,${cellSize})`, gridTemplateRows:`repeat(5,${cellSize})`, borderLeft:"1px solid rgba(255,255,255,0.07)", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                  {all.map((file, i) => (
                    <div key={i} style={{ borderRight:"1px solid rgba(255,255,255,0.07)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
                      <img src={`/assets/clients/${file}`} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", opacity:0.65 }} />
                    </div>
                  ))}
                </div>
              );
            })()} */}

            {/* Stats — columns sized exactly to each bg line gap, no inner padding */}
            {/* Lines: 48px | 25vw+12px | 50vw | 75vw-12px | 100vw-48px             */}
            {/* Gaps:  25vw-36px | 25vw-12px | 25vw-12px | 25vw-36px                */}
            <div
              className="absolute"
              style={{
                bottom: 120,
                left: 48,
                width: "calc(50% - 48px)",
                display: "grid",
                gridTemplateColumns: "calc(25vw - 36px) 1fr",
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
      </div>
    </div>
  );
}
