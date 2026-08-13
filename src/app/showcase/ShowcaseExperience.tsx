"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ShowcaseScene } from "./ShowcaseScene";
import { ShowcaseHud } from "./ShowcaseHud";
import { ShowcaseStore, ShowcaseStoreContext } from "./useShowcaseStore";
import { TIMELINE_STOPS } from "./data";

export function ShowcaseExperience() {
  const [store] = useState(() => new ShowcaseStore(TIMELINE_STOPS.length));
  const containerRef = useRef<HTMLDivElement>(null);
  // WebGL contexts can be reclaimed by the browser under GPU/memory pressure
  // (e.g. many other tabs competing for a shared context budget) — this is
  // outside our control, so instead of leaving the canvas permanently blank
  // when it happens, bump the key to force a full remount once the browser
  // signals the context is restorable.
  const [canvasKey, setCanvasKey] = useState(0);

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
      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-dvh overflow-hidden bg-surface"
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 82% 108%, rgba(254,203,51,0.16), rgba(0,0,0,0) 60%), radial-gradient(120% 90% at 10% -10%, rgba(254,203,51,0.1), rgba(0,0,0,0) 55%), #0c0c0c",
          }}
        />
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
          <ShowcaseScene />
        </Canvas>
        <ShowcaseHud />
      </div>
    </ShowcaseStoreContext.Provider>
  );
}
