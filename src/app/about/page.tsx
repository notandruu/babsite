"use client"

import { useState } from "react"
import { PageNav } from "@/components/PageNav"
import { PageFooter } from "@/components/PageFooter"
import { BlogPosts } from "@/components/BlogPosts"
import { ShowcaseGateway } from "@/components/ShowcaseGateway"

const stats = [
  { value: "10+",   label: "Startups Founded" },
  { value: "200k+", label: "edX Students" },
  { value: "40+",   label: "Consulting Projects" },
  { value: "20+",   label: "Partners Worldwide" },
]

const filters = ["All", "Education", "Consulting", "Research", "Design", "External", "Internal"]

const team = Array(6).fill({ name: "Lorem Ipsum", role: "Developer" })

const networkPartners = [
  { name: "CESC",            src: "/logos/logo-cesc.svg" },
  { name: "Dekrypt Capital", src: "/logos/logo-dekrypt.svg" },
  { name: "Evmos",           src: "/logos/logo-evmos.svg" },
  { name: "Argus Labs",      src: "/logos/logo-argus.svg" },
  { name: "Opyn",            src: "/logos/logo-opyn.svg" },
  { name: "Osmosis",         src: "/logos/logo-osmosis.svg" },
  { name: "Aleo",            src: "/logos/logo-aleo.svg" },
  { name: "SFBW",            src: "/logos/logo-sfbw.svg" },
  { name: "She256",          src: "/logos/logo-she256.svg" },
  { name: "Sommelier",       src: "/logos/logo-sommelier.svg" },
]

export default function AboutPage() {
  const [activeFilter, setActiveFilter] = useState("All")

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">
      <PageNav active="about" />

      {/* Hero */}
      <section className="relative border-b border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/about-hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#0a0a0a]" />
        <div className="relative z-10 px-[48px] py-14 lg:py-[94px] flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col gap-6 max-w-2xl">
            <h1
              className="font-serif font-light leading-[1.2] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(1.5rem, 3vw + 0.5rem, 2.375rem)" }}
            >
              We are an education, consulting, and research group.
            </h1>
            <div className="w-full border-b border-[rgba(255,255,255,0.07)]" />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {[
              { label: "View courses", href: "/courses" },
              { label: "Our work",     href: "/work" },
              { label: "Published research", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-2 font-sans text-white text-xs font-medium border-b border-white/30 pb-0.5 hover:opacity-70 transition-opacity"
              >
                {label}{" "}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-10 md:py-[52px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map(({ value, label }) => (
              <div key={value} className="shiny-card border border-[rgba(255,255,255,0.07)] p-5 sm:p-8 flex flex-col gap-1">
                <p
                  className="font-serif text-white font-light tracking-[-0.015em] leading-[1.1]"
                  style={{ fontSize: "clamp(1.375rem, 2.5vw, 1.9375rem)" }}
                >
                  {value}
                </p>
                <p className="font-sans text-white/70 text-xs sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="border-b border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-10 md:py-[52px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Mission",
                text: "Blockchain at Berkeley drives innovation in the blockchain industry by building an ecosystem that empowers students to make an impact through practical education, consulting for enterprise companies, and conducting open source research.",
              },
              {
                title: "Vision",
                text: "Our vision is to build tomorrow's technology, today. We educate and empower the next generation of Blockchain users and developers. Our members are encouraged to experiment with new ideas and build powerful tools that push the technology's limits.",
              },
            ].map(({ title, text }) => (
              <div key={title} className="shiny-card border border-[rgba(255,255,255,0.07)] p-6 sm:p-8 flex flex-col gap-4">
                <p className="font-sans text-white text-xs font-medium tracking-[0.1em] uppercase">{title}</p>
                <p className="font-sans text-white/70 text-xs sm:text-[10.5px] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Network */}
      <section className="bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-10 md:py-[47px]">
          <div className="flex flex-col items-center gap-4 text-center mb-8 md:mb-10">
            <span className="font-sans text-gold text-[7.7px] tracking-[0.15em] uppercase font-medium border border-[rgba(254,203,51,0.11)] px-3 py-1.5">
              OUR NETWORK
            </span>
            <h2
              className="font-serif text-white font-light tracking-[-0.05em]"
              style={{ fontSize: "clamp(1.25rem, 2vw + 0.5rem, 1.78125rem)" }}
            >
              Alumni
            </h2>
            <p className="font-sans text-white/70 text-xs sm:text-[12px] leading-relaxed max-w-lg">
              Our alumni network spans some of the most influential organizations in the blockchain and technology space.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {networkPartners.map(({ name, src }) => (
              <div
                key={name}
                className="shiny-card border border-[rgba(255,255,255,0.07)] flex items-center justify-center px-6 sm:px-8"
                style={{ height: 56, minWidth: 100 }}
              >
                <img
                  src={src}
                  alt={name}
                  className="max-h-6 max-w-[90px] object-contain opacity-60 brightness-0 invert"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-b border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-10 md:py-[47px]">
          <p className="font-sans text-white/40 text-[9px] tracking-[0.28em] uppercase mb-6 sm:mb-8">Team</p>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8 md:mb-10">
            <span className="font-sans text-white/40 text-[9px] tracking-[0.2em] uppercase mr-1 w-full sm:w-auto">
              Filter
            </span>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 font-sans text-[9px] tracking-[0.1em] uppercase font-medium transition-all border ${
                  activeFilter === f
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white/60 border-[rgba(255,255,255,0.2)] hover:border-white/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Team grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {team.map((member, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="shiny-card border border-[rgba(255,255,255,0.07)] aspect-square w-full" />
                <div>
                  <p className="font-sans text-white text-xs">{member.name}</p>
                  <p className="font-sans text-white/50 text-[10px]">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 font-sans text-white text-xs border border-[rgba(255,255,255,0.2)] px-5 py-2 hover:border-white/50 transition-colors">
            + Show More
          </button>
        </div>
      </section>

      <BlogPosts />
      <PageFooter />
      {/* Last element on the page on purpose: the meter completes exactly at
          the bottom of the document, so the footer stays reachable on the
          way down instead of the transition firing over it. */}
      <ShowcaseGateway />
    </div>
  )
}
