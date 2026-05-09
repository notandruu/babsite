interface TeamMemberCardProps {
  name: string
  role: string
  image?: string
}

export function TeamMemberCard({ name, role, image }: TeamMemberCardProps) {
  return (
    <div className="rounded-xl overflow-hidden">
      {/* Image placeholder */}
      <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 aspect-square w-full" />
      
      {/* Info section */}
      <div className="bg-neutral-900 p-4">
        <h4 className="text-white font-medium text-sm">{name}</h4>
        <p className="text-neutral-500 text-xs mt-1">{role}</p>
      </div>
    </div>
  )
}
