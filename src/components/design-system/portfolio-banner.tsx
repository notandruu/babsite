import { cn } from "@/lib/utils"
import { PillButton } from "./pill-button"

interface PortfolioBannerProps {
  text: string
  buttonText?: string
  className?: string
  onButtonClick?: () => void
}

export function PortfolioBanner({ text, buttonText = "Visit", className, onButtonClick }: PortfolioBannerProps) {
  return (
    <div className={cn(
      "bg-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6",
      className
    )}>
      <p className="text-white text-lg font-medium leading-relaxed">{text}</p>
      <div className="flex items-center gap-6">
        {/* Decorative dots */}
        <div className="hidden md:grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-6 h-6 rounded-full",
                i < 4 ? "bg-neutral-400" : "bg-neutral-500",
                i >= 6 && "bg-transparent"
              )}
            />
          ))}
        </div>
        <PillButton variant="secondary" withArrow onClick={onButtonClick}>
          {buttonText}
        </PillButton>
      </div>
    </div>
  )
}
