"use client";

import dynamic from "next/dynamic";
import { ShowcaseArrival } from "./ShowcaseArrival";

/**
 * The finished backdrop, rendered as part of this route's server HTML so
 * the very first paint is already correct.
 *
 * The experience itself has to be client-only (WebGL), but `ssr: false`
 * means this route previously shipped no markup whatsoever — measured at
 * roughly 200ms of an entirely empty document before the chunk mounted.
 * With nothing of ours painted, the browser shows the bare page, which is
 * what read as a white flash before everything "came back in". Keeping the
 * backdrop here, outside the dynamic boundary, closes that gap: there is
 * no frame in which the page is unpainted.
 */
const BACKDROP =
  "radial-gradient(90% 70% at 82% 108%, rgba(254,203,51,0.16), rgba(0,0,0,0) 60%), radial-gradient(120% 90% at 10% -10%, rgba(254,203,51,0.1), rgba(0,0,0,0) 55%), #0c0c0c";

const ShowcaseExperience = dynamic(
  () => import("./ShowcaseExperience").then((mod) => mod.ShowcaseExperience),
  { ssr: false, loading: () => null }
);

export default function ShowcasePage() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: BACKDROP }}>
      <ShowcaseExperience />
      <ShowcaseArrival />
    </div>
  );
}
