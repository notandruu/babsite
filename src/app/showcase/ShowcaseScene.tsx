"use client";

import { Suspense, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TIMELINE_STOPS, type TimelineStop } from "./data";
import { CARD_SPACING, useShowcaseStoreContext, type ShowcaseSnapshot } from "./useShowcaseStore";

const CARD_WIDTH = 3.2;
const CARD_HEIGHT = 1.9;
const CARD_DEPTH = 0.16;
// RoundedBox bevel radius must stay under half the smallest dimension (depth here)
// or the geometry degenerates — that produced invisible cards and crashed the
// WebGL context entirely, so keep this comfortably below CARD_DEPTH / 2 (0.08).
const CARD_RADIUS = 0.055;

// The inset "screen" is a bounding box, not a forced aspect ratio — images are
// contain-fit inside it (see CardScreen) so logos/screenshots never stretch.
// Sized + positioned so kicker/title above and tags below both keep clear of it.
const SCREEN_MAX_WIDTH = 1.6;
const SCREEN_MAX_HEIGHT = 1.05;
const SCREEN_CENTER_Y = -0.08;

const FONT_REGULAR = "/fonts/JetBrainsMono-Regular.ttf";
const FONT_MEDIUM = "/fonts/JetBrainsMono-Medium.ttf";

