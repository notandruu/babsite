"use client";

import { useEffect, useState } from "react";

export function GridBackground() {
  const [heroBottom, setHeroBottom] = useState(845);

  useEffect(() => {
    const update = () => {
      const heroEl = document.querySelector("[data-hero]");
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setHeroBottom(rect.bottom + window.scrollY);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Diagonal lines — ONLY within the hero zone (top → hero bottom) */}
      <svg
        className="absolute top-0 left-0 w-full opacity-[0.08]"
        style={{ height: heroBottom }}
        preserveAspectRatio="none"
        viewBox={`0 0 1440 ${Math.round(heroBottom)}`}
      >
        {Array.from({ length: 20 }, (_, i) => {
          const x = -400 + i * 170;
          const h = Math.round(heroBottom);
          return (
            <line
              key={`d${i}`}
              x1={x}
              y1={0}
              x2={x + Math.round(h * 0.6)}
              y2={h}
              stroke="#fecb33"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>

      {/* 5 vertical lines: at 48px from each edge, 3 evenly between */}
      <div
        className="absolute top-0 h-full w-px bg-[#fecb33] opacity-[0.06]"
        style={{ left: "48px" }}
      />
      <div
        className="absolute top-0 h-full w-px bg-[#fecb33] opacity-[0.06]"
        style={{ left: "calc(25% + 12px)" }}
      />
      <div
        className="absolute top-0 h-full w-px bg-[#fecb33] opacity-[0.06]"
        style={{ left: "50%" }}
      />
      <div
        className="absolute top-0 h-full w-px bg-[#fecb33] opacity-[0.06]"
        style={{ left: "calc(75% - 12px)" }}
      />
      <div
        className="absolute top-0 h-full w-px bg-[#fecb33] opacity-[0.06]"
        style={{ right: "48px" }}
      />
    </div>
  );
}
