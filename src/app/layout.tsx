import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "Blockchain at Berkeley",
  description:
    "Berkeley's hub for blockchain innovation — education, research, and consulting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${instrumentSans.variable} antialiased`}
    >
      {/* suppressHydrationWarning: some browser extensions (Bitdefender's
          bis_skin_checked/bis_register being the common one) inject attributes
          onto <body> before React hydrates, which otherwise flags as a false
          hydration mismatch in dev. Doesn't suppress real mismatches elsewhere
          in the tree. */}
      <body className="min-h-screen bg-surface text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
