import { cn } from "@/lib/utils"

interface AccentTagProps {
  children: React.ReactNode
  className?: string
}

export function AccentTag({ children, className }: AccentTagProps) {
  return (
    <span className={cn("text-amber-500 text-sm font-medium tracking-wide uppercase", className)}>
      {children}
    </span>
  )
}
