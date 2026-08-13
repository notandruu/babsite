export type StopType = "stats" | "department" | "project" | "cta";

export interface TimelineStop {
  id: string;
  year: string;
  type: StopType;
  kicker: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  image?: string;
  href: string;
}

export const TIMELINE_STOPS: TimelineStop[] = [
  {
    id: "founding",
    year: "2018",
    type: "stats",
    kicker: "EST. 2018",
    title: "Blockchain at Berkeley",
    tagline: "Berkeley's hub for blockchain innovation",
    description:
      "Started as a handful of students in a Soda Hall classroom. Now the largest university blockchain organization in the world, spanning consulting, design, education, and research.",
    tags: ["UC Berkeley", "Student-Run", "Non-Profit"],
    href: "/about",
  },
  {
    id: "consulting",
    year: "2020",
    type: "department",
    kicker: "DEPARTMENT 01",
    title: "Consulting",
    tagline: "Strategy that ships",
    description:
      "Strategic Web3 advisory for protocols, funds, and enterprises — from tokenomics to go-to-market.",
    tags: ["Ripple", "Canton", "OpenLedger"],
    image: "/assets/projects/cons_ripple.png",
    href: "/department/consulting",
  },
  {
    id: "design",
    year: "2021",
    type: "department",
    kicker: "DEPARTMENT 02",
    title: "Design",
    tagline: "Interfaces for a crypto-native world",
    description:
      "Branding, product, and visual systems for teams building the next generation of financial infrastructure.",
    tags: ["BDAX", "Brookwell", "Critiq"],
    image: "/assets/projects/design_bdax.png",
    href: "/department/design",
  },
  {
    id: "education",
    year: "2022",
    type: "department",
    kicker: "DEPARTMENT 03",
    title: "Education",
    tagline: "200k+ students, one DeCal at a time",
    description:
      "Decals, workshops, and curriculum bringing students into Web3 — on campus and far beyond it.",
    tags: ["Luma", "Succinct", "Paradigm"],
    image: "/assets/projects/edu_luma.png",
    href: "/department/education",
  },
  {
    id: "research",
    year: "2022",
    type: "department",
    kicker: "DEPARTMENT 04",
    title: "Research",
    tagline: "Original work on protocols and markets",
    description:
      "Published research on consensus, market structure, and infrastructure — read by the teams building it.",
    tags: ["Mantle", "Sandbox", "Publications"],
    image: "/assets/projects/research_mantle.png",
    href: "/department/research",
  },
  {
    id: "openledger",
    year: "2023",
    type: "project",
    kicker: "SELECTED WORK",
    title: "OpenLedger",
    tagline: "Consulting engagement",
    description:
      "One of 50+ consulting engagements taking a protocol from strategy through launch.",
    tags: ["Consulting", "Case Study"],
    image: "/assets/projects/cons_openledger.png",
    href: "/work",
  },
  {
    id: "critiq",
    year: "2024",
    type: "project",
    kicker: "SELECTED WORK",
    title: "Critiq",
    tagline: "Design engagement",
    description: "Brand and product design work for a crypto-native team, start to ship.",
    tags: ["Design", "Case Study"],
    image: "/assets/projects/design_critiq.png",
    href: "/work",
  },
  {
    id: "succinct",
    year: "2024",
    type: "project",
    kicker: "SELECTED WORK",
    title: "Succinct",
    tagline: "Education partnership",
    description: "A workshop series bringing Succinct's research to Berkeley students.",
    tags: ["Education", "Workshop"],
    image: "/assets/projects/edu_succinct.png",
    href: "/work",
  },
  {
    id: "sandbox",
    year: "2025",
    type: "project",
    kicker: "SELECTED WORK",
    title: "Sandbox",
    tagline: "Research engagement",
    description: "An applied research collaboration on infrastructure and market design.",
    tags: ["Research", "Case Study"],
    image: "/assets/projects/research_sandbox.png",
    href: "/work",
  },
  {
    id: "apply",
    year: "NOW",
    type: "cta",
    kicker: "JOIN US",
    title: "Apply to Blockchain at Berkeley",
    tagline: "Applications open every semester",
    description:
      "300+ members. 50+ consulting projects. 8 years running. We're always looking for people who want to build.",
    tags: ["Applications Open"],
    href: "/apply",
  },
];
