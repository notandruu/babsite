"use client"

import { useState } from "react"
import { PageNav } from "@/components/PageNav"
import { PageFooter } from "@/components/PageFooter"

const filters = ["All", "Design", "Research", "Engineering", "Traditional Clients", "Crypto Clients"]

const projects = [
  { company: "Cardano",                project: "Lorem Ipsum", services: "Product Design, Smart Contract", category: "Fintech",     year: "2021", logoSrc: "/logos/logo-cardano.svg" },
  { company: "Helium",                 project: "Lorem Ipsum", services: "Research, Engineering",          category: "IoT",         year: "2022", logoSrc: "/logos/logo-helium.svg" },
  { company: "Transparent Healthcare", project: "Lorem Ipsum", services: "Consulting, Design",             category: "Healthcare",  year: "2022", logoSrc: "/logos/logo-transparent.svg" },
  { company: "Lorem Ipsum",            project: "Lorem Ipsum", services: "Lorem Ipsum",                   category: "Lorem Ipsum", year: "2021", logoSrc: null },
  { company: "Lorem Ipsum",            project: "Lorem Ipsum", services: "Lorem Ipsum",                   category: "Lorem Ipsum", year: "2022", logoSrc: null },
]

export default function WorkPage() {
  const [activeFilter, setActiveFilter] = useState("All")

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">
      <PageNav active="work" />

      {/* Page header + filter */}
      <section className="border-b border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px]">
          <div className="border-b border-[rgba(255,255,255,0.07)] py-5 sm:py-6">
            <h1
              className="font-serif text-white font-light tracking-[-0.03em]"
              style={{ fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.375rem)" }}
            >
              Work
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="font-sans text-white/40 text-[9px] tracking-[0.2em] uppercase mr-1">Filter</span>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 font-sans text-[9px] tracking-[0.08em] uppercase font-medium transition-all border ${
                  activeFilter === f
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white/60 border-[rgba(255,255,255,0.2)] hover:border-white/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects table */}
      <section className="border-b border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px]">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 560 }}>
              {/* Table header */}
              <div className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] gap-4 py-3 border-b border-[rgba(255,255,255,0.07)]">
                {["Company", "Project", "Services", "Category", "Year"].map((col) => (
                  <p key={col} className="font-sans text-white/40 text-[9px] tracking-[0.2em] uppercase font-medium">
                    {col}
                  </p>
                ))}
              </div>

              {/* Rows */}
              {projects.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] gap-4 py-4 border-b border-[rgba(255,255,255,0.07)] group cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 shrink-0 bg-white/5 border border-[rgba(255,255,255,0.07)] flex items-center justify-center overflow-hidden">
                      {p.logoSrc ? (
                        <img
                          src={p.logoSrc}
                          alt={p.company}
                          className="w-5 h-5 object-contain brightness-0 invert opacity-70"
                        />
                      ) : (
                        <span className="font-sans text-white/30 text-[8px] font-medium">?</span>
                      )}
                    </div>
                    <span className="font-sans text-white text-[13px] truncate">{p.company}</span>
                  </div>
                  <span className="font-sans text-white/70 text-[13px] self-center truncate">{p.project}</span>
                  <span className="font-sans text-white/70 text-[13px] self-center truncate">{p.services}</span>
                  <span className="font-sans text-white/70 text-[13px] self-center">{p.category}</span>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-white/70 text-[13px]">{p.year}</span>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      className="text-white/20 group-hover:text-white/60 transition-colors shrink-0"
                    >
                      <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client showcase */}
      <section className="border-b border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-10 md:py-[52px]">
          <p className="font-sans text-white/40 text-[9px] tracking-[0.28em] uppercase mb-6 sm:mb-8">Clients</p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-3 flex flex-col gap-3">
              <div className="shiny-card border border-[rgba(255,255,255,0.07)] aspect-[3/2]" />
              <div>
                <p className="font-sans text-white text-sm">Lorem ipsum</p>
                <p className="font-sans text-white/50 text-xs">Lorem ipsum</p>
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-3">
              <div className="shiny-card border border-[rgba(255,255,255,0.07)] aspect-[4/3]" />
              <div>
                <p className="font-sans text-white text-sm">Lorem ipsum</p>
                <p className="font-sans text-white/50 text-xs">Lorem ipsum</p>
              </div>
            </div>

            <div className="sm:col-span-5 flex flex-col gap-3">
              <div className="shiny-card border border-[rgba(255,255,255,0.07)] aspect-[21/9]" />
              <div>
                <p className="font-sans text-white text-sm">Helium</p>
                <p className="font-sans text-white/50 text-xs">Transparent Healthcare</p>
              </div>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-3">
              <div className="shiny-card border border-[rgba(255,255,255,0.07)] aspect-[3/4]" />
              <div>
                <p className="font-sans text-white text-sm">Lorem Ipsum</p>
                <p className="font-sans text-white/50 text-xs">Lorem ipsum</p>
              </div>
            </div>
            <div className="sm:col-span-3 flex flex-col gap-3">
              <div className="shiny-card border border-[rgba(255,255,255,0.07)] aspect-[2/3]" />
              <div>
                <p className="font-sans text-white text-sm">Lorem ipsum</p>
                <p className="font-sans text-white/50 text-xs">Lorem ipsum</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  )
}
