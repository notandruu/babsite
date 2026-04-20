import { HashMatrix } from "@/components/HashMatrix";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Prototype — Blockchain at Berkeley",
};

export default function PrototypePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
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

      {/* Full background hash matrix */}
      <div className="absolute inset-0">
        <HashMatrix />
      </div>

    </div>
  );
}
