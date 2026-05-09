import { PillButton } from "@/components/design-system"
import { Share2, Camera, ExternalLink } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="bg-neutral-950 px-8 md:px-14 pt-16 pb-8 flex flex-col min-h-[520px]">
      {/* Main content row — grows to fill height */}
      <div className="flex flex-1 items-start justify-between gap-8 grow">

        {/* Left — text + button */}
        <div className="max-w-xs pt-2">
          <p className="text-white text-2xl md:text-3xl font-light leading-snug mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <PillButton variant="outline" size="sm" withArrow>
            Visit
          </PillButton>
        </div>

        {/* Center — asymmetric 3-box layout */}
        <div className="flex items-start gap-4 mt-2">
          {/* Tall square on the left */}
          <div className="w-40 h-60 bg-neutral-800 rounded-2xl shrink-0" />

          {/* Right column: wide landscape rect on top, smaller square below */}
          <div className="flex flex-col gap-4">
            <div className="w-52 h-28 bg-neutral-800 rounded-2xl" />
            <div className="w-36 h-28 bg-neutral-800 rounded-2xl" />
          </div>
        </div>

        {/* Right — Index */}
        <div className="pt-2">
          <span className="text-white text-sm">Index</span>
        </div>
      </div>

      {/* Bottom bar — stay connected */}
      <div className="flex items-center gap-3 mt-16 text-white">
        <span className="text-sm tracking-wide">stay connected</span>
        <a href="#" aria-label="LinkedIn" className="w-7 h-7 rounded-full border border-white/60 flex items-center justify-center hover:border-white transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a href="#" aria-label="Twitter / X" className="w-7 h-7 rounded-full border border-white/60 flex items-center justify-center hover:border-white transition-colors">
          <Share2 className="h-3.5 w-3.5" />
        </a>
        <a href="#" aria-label="Instagram" className="w-7 h-7 rounded-full border border-white/60 flex items-center justify-center hover:border-white transition-colors">
          <Camera className="h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  )
}
