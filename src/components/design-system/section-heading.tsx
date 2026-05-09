import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  className?: string
  withDivider?: boolean
}

export function SectionHeading({ title, className, withDivider = true }: SectionHeadingProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
        {title}
      </h2>
      {withDivider && (
        <div className="mt-4 h-px bg-neutral-800 w-full" />
      )}
    </div>
  )
}
