"use client"

import Link from "next/link"
import { useState } from "react"

export function PageFooter() {
  const [email, setEmail] = useState("")

  return (
    <footer className="border-t border-border-nav">
      <div className="px-[48px] py-12 flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-8">
          <div className="flex flex-col sm:flex-row gap-10">
            <div className="flex flex-col gap-3">
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/40">BAB</p>
              <div className="flex flex-col gap-2">
                {["Work", "Courses", "About", "Blog"].map((l) => (
                  <Link
                    key={l}
                    href={`/${l.toLowerCase()}`}
                    className="font-sans text-sm text-white hover:opacity-70 transition-opacity"
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/40">Community</p>
              <div className="flex flex-col gap-2">
                {["Blockchain Xcelerator", "Berkeley EECS", "Berkeley RDI"].map((l) => (
                  <Link key={l} href="#" className="font-sans text-sm text-white hover:opacity-70 transition-opacity">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/40">Follow</p>
            <div className="flex flex-col gap-2">
              {["Instagram", "Twitter", "Facebook", "Youtube", "Mirror"].map((l) => (
                <Link key={l} href="#" className="font-sans text-sm text-white hover:opacity-70 transition-opacity">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border-nav pt-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <p className="font-sans text-white/40 text-xs">
            © {new Date().getFullYear()} Blockchain at Berkeley. All rights reserved.
          </p>
          <div className="flex items-center border-b border-white/20 py-1.5 gap-3 w-full lg:max-w-xs">
            <p className="font-sans text-white/40 text-[8px] tracking-[0.2em] uppercase whitespace-nowrap">
              Mailing List
            </p>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/30 text-xs outline-none min-w-0 font-sans"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white/50 shrink-0">
              <path
                d="M5 12h14m-7-7 7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}
