import { SectionHeading, PillButton } from "@/components/design-system"
import { FooterSection } from "@/components/sections/footer-section"
import { FileText, ArrowUpRight } from "lucide-react"

const papers = [
  {
    title: "Consensus Mechanisms in Distributed Systems",
    authors: "Berkeley Blockchain Research Team",
    date: "2025",
    category: "Consensus",
  },
  {
    title: "DeFi Protocol Security Analysis",
    authors: "Berkeley Blockchain Research Team",
    date: "2025",
    category: "Security",
  },
  {
    title: "Zero-Knowledge Proofs: A Practical Guide",
    authors: "Berkeley Blockchain Research Team",
    date: "2024",
    category: "Cryptography",
  },
  {
    title: "Scalability Solutions for Layer 2 Networks",
    authors: "Berkeley Blockchain Research Team",
    date: "2024",
    category: "Scalability",
  },
]

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-light text-white leading-tight mb-8">
            Research.
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed max-w-2xl mb-8">
            Our research team conducts cutting-edge research on blockchain technology,
            cryptography, and decentralized systems, publishing papers and contributing
            to the academic community.
          </p>
          <PillButton variant="primary">View All Publications</PillButton>
        </div>
      </section>

      {/* Research Areas */}
      <section className="px-6 md:px-12 py-16 bg-neutral-950">
        <SectionHeading title="Research Areas." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-neutral-900 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Consensus</h3>
            <p className="text-neutral-400 text-sm">
              Exploring novel consensus mechanisms and their trade-offs.
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Cryptography</h3>
            <p className="text-neutral-400 text-sm">
              Advancing cryptographic primitives for blockchain applications.
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Security</h3>
            <p className="text-neutral-400 text-sm">
              Analyzing and improving security in decentralized systems.
            </p>
          </div>
        </div>
      </section>

      {/* Publications */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <SectionHeading title="Recent Publications." />

        <div className="space-y-4 mt-8">
          {papers.map((paper, i) => (
            <div
              key={i}
              className="group flex items-start justify-between p-6 rounded-xl border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="bg-neutral-900 rounded-lg p-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white group-hover:text-neutral-300 transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    {paper.authors} • {paper.date}
                  </p>
                  <span className="inline-block mt-2 text-xs bg-neutral-900 text-neutral-400 px-2 py-1 rounded-full">
                    {paper.category}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-neutral-600 group-hover:text-white transition-colors shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
