interface LogoGridProps {
  count?: number
}

export function LogoGrid({ count = 6 }: LogoGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-neutral-900 rounded-lg aspect-square flex items-center justify-center"
        >
          <div className="text-neutral-600 text-xs font-medium">Logo</div>
        </div>
      ))}
    </div>
  )
}
