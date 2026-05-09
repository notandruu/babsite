"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PageNav } from "@/components/PageNav"
import { SectionHeading, InfoBlock, PillButton, DotGrid, PlaceholderCard, PortfolioBanner, TabButtons, FeatureCard } from "@/components/design-system"
import { FooterSection } from "@/components/sections/footer-section"

const departments = [
  {
    title: "Consulting",
    description: "Work directly with leading blockchain companies and protocols. Our consultants take on real client projects — from technical audits and smart contract development to go-to-market strategy and tokenomics design."
  },
  {
    title: "Education",
    description: "Create and deliver world-class blockchain education. Our educators build courses, run DeCals, produce content for edX and YouTube, and help onboard thousands of students into the space every year."
  },
  {
    title: "Design",
    description: "Bridge technology and people through human-centered design. Our designers craft brand identities, UI/UX systems, and motion work for blockchain projects — making complex products feel simple and approachable."
  },
  {
    title: "Research",
    description: "Push the technical frontier of blockchain. Our researchers publish papers, analyze protocols, participate in governance, and contribute to open-source projects in consensus, cryptography, and security."
  }
]

const timeline = [
  { date: "Tue 1/20 — Thu 1/29", title: "Coffee Chats",          location: "The Standard Courtyard · 2nd Floor", format: "In Person" },
  { date: "Thu 1/22 · 5:00–7:00 PM", title: "Member Mixer",      location: "The Standard Lounge",                format: "In Person" },
  { date: "Sat 1/24 · 4:00–6:00 PM", title: "Women's Mixer",     location: "The Standard Courtyard · 2nd Floor", format: "In Person" },
  { date: "Mon 1/26 · 8:00–10:00 PM", title: "Clubs & Cookies",  location: "Dwinelle 247",                        format: "In Person" },
  { date: "Mon 1/27 · 5:00–7:00 PM", title: "Cross-Club DEI Mixer", location: "TBA",                             format: "In Person" },
  { date: "Tue 1/27 · 8:00–10:00 PM", title: "Info Session",     location: "Dwinelle 263",                        format: "In Person" },
  { date: "Wed 1/28 · 8:00–10:00 PM", title: "Technical Workshop", location: "Online",                           format: "Virtual" },
  { date: "Thu 1/29 · 12:00 PM PST", title: "Application Due",   location: "Final Deadline",                      format: "Apply Now" },
]

export default function ApplyPage() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      <PageNav />
      <main className="min-h-screen bg-black">

        {/* Hero Section */}
        <section className="px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
            <div className="flex-1 max-w-xs">
              <div className="mb-4">
                <span className="text-xs uppercase tracking-widest text-neutral-500">Spring 2026 Recruitment</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Create &amp; Build Tomorrow, Today.</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                {"We're recruiting developers and designers dedicated to the adoption and growth of blockchain technologies."}
              </p>
              <div className="flex gap-2">
                <Link href="#">
                  <PillButton variant="secondary" size="sm">Coffee Chat Sign Up</PillButton>
                </Link>
                <Link href="#">
                  <PillButton variant="primary" size="sm">Application Link &nbsp;→</PillButton>
                </Link>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-end">
              <div className="flex items-center gap-4 mb-6">
                <DotGrid rows={4} cols={4} className="gap-1" />
                <span className="text-sm font-medium tracking-widest text-neutral-400">B D A X</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-light text-white text-right tracking-tight">
                Join our Spring<br />2026 Cohort.
              </h1>
            </div>
          </div>
        </section>

        {/* Applications Due Box + Portfolio grid */}
        <section className="px-6 md:px-12 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-neutral-900 rounded-2xl p-8 flex flex-col justify-between">
              <p className="text-xs uppercase tracking-widest text-neutral-500 mb-6">Applications Due</p>
              <div>
                <p className="text-6xl font-light text-white mb-1">1/29</p>
                <p className="text-sm text-neutral-400 mb-6">Thursday · 12:00 PM PST</p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-2xl font-light text-white">14</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Days Left</p>
                  </div>
                  <div>
                    <p className="text-2xl font-light text-[#F2C94C]">~25</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Slots</p>
                  </div>
                </div>
              </div>
            </div>
            <PlaceholderCard aspectRatio="portrait" />
            <PlaceholderCard aspectRatio="portrait" />
          </div>

          <PortfolioBanner
            text="Eight events. One application. Start with a coffee chat."
            buttonText="Apply Now"
          />
        </section>

        {/* Our Vision */}
        <section className="px-6 md:px-12 py-16">
          <SectionHeading title="Our Vision." />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <p className="text-2xl md:text-3xl font-semibold text-white leading-snug">
                Build Tomorrow&apos;s Technology, Today.
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoBlock
                label="Who We Look For"
                content="Our members are encouraged to experiment with new ideas and build powerful tools that push the technology's limits. No prior blockchain experience required — just curiosity and commitment."
              />
              <InfoBlock
                label="Developers"
                content="Engineers who want to ship real products. You'll work on client engagements, internal tooling, and open-source contributions to the blockchain ecosystem."
              />
              <InfoBlock
                label="Designers"
                content="Creatives who care about making blockchain accessible. You'll own end-to-end design for real projects — from user research to high-fidelity prototypes."
              />
              <InfoBlock
                label="Curious Minds"
                content="Researchers, writers, and strategists who want to go deep. If you're driven to understand how decentralized systems work and why they matter, there's a place for you here."
              />
            </div>
          </div>
        </section>

        {/* Departments */}
        <section className="px-6 md:px-12 py-16">
          <SectionHeading title="Departments." withDivider={false} />

          <TabButtons
            tabs={["Consulting", "Education", "Design", "Research"]}
            onTabChange={setActiveTab}
            className="mb-8"
          />

          <FeatureCard
            title={departments[activeTab].title}
            description={departments[activeTab].description}
          />
        </section>

        {/* Recruitment Timeline */}
        <section className="px-6 md:px-12 py-16 border-t border-neutral-800">
          <div className="mb-10">
            <SectionHeading title="Recruitment Timeline." />
            <p className="text-neutral-400 mt-2">Eight Events. One Application.</p>
          </div>

          <div className="space-y-0">
            {timeline.map((event, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-8 py-5 border-b border-neutral-800 group"
              >
                <p className="text-xs text-neutral-500 font-mono pt-0.5">{event.date}</p>
                <p className="text-white font-medium md:col-span-1">{event.title}</p>
                <p className="text-neutral-400 text-sm">{event.location}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs uppercase tracking-widest px-3 py-1 rounded-full border ${
                    event.format === "Virtual"
                      ? "border-neutral-700 text-neutral-400"
                      : event.format === "Apply Now"
                      ? "border-[#F2C94C]/50 text-[#F2C94C]"
                      : "border-neutral-700 text-neutral-400"
                  }`}>
                    {event.format}
                  </span>
                  {event.format === "Apply Now" && (
                    <ArrowUpRight className="h-4 w-4 text-[#F2C94C]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Questions */}
        <section className="px-6 md:px-12 py-12 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-white text-lg font-light">Questions?</p>
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-neutral-400">
              <a href="mailto:recruitment@blockchain.berkeley.edu" className="hover:text-white transition-colors">
                recruitment@blockchain.berkeley.edu
              </a>
              <span className="hidden md:block text-neutral-700">·</span>
              <Link href="#" className="hover:text-white transition-colors flex items-center gap-1">
                View FAQ <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <FooterSection />
      </main>
    </>
  )
}
