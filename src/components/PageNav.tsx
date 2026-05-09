"use client"

import Link from "next/link"
import { useState } from "react"
import { Logo } from "./Logo"
import { ArrowIcon } from "./ArrowIcon"

const links = [
  { href: "/about", label: "ABOUT" },
  { href: "/work", label: "WORK" },
  { href: "/courses", label: "COURSES" },
  { href: "/blog", label: "BLOG" },
]

export function PageNav({ active }: { active?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="w-full">
      <nav className="relative z-30 pt-[27px] px-[48px]">
        <div className="bg-surface border border-border-nav h-14 sm:h-16 flex items-center justify-between overflow-hidden">
          <Link href="/" className="flex items-center h-11 ml-4 sm:ml-5">
            <Logo />
          </Link>

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
          </div>

          <div className="flex items-center h-14 sm:h-16">
            <button
              className="md:hidden text-white px-4 h-full"
              onClick={() => setMobileOpen((o) => !o)}
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
            <Link
              href="#"
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
          </nav>
        </div>
      )}
    </div>
  )
}
