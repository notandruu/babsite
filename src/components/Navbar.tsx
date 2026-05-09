import Link from "next/link";
import { Logo } from "./Logo";
import { ArrowIcon } from "./ArrowIcon";

export function Navbar() {
  return (
    <nav className="relative z-30 pt-[27px] px-[48px]">
      <div className="bg-surface border border-border-nav h-14 sm:h-16 flex items-center justify-between overflow-hidden">
        {/* Logo */}
        <div className="flex items-center h-11 ml-4 sm:ml-5">
          <Logo />
        </div>

        {/* Nav links - centered, hidden on small screens */}
        <div className="hidden md:flex items-center justify-center gap-5 font-sans text-base tracking-[-0.8px] text-white absolute left-1/2 -translate-x-1/2">
          <Link href="/about" className="hover:text-gold transition-colors">ABOUT</Link>
          <Link href="/work" className="hover:text-gold transition-colors">WORK</Link>
          <Link href="/courses" className="hover:text-gold transition-colors">COURSES</Link>
          <Link href="/blog" className="hover:text-gold transition-colors">BLOG</Link>
        </div>

        {/* CTA */}
        <div className="bg-gold h-14 sm:h-16 flex items-center gap-2 px-3 sm:px-[30px] cursor-pointer hover:bg-yellow-400 transition-colors shrink-0">
          <span className="font-sans text-xs sm:text-base tracking-[-0.8px] text-surface whitespace-nowrap">
            APPLY NOW
          </span>
          <ArrowIcon dark />
        </div>
      </div>
    </nav>
  );
}
