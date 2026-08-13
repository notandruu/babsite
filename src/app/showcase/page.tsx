"use client";

import dynamic from "next/dynamic";

const ShowcaseExperience = dynamic(
  () => import("./ShowcaseExperience").then((mod) => mod.ShowcaseExperience),
  { ssr: false }
);

export default function ShowcasePage() {
  return <ShowcaseExperience />;
}
