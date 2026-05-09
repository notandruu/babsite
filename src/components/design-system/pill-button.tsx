import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  withArrow?: boolean
  children: ReactNode
}

export function PillButton({
  variant = "secondary",
  size = "md",
  withArrow = false,
  children,
  className,
  ...props
}: PillButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
  
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800",
    secondary: "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-100",
    outline: "bg-transparent text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-white"
  }
  
  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-6 py-2.5 text-base"
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
      {withArrow && <ArrowUpRight className="h-3.5 w-3.5" />}
    </button>
  )
}
