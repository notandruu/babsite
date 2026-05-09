"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Logo } from "./Logo"
import { ArrowIcon } from "./ArrowIcon"

const departments = [
  { href: "/department/consulting",  label: "Consulting" },
  { href: "/department/education",   label: "Education" },
  { href: "/department/design",      label: "Design" },
  { href: "/department/research",    label: "Research" },
]

const links = [
  { href: "/about",   label: "ABOUT" },
  { href: "/work",    label: "WORK" },
  { href: "/courses", label: "COURSES" },
]

export function PageNav({ active }: { active?: string }) {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [deptOpen,   setDeptOpen]     = useState(false)
  const [mobileDept, setMobileDept]   = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDeptOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const isDeptActive = departments.some(d => d.href === `/${active}`) ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/department"))

  return (
    <div className="w-full">
      <nav className="relative z-30 pt-[27px] px-[48px]">
        <div className="bg-surface border border-border-nav h-14 sm:h-16 flex items-center justify-between overflow-visible">
          <Link href="/" className="flex items-center h-11 ml-4 sm:ml-5">
            <Logo />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center justify-center gap-6 font-sans text-[13px] tracking-widest text-white absolute left-1/2 -translate-x-1/2">
            {links.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={`transition-colors duration-200 ${
                  active === label.toLowerCase() ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Departments dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDeptOpen(o => !o)}
                className={`flex items-center gap-1 transition-colors duration-200 ${
                  isDeptActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                DEPARTMENTS
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  className={`transition-transform duration-200 ${deptOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {deptOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-surface border border-border-nav min-w-[180px] z-50">
                  {departments.map(({ href, label }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setDeptOpen(false)}
                      className="block px-5 py-3 font-sans text-[12px] tracking-widest text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors border-b border-border-nav last:border-b-0"
                    >
                      {label.toUpperCase()}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center h-14 sm:h-16">
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white px-4 h-full"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                {mobileOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </button>

            {/* Apply Now CTA */}
            <Link
              href="/apply"
              className="bg-gold h-full flex items-center gap-2 px-3 sm:px-[30px] hover:bg-yellow-400 transition-colors shrink-0"
            >
              <span className="font-sans text-xs sm:text-sm tracking-[-0.8px] text-surface whitespace-nowrap">
                APPLY NOW
              </span>
              <ArrowIcon dark />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden mx-[48px] border border-t-0 border-border-nav bg-surface">
          <nav className="flex flex-col">
            {links.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-5 py-4 border-b border-border-nav font-sans text-[13px] tracking-widest transition-colors ${
                  active === label.toLowerCase() ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Mobile departments accordion */}
            <button
              onClick={() => setMobileDept(o => !o)}
              className="flex items-center justify-between px-5 py-4 border-b border-border-nav font-sans text-[13px] tracking-widest text-white/60 hover:text-white transition-colors"
            >
              DEPARTMENTS
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-200 ${mobileDept ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {mobileDept && departments.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={() => { setMobileOpen(false); setMobileDept(false) }}
                className="px-8 py-3 border-b border-border-nav font-sans text-[12px] tracking-widest text-white/50 hover:text-white transition-colors"
              >
                {label.toUpperCase()}
              </Link>
            ))}

            <Link
              href="/apply"
              onClick={() => setMobileOpen(false)}
              className="px-5 py-4 font-sans text-[13px] tracking-widest text-gold hover:text-white transition-colors"
            >
              APPLY NOW →
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
