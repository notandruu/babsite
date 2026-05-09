import { cn } from "@/lib/utils"

interface InfoBlockProps {
  label: string
  content: string
  className?: string
}

export function InfoBlock({ label, content, className }: InfoBlockProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-semibold text-white">{label}</h4>
      <p className="text-sm text-neutral-400 leading-relaxed">{content}</p>
    </div>
  )
}
