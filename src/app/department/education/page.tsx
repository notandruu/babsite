import {
  PillButton,
  SectionHeading,
  InfoBlock,
  FeatureCard,
  PlaceholderCard,
  PortfolioBanner,
} from "@/components/design-system"
import { FooterSection } from "@/components/sections/footer-section"

export default function EducationPage() {
  return (
    <main className="min-h-screen bg-black">

      {/* Hero */}
      <section className="px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div className="flex-1 max-w-xs">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">01 — Education · Est. 2016</p>
            <h3 className="text-sm font-semibold text-white mb-2">Education</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              We create and deliver world-class blockchain education — from DeCals and workshops
              to edX courses watched by hundreds of thousands of students worldwide.
            </p>
            <div className="flex gap-2">
              <PillButton variant="secondary" size="sm">Contact</PillButton>
              <PillButton variant="primary" size="sm" withArrow>Explore Courses</PillButton>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-end justify-end">
            <h1 className="text-4xl md:text-6xl font-light text-white text-right tracking-tight leading-tight">
              Onboarding the World<br />to Blockchain.
            </h1>
          </div>
        </div>
      </section>

      {/* Course image grid */}
      <section className="px-6 md:px-12 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <PlaceholderCard aspectRatio="portrait" />
          <PlaceholderCard aspectRatio="portrait" />
          <PlaceholderCard aspectRatio="portrait" />
        </div>
        <PortfolioBanner
          text="DeCal · edX · Workshops — three formats, one mission: make blockchain accessible."
          buttonText="Explore Courses"
        />
      </section>

      {/* Our Initiatives */}
      <section className="px-6 md:px-12 py-16">
        <SectionHeading title="Our Initiatives." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">02 — Our Initiatives</p>
            <p className="text-2xl md:text-3xl font-semibold text-white leading-snug">
              Three Formats of Learning.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoBlock
              label="DeCal"
              content="Student-led courses at UC Berkeley covering blockchain fundamentals, development, and product design each semester."
            />
            <InfoBlock
              label="edX"
              content="Online courses reaching hundreds of thousands of learners globally — Blockchain Fundamentals and Bitcoin & Cryptocurrencies."
            />
            <InfoBlock
              label="Workshops"
              content="Hands-on technical workshops and speaker series bringing practitioners into the classroom."
            />
            <InfoBlock
              label="Our Approach"
              content="We meet learners where they are — from zero blockchain experience to advanced protocol development."
            />
          </div>
        </div>
      </section>

      {/* Featured Course */}
      <section className="px-6 md:px-12 py-16 border-t border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">03 — Featured Course</p>
            <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-2">
              Blockchain Fundamentals
            </h2>
            <p className="text-neutral-400 text-sm mb-6">The #1 blockchain course on edX.</p>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              A comprehensive introduction to blockchain technology, Bitcoin, Ethereum, and the
              broader ecosystem. No prior experience required.
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Format</p>
                <p className="text-sm text-white">Self-paced · Online · Free to audit</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Enrollment</p>
                <p className="text-sm text-white">200,000+ students</p>
              </div>
            </div>
            <PillButton variant="primary" size="sm" withArrow>Enroll on edX</PillButton>
          </div>
          <div className="md:col-span-2">
            <PlaceholderCard aspectRatio="video" className="w-full" />
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-6 md:px-12 py-16">
        <SectionHeading title="How We Teach." withDivider={false} />
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-8">04 — Our Process</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureCard
            title="Curriculum"
            description="Built by practitioners and researchers who work at the frontier of blockchain every day."
          />
          <FeatureCard
            title="Community"
            description="Learn alongside peers who are just as excited about decentralization as you are."
          />
          <FeatureCard
            title="Projects"
            description="Apply concepts through real projects and case studies from the industry."
          />
          <FeatureCard
            title="Network"
            description="Connect with a global alumni network spanning the most influential blockchain organizations."
          />
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
