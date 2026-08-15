"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ShowcaseScene } from "./ShowcaseScene";
import { ShowcaseHud } from "./ShowcaseHud";
import { ShowcaseHashBackground } from "./ShowcaseHashBackground";
import { ShowcaseStore, ShowcaseStoreContext } from "./useShowcaseStore";
import { TIMELINE_STOPS } from "./data";
import { consumeArrivalFlag, peekGatewayEngine } from "@/components/gatewayEngine";

export function ShowcaseExperience() {
  const [store] = useState(() => new ShowcaseStore(TIMELINE_STOPS.length));
  const containerRef = useRef<HTMLDivElement>(null);
  // WebGL contexts can be reclaimed by the browser under GPU/memory pressure
  // (e.g. many other tabs competing for a shared context budget) — this is
  // outside our control, so instead of leaving the canvas permanently blank
  // when it happens, bump the key to force a full remount once the browser
  // signals the context is restorable.
  const [canvasKey, setCanvasKey] = useState(0);
  // The page used to assemble itself in visible stages on a cold load: the
  // DOM heading painted first, the WebGL canvas mounted at its default
  // 300x150 before resizing to full size, card images popped in one by one
  // as they decoded, and the background numeral re-flowed once its real
  // font arrived. Everything still loads in that order — it just does it
  // behind an opaque backdrop now, and the whole composed scene is revealed
  // in one move once the assets that cause visible pops are actually ready.
  // Only the 3D layer is gated, and only on the one thing that actually
  // pops: textures decoded and the canvas laid out at its real size (see
  // SceneReadySignal). The hex field renders immediately underneath, so
  // there's never a dead frame waiting on this.
  //
  // An earlier version also gated on the numeral's webfont, which meant a
  // slow CDN could hold the entire page on an empty gradient for over a
  // second and then drop everything in at once. The font now resolves
  // independently inside the background layer.
  const [sceneReady, setSceneReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const ready = sceneReady || timedOut;

  useEffect(() => {
    // Backstop, in case a texture never resolves — show the scene anyway.
    const failsafe = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(failsafe);
  }, []);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  // If we arrived through the gateway, its tide is still covering the
  // viewport. Clearing it is gated on the scene actually being rendered
  // rather than on a timer — a timer let it finish while this page was still
  // mounting, exposing a dead stretch of empty page between the tide leaving
  // and the cards arriving.
  const arrivedRef = useRef(false);
  const initedRef = useRef(false);
  useEffect(() => {
    if (!initedRef.current) {
      initedRef.current = true;
      arrivedRef.current = consumeArrivalFlag();
    }
    if (arrivedRef.current && ready) peekGatewayEngine()?.clearWhenReady();
  }, [ready]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let lastTouchX: number | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      store.applyWheel(e.deltaX, e.deltaY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        store.travelKey(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        store.travelKey(1);
      } else if (e.key === "Escape") {
        store.exitFocus();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchX = e.touches[0]?.clientX ?? null;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (lastTouchX === null) return;
      const x = e.touches[0]?.clientX ?? lastTouchX;
      store.applyWheel((lastTouchX - x) * 3, 0);
      lastTouchX = x;
    };
    const handleTouchEnd = () => {
      lastTouchX = null;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [store]);

  return (
    <ShowcaseStoreContext.Provider value={store}>
      {/* Deliberately transparent: the backdrop lives in page.tsx so it's
          part of the route's server HTML and is already on screen before
          this client-only component mounts. Painting it again here would
          just re-cover what's already correct. */}
      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-dvh overflow-hidden"
        style={{ touchAction: "none" }}
      >
        {/* Layer 1 — up immediately, needs no assets. */}
        <ShowcaseHashBackground />

        {/* Layer 2 — the cards, revealed together once genuinely ready,
            settling into a field that's already alive behind them. Keeping
            these two layers separate is what removes the "nothing, then
            everything at once" feel; the gradient backdrop above stays
            painted throughout, so no blank or white frame shows through. */}
        <div
          className="absolute inset-0"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "scale(1)" : "scale(1.012)",
            // Opacity lands fast so the cards feel present almost at once;
            // the settle runs a little longer and on its own curve, which
            // keeps it from reading as an abrupt cut without holding the
            // content back. Starting scale is small for the same reason —
            // a bigger one needs more time to travel.
            transition: "opacity 260ms ease-out, transform 460ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <Canvas
            key={canvasKey}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            camera={{ position: [0, 0.4, 8.6], fov: 42 }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, 1.5]}
            onCreated={({ gl }) => {
              const canvas = gl.domElement;
              let restoredAlready = false;
              let retryTimer: ReturnType<typeof setTimeout> | null = null;

              const remount = () => {
                if (restoredAlready) return;
                restoredAlready = true;
                setCanvasKey((k) => k + 1);
              };

              const handleLost = (e: Event) => {
                // Required so the browser knows we intend to recover rather
                // than treating this canvas as permanently dead — but in
                // practice, when the browser reclaims a context under GPU
                // pressure (many other tabs competing for a shared context
                // budget) it often never fires `webglcontextrestored` at all.
                // Waiting on that event alone can leave the page blank
                // indefinitely, so we proactively request a fresh context by
                // remounting the Canvas after a short delay regardless.
                e.preventDefault();
                retryTimer = setTimeout(remount, 400);
              };
              const handleRestored = () => {
                if (retryTimer) clearTimeout(retryTimer);
                remount();
              };
              canvas.addEventListener("webglcontextlost", handleLost, false);
              canvas.addEventListener("webglcontextrestored", handleRestored, false);
            }}
          >
            <ShowcaseScene onReady={handleSceneReady} />
          </Canvas>
          <ShowcaseHud />
        </div>
      </div>
    </ShowcaseStoreContext.Provider>
  );
}
