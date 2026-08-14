import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans, EB_Garamond, DM_Mono } from "next/font/google";
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

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-eb-garamond",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-mono",
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
      className={`${instrumentSerif.variable} ${instrumentSans.variable} ${ebGaramond.variable} ${dmMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-surface text-white">{children}</body>
    </html>
  );
}
