export type StopType = "milestone" | "cta";

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

// Sourced from B@B's internal "brief history" deck — one representative
// milestone per year, 2014 through 2024.
export const TIMELINE_STOPS: TimelineStop[] = [
  {
    id: "founding",
    year: "2014",
    type: "milestone",
    kicker: "FOUNDED 2014",
    title: "Bitcoin Association of Berkeley",
    tagline: "A handful of names on a sign-in sheet",
    description:
      "A small group of students signed up at the club's first general meeting in Fall 2014, under its original name, Bitcoin Association of Berkeley. It would take two more years and a rebrand before it became Blockchain at Berkeley.",
    tags: ["Founding", "Fall 2014"],
    image: "/assets/history/history_2014_founding.jpg",
    href: "/about",
  },
  {
    id: "decal",
    year: "2016",
    type: "milestone",
    kicker: "FIRST DECAL",
    title: "Blockchain at Berkeley",
    tagline: "The club's first cryptocurrency course",
    description:
      "The club rebranded from Bitcoin Association of Berkeley to Blockchain at Berkeley and taught its first-ever Cryptocurrency DeCal lecture — the start of what's now the Education department.",
    tags: ["Rebrand", "DeCal"],
    image: "/assets/history/history_2016_decal.jpg",
    href: "/courses",
  },
  {
    id: "ethereal",
    year: "2017",
    type: "milestone",
    kicker: "FIRST HACKATHON",
    title: "Ethereal Hackathon",
    tagline: "Co-hosted with ConsenSys",
    description:
      "B@B co-hosted the Ethereal Hackathon with ConsenSys and, that same fall, ran its own Crypto Economics Security Conference (CESC) — the club's first time organizing events at that scale.",
    tags: ["ConsenSys", "CESC"],
    image: "/assets/history/history_2017_ethereal.jpg",
    href: "/work",
  },
  {
    id: "dropoff",
    year: "2018",
    type: "milestone",
    kicker: "THE DROP OFF",
    title: "The market crashed. We didn't.",
    tagline: "Bitcoin fell from $18k to $4k",
    description:
      "The 2018 crash wiped out most of the industry's hype along with it — Bitcoin fell from roughly $18,000 to under $4,000 over the year. B@B kept building anyway, landing partnerships with Qualcomm, Ford, and BASF that same year.",
    tags: ["2018 Crash", "Resilience"],
    image: "/assets/history/history_2018_dropoff.jpg",
    href: "/about",
  },
  {
    id: "xcelerator",
    year: "2019",
    type: "milestone",
    kicker: "NEW VENTURE",
    title: "Berkeley Blockchain Xcelerator",
    tagline: "Launched with Haas and the Sutardja Center",
    description:
      "B@B partnered with Berkeley Haas and the Sutardja Center for Entrepreneurship & Technology to launch the Berkeley Blockchain Xcelerator, backing student and alumni startups building in the space.",
    tags: ["Berkeley Haas", "Sutardja Center"],
    image: "/assets/history/history_2019_xcelerator.png",
    href: "/department/consulting",
  },
  {
    id: "remote",
    year: "2020",
    type: "milestone",
    kicker: "GOING REMOTE",
    title: "A club, over Zoom",
    tagline: "General meetings, socials, and game nights — all virtual",
    description:
      "COVID-19 sent the club fully remote. General meetings, socials, even game nights moved to Zoom — and the org kept running without missing a semester.",
    tags: ["COVID-19", "Remote"],
    image: "/assets/history/history_2020_remote.jpg",
    href: "/about",
  },
  {
    id: "grads",
    year: "2021",
    type: "milestone",
    kicker: "FIRST GRADUATES",
    title: "Watching members graduate",
    tagline: "Seven years in, the first cohorts moved on",
    description:
      "By 2021 the club was old enough to watch its early members graduate and head into the industry — a milestone that made B@B feel less like a startup and more like an institution.",
    tags: ["Alumni", "Spring 2021"],
    image: "/assets/history/history_2021_grads.jpg",
    href: "/about",
  },
  {
    id: "merge",
    year: "2022",
    type: "milestone",
    kicker: "THE MERGE",
    title: "Watching Ethereum's Merge together",
    tagline: "Dinner, plus a 24-hour livestream",
    description:
      "The club gathered for dinner while streaming Ethereum's Merge live — the upgrade that moved the network off proof-of-work for good. Not a bad night to be a member.",
    tags: ["Ethereum", "The Merge"],
    image: "/assets/history/history_2022_merge.jpg",
    href: "/about",
  },
  {
    id: "zk",
    year: "2023",
    type: "milestone",
    kicker: "TECHNICAL WORKSHOPS",
    title: "ZK Learning Workshop",
    tagline: "Zero-knowledge proofs, with Aleo",
    description:
      "B@B partnered with Aleo to run a workshop on zero-knowledge proofs — one of a growing slate of technical sessions as the Education department matured.",
    tags: ["Aleo", "Zero-Knowledge"],
    image: "/assets/history/history_2023_zk.png",
    href: "/courses",
  },
  {
    id: "ethglobal",
    year: "2024",
    type: "milestone",
    kicker: "STILL HACKING",
    title: "ETHGlobal San Francisco",
    tagline: "And a session with Ripple",
    description:
      "Members represented B@B at ETHGlobal San Francisco and hosted a session with Ripple — a decade in, still showing up to hackathons.",
    tags: ["ETHGlobal", "Ripple"],
    image: "/assets/history/history_2024_ethglobal.jpg",
    href: "/work",
  },
  {
    id: "apply",
    year: "NOW",
    type: "cta",
    kicker: "JOIN US",
    title: "Apply to Blockchain at Berkeley",
    tagline: "The next chapter is unwritten",
    description:
      "Ten years in, we're still figuring out what's next — just like that first sign-in sheet in 2014. Come help write it.",
    tags: ["Applications Open"],
    href: "/apply",
  },
];
