"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

interface TabButtonsProps {
  tabs: string[]
  defaultActive?: number
  onTabChange?: (index: number) => void
  className?: string
}

export function TabButtons({ tabs, defaultActive = 0, onTabChange, className }: TabButtonsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultActive)

  const handleClick = (index: number) => {
    setActiveIndex(index)
    onTabChange?.(index)
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => handleClick(index)}
          className={cn(
            "px-5 py-2 text-sm rounded-full font-medium transition-all duration-200",
            activeIndex === index
              ? "bg-white text-black"
              : "bg-transparent text-neutral-400 border border-neutral-700 hover:border-neutral-500 hover:text-white"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
