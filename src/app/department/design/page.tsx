import { SectionHeading, PillButton, FeatureCard } from "@/components/design-system"
import { FooterSection } from "@/components/sections/footer-section"
import { Palette, Layers, PenTool, ArrowUpRight } from "lucide-react"

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section — 01 */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-6">01 — Design · Est. 2018</p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-8">
              Human Centered Design for Decentralization.
            </h1>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-xl mb-10">
              We regard design as the vital bridge that makes advanced technology accessible to those who stand to benefit most.
            </p>
            <PillButton variant="primary">
              <span className="flex items-center gap-2">Explore Work <ArrowUpRight className="h-4 w-4" /></span>
            </PillButton>
          </div>
          <div className="bg-neutral-900 rounded-2xl aspect-[4/3] flex items-center justify-center border border-neutral-800">
            <span className="text-xs uppercase tracking-widest text-neutral-600">Design Artifact / Screen</span>
          </div>
        </div>
      </section>

      {/* Our Initiatives Section — 02 */}
      <section className="px-6 md:px-12 py-16 md:py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">02 — Our Initiatives</p>
          <SectionHeading title="Three Streams of Work." />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800">
              <div className="bg-[#F2C94C] rounded-full p-3 w-fit mb-6">
                <Palette className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">UX Research + Prototyping</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Each semester we unravel a key question in the realm of blockchain, from research and ideation to prototyping.
              </p>
            </div>

            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800">
              <div className="bg-[#F2C94C] rounded-full p-3 w-fit mb-6">
                <Layers className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Product Design + Consulting</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                High-fidelity prototypes for consulting clients, fostering mutual feedback that elevates our collective design expertise.
              </p>
            </div>

            <div className="bg-neutral-900 rounded-xl p-8 border border-neutral-800">
              <div className="bg-[#F2C94C] rounded-full p-3 w-fit mb-6">
                <PenTool className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Brand Design + Marketing</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Shape the brand identity of our org and design comprehensive marketing materials. Great ideas turned into great designs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Section — 03 */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">03 — Case Study</p>
          <SectionHeading title="Featured" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-center">
            <div className="bg-neutral-900 rounded-2xl aspect-[4/3] flex items-center justify-center border border-neutral-800">
              <span className="text-xs uppercase tracking-widest text-neutral-600">Case Study / Preview</span>
            </div>

            <div>
              <h3 className="font-serif text-4xl md:text-5xl text-white mb-2">SimpleFi</h3>
              <p className="text-[#F2C94C] text-lg mb-6">DeFi app for crypto newbies.</p>
              <p className="text-neutral-400 leading-relaxed mb-8">
                A decentralized finance app for beginners and non-technical users. Gesture-based shortcuts and context-aware AI assistants ensure a smooth onramp to crypto.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="border-l-2 border-[#F2C94C] pl-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Deliverables</p>
                  <p className="text-white text-sm">UX Research · Prototype · Brand</p>
                </div>
                <div className="border-l-2 border-neutral-700 pl-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Timeline</p>
                  <p className="text-white text-sm">10 weeks · Spring 2024</p>
                </div>
              </div>

              <button className="inline-flex items-center gap-2 border border-neutral-700 text-white px-8 py-4 text-sm font-medium tracking-wider hover:border-[#F2C94C] hover:text-[#F2C94C] transition-colors rounded-full">
                Read Case Study
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Section — 04 */}
      <section className="px-6 md:px-12 py-16 md:py-24 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">04 — Our Process</p>
          <SectionHeading title="How We Work." />

          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-800 border border-neutral-800 rounded-2xl overflow-hidden mt-12">
            {[
              { num: "01", label: "Research",  detail: "Interviews + audits" },
              { num: "02", label: "Ideate",    detail: "Sketches + workshops" },
              { num: "03", label: "Prototype", detail: "Lo-fi → hi-fi" },
              { num: "04", label: "Ship",      detail: "Test + handoff" },
            ].map((step) => (
              <div key={step.num} className="p-8 md:p-10">
                <p className="text-xs text-neutral-600 mb-4">{step.num}.</p>
                <p className="text-white font-medium mb-2">{step.label}</p>
                <p className="text-neutral-500 text-sm">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
