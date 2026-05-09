import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import type { ReactNode } from "react"

interface FeatureCardProps {
  title: string
  description: string
  className?: string
  children?: ReactNode
}

export function FeatureCard({ title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "relative bg-neutral-900 rounded-2xl p-6 min-h-[320px] flex flex-col justify-end group cursor-pointer transition-all duration-300 hover:bg-neutral-800",
      className
    )}>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
      </div>
      <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center group-hover:bg-[#F2C94C] group-hover:text-black transition-all duration-300">
        <ArrowUpRight className="h-5 w-5" />
      </div>
    </div>
  )
}
