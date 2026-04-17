import { HashMatrix } from "@/components/HashMatrix";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Prototype — Blockchain at Berkeley",
};

export default function PrototypePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a] flex flex-col">
      {/* Navbar */}
      <div className="absolute inset-x-0 top-0 z-20 px-[48px] pt-[27px]">
        <div className="flex items-center justify-between h-14">
          <Logo />
          <div className="hidden md:flex items-center gap-8 ml-auto">
            <a href="#" className="font-sans text-[13px] tracking-widest text-white hover:text-gold transition-colors">ABOUT</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-white hover:text-gold transition-colors">DEPARTMENTS</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-white hover:text-gold transition-colors">BLOG</a>
            <a href="#" className="font-sans text-[13px] tracking-widest text-gold hover:text-white transition-colors">APPLY →</a>
          </div>
        </div>
      </div>

      {/* Logo — fills all space above CTA */}
      <div className="relative flex-1 w-full">
        <HashMatrix />
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 pb-10 pt-4 z-10">
        <p className="font-sans text-[12px] tracking-[0.22em] uppercase text-white/60">
          Blockchain at Berkeley
        </p>
        <div className="flex items-center gap-7">
          <a href="#" className="font-sans text-[11px] tracking-[0.12em] uppercase text-white/35 hover:text-white/70 transition-colors">
            Departments
          </a>
          <span className="text-white/15 text-[10px]">·</span>
          <a href="#" className="font-sans text-[11px] tracking-[0.12em] uppercase text-white/35 hover:text-white/70 transition-colors">
            Research
          </a>
          <span className="text-white/15 text-[10px]">·</span>
          <a href="#" className="font-sans text-[11px] tracking-[0.12em] uppercase text-white/35 hover:text-white/70 transition-colors">
            Blog
          </a>
        </div>
      </div>
    </div>
  );
}
