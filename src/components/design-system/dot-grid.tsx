import { cn } from "@/lib/utils"

interface DotGridProps {
  rows?: number
  cols?: number
  className?: string
}

export function DotGrid({ rows = 3, cols = 4, className }: DotGridProps) {
  return (
    <div 
      className={cn("grid gap-1", className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-neutral-600" />
      ))}
    </div>
  )
}
