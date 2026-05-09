import { PageNav } from "@/components/PageNav"
import { PageFooter } from "@/components/PageFooter"
import { BlogPosts } from "@/components/BlogPosts"

const inPersonCourses = [
  { title: "Blockchain Fundamentals",    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { title: "Blockchain Development",     desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { title: "Blockchain Product Design",  desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { title: "Bitcoin & Cryptocurrencies", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
]

const onlineCourses = [
  { title: "Blockchain Fundamentals",    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { title: "Bitcoin & Cryptocurrencies", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
]

function CourseCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-[rgba(255,255,255,0.07)] last:border-b-0 group cursor-pointer hover:bg-white/[0.02] transition-colors gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-gold/20 to-[#EAA536]/10 border border-[rgba(254,203,51,0.15)] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L15 4.5V11.5L8 15L1 11.5V4.5L8 1Z" stroke="#FECB33" strokeWidth="1" fill="none" opacity="0.7" />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-sans text-white text-[13px] truncate">{title}</p>
          <p className="font-sans text-white/50 text-[10px]">{desc}</p>
        </div>
      </div>
      <span className="font-sans text-gold text-[8px] tracking-[0.1em] uppercase font-medium border border-[rgba(254,203,51,0.3)] px-2 py-1 shrink-0">
        New
      </span>
    </div>
  )
}

function CourseSection({
  badge,
  heading,
  description,
  courses,
  imageSrc,
  imagePosition = "left",
}: {
  badge: string
  heading: string
  description: string
  courses: { title: string; desc: string }[]
  imageSrc: string
  imagePosition?: "left" | "right"
}) {
  const imagePanel = (
    <div className="w-full md:w-1/2 shrink-0 relative overflow-hidden min-h-[280px] md:min-h-0">
      <img src={imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/20 to-transparent" />
    </div>
  )

  const contentPanel = (
    <div className="w-full md:w-1/2 shrink-0 flex flex-col justify-center gap-6 py-10 px-[48px]">
      <span className="font-sans text-gold text-[7.7px] tracking-[0.15em] uppercase font-medium border border-[rgba(254,203,51,0.11)] px-3 py-1.5 w-fit">
        {badge}
      </span>
      <h2
        className="font-serif text-white tracking-[-0.03em]"
        style={{ fontSize: "clamp(1.25rem, 2.5vw + 0.5rem, 2.425rem)" }}
      >
        {heading}
      </h2>
      <div className="flex flex-col gap-4">
        <p className="font-sans text-white/50 text-xs leading-relaxed">{description}</p>
        <div className="border border-[rgba(255,255,255,0.07)] overflow-hidden">
          {courses.map((course) => (
            <CourseCard key={course.title} {...course} />
          ))}
        </div>
      </div>
      <button className="flex items-center gap-2 font-sans text-white text-sm border-b border-white/30 pb-0.5 w-fit hover:opacity-70 transition-opacity">
        Learn more{" "}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )

  return (
    <section className="border-b border-[rgba(255,255,255,0.07)]">
      <div className="flex flex-col md:flex-row items-stretch">
        {imagePosition === "left" ? (
          <>{imagePanel}{contentPanel}</>
        ) : (
          <>{contentPanel}{imagePanel}</>
        )}
      </div>
    </section>
  )
}

export default function CoursesPage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">
      <PageNav active="courses" />

      <CourseSection
        badge="IN-PERSON COURSE"
        heading="DeCal"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
        courses={inPersonCourses}
        imageSrc="/courses-bg.jpg"
        imagePosition="left"
      />

      <CourseSection
        badge="ONLINE COURSE"
        heading="edX"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
        courses={onlineCourses}
        imageSrc="/courses-bg-2.jpg"
        imagePosition="right"
      />

      <BlogPosts />
      <PageFooter />
    </div>
  )
}
