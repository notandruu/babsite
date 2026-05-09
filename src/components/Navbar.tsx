"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Logo } from "./Logo";
import { ArrowIcon } from "./ArrowIcon";

const departments = [
  { href: "/department/consulting", label: "CONSULTING" },
  { href: "/department/education",  label: "EDUCATION" },
  { href: "/department/design",     label: "DESIGN" },
  { href: "/department/research",   label: "RESEARCH" },
];

export function Navbar() {
  const [deptOpen, setDeptOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setDeptOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="relative z-30 pt-[27px] px-[48px]">
      <div className="bg-surface border border-border-nav h-14 sm:h-16 flex items-center justify-between overflow-visible">
        <div className="flex items-center h-11 ml-4 sm:ml-5">
          <Logo />
        </div>

        {/* Nav links - centered */}
        <div className="hidden md:flex items-center justify-center gap-5 font-sans text-base tracking-[-0.8px] text-white absolute left-1/2 -translate-x-1/2">
          <Link href="/about"   className="hover:text-gold transition-colors">ABOUT</Link>
          <Link href="/work"    className="hover:text-gold transition-colors">WORK</Link>
          <Link href="/courses" className="hover:text-gold transition-colors">COURSES</Link>

          {/* Departments dropdown */}
          <div ref={ref} className="relative">
            <button
              onClick={() => setDeptOpen(o => !o)}
              className="flex items-center gap-1 hover:text-gold transition-colors"
            >
              DEPARTMENTS
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${deptOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {deptOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-surface border border-border-nav min-w-[180px] z-50">
                {departments.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setDeptOpen(false)}
                    className="block px-5 py-3 font-sans text-[12px] tracking-widest text-white/60 hover:text-white hover:text-gold hover:bg-white/[0.04] transition-colors border-b border-border-nav last:border-b-0"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Apply Now CTA */}
        <Link
          href="/apply"
          className="bg-gold h-14 sm:h-16 flex items-center gap-2 px-3 sm:px-[30px] hover:bg-yellow-400 transition-colors shrink-0"
        >
          <span className="font-sans text-xs sm:text-base tracking-[-0.8px] text-surface whitespace-nowrap">
            APPLY NOW
          </span>
          <ArrowIcon dark />
        </Link>
      </div>
    </nav>
  );
}
