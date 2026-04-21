"use client";

import { useRef, useState } from "react";
import { HashMatrix } from "@/components/HashMatrix";
import { Logo } from "@/components/Logo";

export default function PrototypePage() {
  const scrollProgressRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sp, setSp] = useState(0);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const progress = Math.min(1, el.scrollTop / window.innerHeight);
    scrollProgressRef.current = progress;
    setSp(progress);
  };

  // Phase 1 (sp 0→0.5): camera zooms through logo, matrix fades in, text.svg stays at bottom
  // Phase 2 (sp 0.5→1): text.svg slides up to below navbar and grows
  const phase2 = Math.max(0, Math.min(1, (sp - 0.5) / 0.5));
  const easeP2 = 1 - Math.pow(1 - phase2, 3); // cubic ease-out

  // Slide from bottom-8 up to just below navbar
  const startTop = typeof window !== "undefined" ? window.innerHeight - 96 : 800; // bottom-8 + 64px img
  const endTop = 96; // just below navbar
  const svgTop = startTop + (endTop - startTop) * easeP2;

  // Grow width from auto (height-constrained) to 88% of viewport
  const svgMaxH = easeP2 > 0.5 ? "none" : "64px";
  const svgWidth = `${16 + easeP2 * 72}%`;

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Fixed full-page canvas */}
      <div className="fixed inset-0 z-0">
        <HashMatrix scrollProgressRef={scrollProgressRef} />
      </div>

      {/* Navbar */}
      <div className="fixed inset-x-0 top-0 z-30 px-[48px] pt-[27px]">
        <div className="flex items-center justify-between h-14">
          <Logo />
          <div className="hidden md:flex items-center gap-8 ml-auto">
            <a href="#" className="font-sans text-[13px] tracking-widest text-white hover:text-gold transition-colors">ABOUT</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-white hover:text-gold transition-colors">DEPARTMENTS</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-white hover:text-gold transition-colors">BLOG</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-gold hover:text-white transition-colors">APPLY →</a>
          </div>
        </div>
      </div>

      {/* text.svg — slides from bottom up to below navbar */}
      <div
        className="fixed left-0 right-0 z-10 flex justify-center pointer-events-none"
        style={{ top: `${svgTop}px` }}
      >
        <img
          src="/assets/text.svg"
          alt="Blockchain at Berkeley"
          style={{ width: svgWidth, maxHeight: svgMaxH, height: "auto" }}
        />
      </div>

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
