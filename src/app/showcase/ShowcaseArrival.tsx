"use client";

import { useEffect } from "react";
import { ARRIVAL_KEY } from "@/components/ShowcaseGateway";
import { dismissWash, removeStaleWash } from "@/components/transitionWash";

/**
 * Dismisses the transition wash on arrival from the About page.
 *
 * The wash itself isn't rendered here — it's the same element the gateway
 * put on <body> before navigating, still mid-animation. This just picks it
 * up at full coverage and plays it out, so the departure and the arrival are
 * one continuous surface rather than two elements handing off across a route
 * change (which is what made it blink out at the seam before).
 *
 * Renders nothing, and on a direct visit to /showcase does nothing at all.
 */
export function ShowcaseArrival() {
  useEffect(() => {
    let arrived = false;
    try {
      arrived = sessionStorage.getItem(ARRIVAL_KEY) === "1";
      if (arrived) sessionStorage.removeItem(ARRIVAL_KEY);
    } catch {
      // storage unavailable; treat as a direct visit
    }

    if (arrived) {
      dismissWash();
    } else {
      // Direct visit. Clear anything stranded by an interrupted navigation,
      // but never a wash that's already playing its exit.
      removeStaleWash();
    }

    // No unmount cleanup on purpose. Tearing the wash down here is what
    // broke it: StrictMode's cleanup-then-remount cycle fired between the
    // exit starting and finishing, so the element was destroyed mid-flight
    // and the arrival looked like the transition had simply stopped. The
    // wash removes itself on animationend, with a timeout backstop.
  }, []);

  return null;
}
