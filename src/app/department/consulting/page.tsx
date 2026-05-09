import { SectionHeading, PillButton } from "@/components/design-system"
import { FooterSection } from "@/components/sections/footer-section"
import { Building2, FileSearch, Code, LineChart } from "lucide-react"

export default function ConsultingPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight mb-8">
            Consulting.
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed max-w-2xl mb-8">
            Our consulting arm provides strategic blockchain advisory and development
            services to enterprises, startups, and organizations worldwide.
          </p>
          <div className="flex gap-3">
            <PillButton variant="primary">Work With Us</PillButton>
            <PillButton variant="secondary">View Case Studies</PillButton>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 md:px-12 py-16 bg-neutral-950">
        <SectionHeading title="Our Services." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-neutral-900 rounded-xl p-8 text-white">
            <div className="bg-[#F2C94C] rounded-full p-3 w-fit mb-6">
              <FileSearch className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Technical Audits</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Comprehensive smart contract and protocol audits to ensure security,
              efficiency, and best practices in your blockchain implementations.
            </p>
          </div>

          <div className="bg-neutral-900 rounded-xl p-8 text-white">
            <div className="bg-[#F2C94C] rounded-full p-3 w-fit mb-6">
              <Code className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Development</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              End-to-end blockchain development services, from smart contracts
              to full-stack decentralized application development.
            </p>
          </div>

          <div className="bg-neutral-900 rounded-xl p-8 text-white">
            <div className="bg-[#F2C94C] rounded-full p-3 w-fit mb-6">
              <LineChart className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Strategy</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Strategic consulting to help organizations understand and leverage
              blockchain technology for their specific use cases.
            </p>
          </div>

          <div className="bg-neutral-900 rounded-xl p-8 text-white">
            <div className="bg-[#F2C94C] rounded-full p-3 w-fit mb-6">
              <Building2 className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Enterprise Solutions</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Custom blockchain solutions designed for enterprise-scale applications,
              integrations, and infrastructure requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <SectionHeading title="Trusted By." />
        <p className="text-neutral-400 mb-12 max-w-2xl leading-relaxed">
          We have worked with leading companies and protocols across the blockchain ecosystem.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-neutral-900 rounded-lg aspect-video flex items-center justify-center"
            >
              <span className="text-neutral-600 text-xs font-medium">Client Logo</span>
            </div>
          ))}
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
