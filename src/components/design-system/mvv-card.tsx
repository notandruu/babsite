import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MVVCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function MVVCard({ icon: Icon, title, description }: MVVCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl p-8 text-white">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-amber-500 rounded-full p-3">
          <Icon className="h-6 w-6 text-zinc-900" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-neutral-300 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