function useSnapshot(): ShowcaseSnapshot {
  const store = useShowcaseStoreContext();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/** Offscreen gradient + grain texture generator — grain breaks up gradient
 * banding so the card material reads as a brushed/printed surface rather
 * than a flat CSS-gradient rectangle. */
function buildSkinTexture(stops: Array<[number, string]>, grainStrength: number) {
  const size = 384;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, size * 0.25, size);
  for (const [offset, color] of stops) grad.addColorStop(offset, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  if (grainStrength > 0) {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * grainStrength;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Muted brass/bronze skin for the active card — deliberately less saturated
 * than a literal "gold" to avoid reading as plastic/toy-like. */
function useActiveSkinTexture() {
  return useMemo(
    () =>
      buildSkinTexture(
        [
          [0, "#e8c874"],
          [0.5, "#c99a3d"],
          [1, "#2f2210"],
        ],
        10
      ),
    []
  );
}

/** Subtle texture for inactive cards so they aren't a completely flat fill. */
function useInactiveSkinTexture() {
  return useMemo(
    () =>
      buildSkinTexture(
        [
          [0, "#221c15"],
          [0.6, "#181310"],
          [1, "#0e0b09"],
        ],
        6
      ),
    []
  );
}

function CardScreen({ stop }: { stop: TimelineStop }) {
  const texture = useTexture(stop.image as string);

  const { width, height } = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : SCREEN_MAX_WIDTH / SCREEN_MAX_HEIGHT;
    let w = SCREEN_MAX_WIDTH;
    let h = w / aspect;
    if (h > SCREEN_MAX_HEIGHT) {
      h = SCREEN_MAX_HEIGHT;
      w = h * aspect;
    }
    return { width: w, height: h };
  }, [texture]);

  return (
    <group position={[0, SCREEN_CENTER_Y, CARD_DEPTH / 2 + 0.004]}>
      <mesh>
        <planeGeometry args={[SCREEN_MAX_WIDTH, SCREEN_MAX_HEIGHT]} />
        <meshBasicMaterial color="#0c0906" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CardGlyphScreen({ glyph }: { glyph: string }) {
  return (
    <group position={[0, SCREEN_CENTER_Y, CARD_DEPTH / 2 + 0.004]}>
      <mesh>
        <planeGeometry args={[SCREEN_MAX_WIDTH, SCREEN_MAX_HEIGHT]} />
        <meshBasicMaterial color="#0c0906" toneMapped={false} />
      </mesh>
      <Text font={FONT_MEDIUM} fontSize={0.42} color="#fecb33" anchorX="center" anchorY="middle" position={[0, 0, 0.006]}>
        {glyph}
      </Text>
    </group>
  );
}

function TimelineCard({
  stop,
  index,
  activeSkin,
  inactiveSkin,
}: {
  stop: TimelineStop;
  index: number;
  activeSkin: THREE.CanvasTexture | null;
  inactiveSkin: THREE.CanvasTexture | null;
}) {
  const store = useShowcaseStoreContext();
  const snap = useSnapshot();
  const groupRef = useRef<THREE.Group>(null);
  const boxMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const isActive = snap.activeIndex === index;
  const isThisFocused = snap.focusedIndex === index;
  // Both the "front/active" gold skin and the close-up focus view put light
  // text over a bright surface, so both states need dark text.
  const useDarkText = isActive || isThisFocused;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const live = store.getSnapshot();
    const liveIsFocused = live.focusedIndex === index;
    const dimmed = live.isFocused && !liveIsFocused;

    // Different settle speeds per property — uniform damping on everything is
    // what makes procedural motion read as robotic. Rotation catches up
    // fastest (it's the "look at me" cue), scale lags slightly (weight),
    // lift is the slowest/heaviest.
    const targetScale = dimmed ? 0.0001 : 1;
    group.scale.x = THREE.MathUtils.damp(group.scale.x, targetScale, 5, delta);
    group.scale.y = group.scale.x;
    group.scale.z = group.scale.x;

    const cardWorldX = index * CARD_SPACING;
    const offset = cardWorldX - store.trackX;
    const curveTarget = liveIsFocused ? 0 : THREE.MathUtils.clamp(offset * -0.16, -0.6, 0.6);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, curveTarget, 7, delta);

    const liftTarget = liveIsFocused ? 0.18 : 0;
    group.position.y = THREE.MathUtils.damp(group.position.y, liftTarget, 4.5, delta);

    if (boxMatRef.current) {
      const targetEmissive = live.activeIndex === index && !live.isFocused ? 0.4 : 0;
      boxMatRef.current.emissiveIntensity = THREE.MathUtils.damp(
        boxMatRef.current.emissiveIntensity,
        targetEmissive,
        8,
        delta
      );
    }
  });

  return (
    <group ref={groupRef} position={[index * CARD_SPACING, 0, 0]}>
      <RoundedBox
        args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]}
        radius={CARD_RADIUS}
        smoothness={3}
        onClick={(e) => {
          e.stopPropagation();
          store.toggleFocus(index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <meshStandardMaterial
          ref={boxMatRef}
          color={isActive ? "#c99a3d" : "#171310"}
          map={isActive ? activeSkin : inactiveSkin}
          roughness={0.55}
          metalness={0.2}
          emissive={new THREE.Color("#ffb23d")}
          emissiveIntensity={0}
        />
      </RoundedBox>

      <Suspense fallback={null}>
        {stop.image ? (
          <CardScreen stop={stop} />
        ) : (
          <CardGlyphScreen glyph={stop.type === "cta" ? "→" : stop.year} />
        )}
      </Suspense>

      <Text
        font={FONT_REGULAR}
        position={[-CARD_WIDTH / 2 + 0.2, CARD_HEIGHT / 2 - 0.18, CARD_DEPTH / 2 + 0.01]}
        fontSize={0.086}
        anchorX="left"
        anchorY="middle"
        color={useDarkText ? "#2b1a10" : "#c7b6a2"}
        letterSpacing={0.06}
      >
        {stop.kicker}
      </Text>
      <Text
        font={FONT_MEDIUM}
        position={[-CARD_WIDTH / 2 + 0.2, CARD_HEIGHT / 2 - 0.4, CARD_DEPTH / 2 + 0.01]}
        fontSize={0.165}
        anchorX="left"
        anchorY="middle"
        color={useDarkText ? "#221407" : "#f5ead9"}
        maxWidth={CARD_WIDTH - 0.4}
      >
        {stop.title}
      </Text>

      <group position={[-CARD_WIDTH / 2 + 0.2, -CARD_HEIGHT / 2 + 0.17, CARD_DEPTH / 2 + 0.01]}>
        {stop.tags.slice(0, 3).map((tag, i) => (
          <Text
            key={tag}
            font={FONT_REGULAR}
            position={[i * 0.98, 0, 0]}
            fontSize={0.07}
            anchorX="left"
            anchorY="middle"
            color={useDarkText ? "#3a2712" : "#b7a68f"}
          >
            {tag}
          </Text>
        ))}
      </group>
    </group>
  );
}

function CameraRig() {
  const store = useShowcaseStoreContext();
  const { camera } = useThree();

  useFrame((state, delta) => {
    /* eslint-disable react-hooks/immutability -- R3F's `camera` from
       useThree() is the live three.js Camera instance; per-frame mutation
       (not React state) is the documented R3F pattern for driving it
       without triggering a re-render every frame. */
    const snap = store.getSnapshot();
    if (snap.focusedIndex !== null) {
      // Framed so the card sits in the upper ~60% of the viewport, leaving
      // deliberate room below for the DOM description/CTA panel — at the
      // previous closer framing the card's bottom edge landed at ~86% down
      // the viewport, which is why the focus description text was
      // overlapping the card's own bottom tags.
      const targetX = snap.focusedIndex * CARD_SPACING;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, -0.05, 5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 4.2, 5, delta);
      camera.lookAt(targetX, -0.05, 0);
    } else {
      const targetX = store.trackX;
      const px = state.pointer.x;
      const py = state.pointer.y;
      // x tracks trackX tightly (near-instant) so wheel input feels
      // immediate — the "smooth glide" belongs entirely to the velocity
      // decay in the store, not to lag between trackX and the camera.
      // Lagging the camera on top of that just reads as input latency.
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX + px * 0.4, 10, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.38 + py * 0.2, 5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 8.6, 5, delta);
      camera.lookAt(targetX + px * 0.15, 0.1, 0);
    }
    /* eslint-enable react-hooks/immutability */
  });

  return null;
}

function PhysicsDriver() {
  const store = useShowcaseStoreContext();
  useFrame((_, delta) => {
    store.tick(delta * 1000);
  });
  return null;
}

export function ShowcaseScene() {
  // Shared across all cards — only the active card ever samples the active
  // skin, so one texture each (not one per card) keeps the GPU footprint down.
  const activeSkin = useActiveSkinTexture();
  const inactiveSkin = useInactiveSkinTexture();

  return (
    <>
      <ambientLight intensity={0.6} color="#fff2d8" />
      <directionalLight position={[3, 4, 5]} intensity={1.5} color="#fff6e5" />
      <directionalLight position={[-4, -2, 3]} intensity={0.45} color="#fecb33" />
      <pointLight position={[0, 1.5, 4]} intensity={0.4} color="#ffb23d" />

      <PhysicsDriver />
      <CameraRig />

      {TIMELINE_STOPS.map((stop, i) => (
        <TimelineCard key={stop.id} stop={stop} index={i} activeSkin={activeSkin} inactiveSkin={inactiveSkin} />
      ))}
    </>
  );
}
