import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { GridBackground } from "@/components/GridBackground";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-surface overflow-hidden">
      <GridBackground />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Stats />
        <div className="h-[27px]" />
      </div>
    </div>
  );
}
