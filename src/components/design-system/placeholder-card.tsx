import { cn } from "@/lib/utils"

interface PlaceholderCardProps {
  className?: string
  aspectRatio?: "square" | "video" | "portrait"
}

export function PlaceholderCard({ className, aspectRatio = "portrait" }: PlaceholderCardProps) {
  const ratios = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]"
  }

  return (
    <div className={cn(
      "bg-neutral-800 rounded-2xl",
      ratios[aspectRatio],
      className
    )} />
  )
}
