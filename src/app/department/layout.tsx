import { PageNav } from "@/components/PageNav"

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageNav />
      {children}
    </>
  )
}
