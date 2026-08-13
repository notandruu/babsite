import type { ReactNode } from "react";
import { JetBrains_Mono } from "next/font/google";

const showcaseMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-showcase-mono",
});

export default function ShowcaseLayout({ children }: { children: ReactNode }) {
  return <div className={showcaseMono.variable}>{children}</div>;
}
