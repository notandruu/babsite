"use client"

import { useState } from "react"
import { PageNav } from "@/components/PageNav"
import { PageFooter } from "@/components/PageFooter"
import { BlogPosts } from "@/components/BlogPosts"

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="shiny-card border border-[rgba(255,255,255,0.07)] p-6 sm:p-8 flex flex-col gap-2">
      <p
        className="font-serif text-white font-light tracking-[-0.02em] leading-[1.1]"
        style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
      >
        {value}
      </p>
      <p className="font-sans text-white/60 text-xs sm:text-sm leading-relaxed">{label}</p>
    </div>
  )
}

function ClientLogo({ name, src }: { name: string; src?: string }) {
  return (
    <div className="shiny-card border border-[rgba(255,255,255,0.07)] flex items-center justify-center px-5 py-7">
      {src ? (
        <img
          src={src}
          alt={name}
          className="max-h-8 w-full max-w-[110px] object-contain brightness-0 invert opacity-70"
        />
      ) : (
        <span className="font-sans text-white/40 text-xs tracking-wide text-center">{name}</span>
      )}
    </div>
  )
}

export default function LandingAlternatePage() {
  const [email, setEmail] = useState("")

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">

      {/* Hero + Header */}
      <div className="relative overflow-hidden" style={{ minHeight: "clamp(380px, 50vw, 560px)" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-[#0a0a0a]/80" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(254,203,51,0.04) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-40" />

        <div className="relative z-10">
          <PageNav />
        </div>

        <div className="relative z-10 px-[48px] pt-10 sm:pt-14 pb-10 sm:pb-[52px] flex flex-col gap-4">
          <span className="font-sans text-white text-[10px] tracking-[0.28em] uppercase font-light">
            established 2016 in uc berkeley
          </span>
          <h1
            className="font-serif font-light leading-[1.1] tracking-[-0.04em] text-white max-w-2xl"
            style={{ fontSize: "clamp(1.75rem, 4vw + 0.75rem, 3.5625rem)", textShadow: "0px 2.4px 38px rgba(0,0,0,1)" }}
          >
            Berkeley's hub for blockchain innovation
          </h1>
        </div>
      </div>

      {/* Newsletter */}
      <section className="border-t border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-10 md:py-[52px] flex flex-col lg:flex-row gap-8 lg:gap-[109px] items-start">
          <div className="lg:flex-none lg:max-w-xs">
            <p className="font-sans text-white/40 text-[9px] tracking-[0.28em] uppercase font-light mb-2">
              stay up to date with events and publications
            </p>
            <h2
              className="font-serif text-white font-light leading-[1.17] tracking-[-0.05em]"
              style={{ fontSize: "clamp(1.25rem, 2vw + 0.5rem, 1.78125rem)" }}
            >
              Subscribe to our newsletter
            </h2>
          </div>
          <div className="flex-1 w-full flex flex-col gap-3">
            <p className="font-sans text-white text-[8.3px] tracking-[0.24em] uppercase font-medium">Mailing List</p>
            <div className="flex items-center border-b border-white py-1.5 gap-3">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/40 font-sans text-xs sm:text-[12px] outline-none min-w-0"
              />
              <button className="text-white hover:opacity-70 transition-opacity shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="border-t border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-10 md:py-[52px]">
          <p className="font-sans text-white/40 text-[9px] tracking-[0.28em] uppercase font-light mb-8 md:mb-10">
            What we do
          </p>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 lg:gap-16">
            {[
              { title: "Research",   desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor." },
              { title: "Education",  desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor." },
              { title: "Consulting", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor." },
            ].map((s) => (
              <div key={s.title} className="flex gap-4 flex-1">
                <div className="w-8 h-8 shrink-0 border border-[rgba(254,203,51,0.2)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L15 4.5V11.5L8 15L1 11.5V4.5L8 1Z" stroke="#FECB33" strokeWidth="1" fill="none" opacity="0.7" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <h3 className="font-sans text-white text-sm sm:text-[15px] font-light">{s.title}</h3>
                  <p className="font-sans text-white/70 text-xs sm:text-[10.5px] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Xcelerator */}
      <section className="border-t border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-14 md:py-[114px] flex flex-col lg:flex-row items-stretch gap-8 lg:gap-0">
          <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 content-start">
            <div />
            <StatCard value="60%"    label="Raised Follow-On Funding" />
            <StatCard value="$400m+" label="Follow-On Raised" />
            <StatCard value="85"     label="Companies Accelerated" />
            <StatCard value="20+"    label="Global Partners" />
          </div>
          <div className="flex-1 px-4 sm:px-6 lg:pl-[33px] lg:pr-0 flex flex-col gap-5 lg:gap-[27px] justify-center">
            <span className="font-sans text-gold text-[7.7px] tracking-[0.15em] uppercase font-medium border border-[rgba(254,203,51,0.11)] px-3 py-1.5 w-fit">
              Startups
            </span>
            <h2
              className="font-serif text-white font-light leading-[1.26] tracking-[-0.037em]"
              style={{ fontSize: "clamp(1.5rem, 3vw + 0.25rem, 2.425rem)" }}
            >
              Berkeley Blockchain Xcelerator
            </h2>
            <p className="font-sans text-white/70 text-xs sm:text-[10.5px] leading-relaxed">
              The Xcelerator is UC Berkeley's university-based blockchain accelerator founded and staffed by Blockchain
              at Berkeley as a joint venture with Berkeley's Haas School of Business and SCET of Berkeley Engineering.
              <br /><br className="hidden sm:block" />
              Since its inception in 2019, the Xcelerator has accelerated 85 companies that have raised a total of
              $450M+ in follow-on funding.
            </p>
            <button className="flex items-center gap-2.5 py-[7px] border-b border-white/30 w-fit hover:opacity-80 transition-opacity">
              <span className="font-sans text-white text-xs sm:text-[10.5px]">Learn more</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Consulting Clients */}
      <section className="border-t border-[rgba(255,255,255,0.07)]">
        <div className="px-[48px] py-10 md:py-[47px] flex flex-col gap-8 md:gap-[38px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="font-sans text-gold text-[7.7px] tracking-[0.15em] uppercase font-medium border border-[rgba(254,203,51,0.11)] px-3 py-1.5">
              consulting
            </span>
            <h2
              className="font-serif text-white font-light tracking-[-0.05em]"
              style={{ fontSize: "clamp(1.25rem, 2vw + 0.5rem, 1.78125rem)" }}
            >
              Clients
            </h2>
            <p className="font-sans text-white/70 text-xs sm:text-[12px] leading-relaxed max-w-lg">
              Blockchain at Berkeley is an award-winning blockchain consulting and development team. We believe in the
              power of blockchain applications and seek to expand understanding across industries, academia,
              governments, and beyond.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-sans text-white/40 text-[9px] tracking-[0.28em] uppercase font-light text-center">
              traditional
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { name: "Airbus",    src: "/logos/logo-airbus.svg" },
                { name: "BASF",      src: "/logos/logo-basf.svg" },
                { name: "BMW",       src: "/logos/logo-bmw.svg" },
                { name: "Ford",      src: "/logos/logo-ford.svg" },
                { name: "Microsoft", src: "/logos/logo-microsoft.svg" },
                { name: "PayPal",    src: "/logos/logo-ppcom.svg" },
                { name: "Qualcomm",  src: "/logos/logo-qualcomm.svg" },
                { name: "Samsung",   src: "/logos/logo-samsung.svg" },
                { name: "Toyota",    src: "/logos/logo-toyota.svg" },
                { name: "UNICEF",    src: "/logos/logo-unicef.svg" },
              ].map((c) => <ClientLogo key={c.name} {...c} />)}
            </div>
            <p className="font-sans text-white/40 text-[9px] tracking-[0.28em] uppercase font-light text-center mt-3">
              crypto
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { name: "Ava Labs",       src: "/logos/logo-avalabs.svg" },
                { name: "Cardano",        src: "/logos/logo-cardano.svg" },
                { name: "Dapper Labs",    src: "/logos/logo-dapperlabs.svg" },
                { name: "Dfinity",        src: "/logos/logo-dfinity.svg" },
                { name: "LayerZero",      src: "/logos/logo-layerzero.svg" },
                { name: "Morpho",         src: "/logos/logo-morpho.svg" },
                { name: "OKCoin",         src: "/logos/logo-okcoin.svg" },
                { name: "NEAR",           src: "/logos/logo-open.svg" },
                { name: "Token Terminal", src: "/logos/logo-tokenterminal.svg" },
                { name: "Celo",           src: "/logos/logo-spiral.svg" },
              ].map((c) => <ClientLogo key={c.name} {...c} />)}
            </div>
          </div>
        </div>
      </section>

      <BlogPosts />
      <PageFooter />
    </div>
  )
}
