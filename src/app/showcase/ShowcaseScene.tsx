"use client";

import { Suspense, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TIMELINE_STOPS, type TimelineStop } from "./data";
import { CARD_SPACING, useShowcaseStoreContext, type ShowcaseSnapshot } from "./useShowcaseStore";
import { CARD, COLOR, FONT, TYPE, computeCardLayout, pickTitleFontSize } from "./theme";

// Same for every card by construction (see computeCardLayout) — computed
// once rather than per-card.
const LAYOUT = computeCardLayout();
const TEXT_MAX_WIDTH = CARD.width - CARD.padding * 2;
const TEXT_LEFT_X = -CARD.width / 2 + CARD.padding;
const FRONT_Z = CARD.depth / 2 + 0.01;

// How far a card rises (world Y) when it becomes the focused one — shared
// between TimelineCard's lift animation and the FOCUS_CAMERA derivation
// below, since the latter needs to know exactly where the lifted card sits.
const FOCUSED_CARD_LIFT = 0.18;
// Must match the <Canvas camera={{ fov: ... }}> prop in ShowcaseExperience.tsx.
const CAMERA_FOV_DEG = 42;

/**
 * Solves for the focused-mode camera's Y position and distance that put the
 * card's top/bottom edges at exact, chosen fractions of the viewport height
 * — not eyeballed. Because Three.js's `fov` is always the *vertical* field
 * of view, this fraction is independent of viewport aspect ratio: it holds
 * on any screen width once solved for a given fov.
 *
 * Given camera looks level (lookAt.y === camera.position.y) at a card
 * centered at world X with vertical half-extent `h` at the render distance:
 *   topOfFrameY = camera.y + h
 *   fractionFromTop(worldY) = (topOfFrameY - worldY) / (2h)
 * Solving fractionFromTop(cardTop) = topMargin and
 * fractionFromTop(cardBottom) = bottomTarget simultaneously for h and
 * camera.y (see the two equations below) pins down both.
 */
function solveFocusCamera(topMargin: number, bottomTarget: number) {
  const cardTop = FOCUSED_CARD_LIFT + CARD.height / 2;
  const cardBottom = FOCUSED_CARD_LIFT - CARD.height / 2;
  const h = (cardTop - cardBottom) / ((bottomTarget - topMargin) * 2);
  const topOfFrameY = cardTop + topMargin * 2 * h;
  const y = topOfFrameY - h;
  const distance = h / Math.tan((CAMERA_FOV_DEG / 2) * (Math.PI / 180));
  return { y, distance };
}

// Card top sits 8% down from the top of the frame; card bottom sits at 60%,
// leaving a guaranteed 40% of the viewport for the DOM description/CTA
// panel below it (showcase.module.css's --sc-card-bottom must match the
// 60% here — see the comment on .focusInfo).
const FOCUS_CAMERA = solveFocusCamera(0.08, 0.6);

function useSnapshot(): ShowcaseSnapshot {
  const store = useShowcaseStoreContext();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

/** Deterministic pseudo-random value in [-1, 1] — stable per input, no state
 * or Math.random(), so a card's orientation quirk never jitters frame to
 * frame or re-randomizes on remount. */
function pseudoRandom(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

// Track runs the full length of the card row plus some overrun on both ends.
const TRACK_Y = -CARD.height / 2 - 0.24;
const TRACK_DOT_SPACING = 0.34;
const TRACK_OVERRUN = CARD_SPACING * 0.6;

/** Ground-level dotted timeline track under the cards, with a year label at
 * each stop — instanced so the ~120 tick dots are one draw call. */
function TimelineTrack() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dotPositions = useMemo(() => {
    const start = -TRACK_OVERRUN;
    const end = (TIMELINE_STOPS.length - 1) * CARD_SPACING + TRACK_OVERRUN;
    const count = Math.floor((end - start) / TRACK_DOT_SPACING);
    return Array.from({ length: count + 1 }, (_, i) => start + i * TRACK_DOT_SPACING);
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    dotPositions.forEach((x, i) => {
      dummy.position.set(x, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [dotPositions]);

  return (
    <group position={[0, TRACK_Y, FRONT_Z - 0.04]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, dotPositions.length]}>
        <circleGeometry args={[0.013, 8]} />
        <meshBasicMaterial color={COLOR.white} transparent opacity={0.22} toneMapped={false} />
      </instancedMesh>
      {TIMELINE_STOPS.map((stop, i) => (
        <Text
          key={stop.id}
          font={FONT.sans}
          position={[i * CARD_SPACING, -0.15, 0]}
          fontSize={0.09}
          anchorX="center"
          anchorY="middle"
          color={COLOR.white}
          fillOpacity={0.5}
        >
          {stop.year}
        </Text>
      ))}
    </group>
  );
}

/**
 * Offscreen soft-radial-glow + fine-grain texture generator. Two changes
 * from an earlier flat-linear-gradient version, both from the same root
 * cause: a hard diagonal light-to-dark sweep read as cheap, *and* is what
 * made dark ink text unreadable wherever it landed in the dark corner. A
 * soft off-center radial glow (closer to the diffuse, low-contrast glow
 * look of things like Apple Intelligence's UI) in a narrow luminance range
 * fixes both — text stays legible everywhere because the surface never
 * gets that dark. Resolution is also 1024 (was 384): at 384px the grain
 * was coarse enough to stretch into visible blocky lines once the focus
 * view zoomed in close, rather than reading as fine texture.
 */
function buildSkinTexture(stops: Array<[number, string]>, grainStrength: number) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(
    size * 0.42,
    size * 0.36,
    0,
    size * 0.42,
    size * 0.36,
    size * 0.85
  );
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

/** Soft gold glow for the active card — grain kept fine/low-strength now
 * that it's rendered at 4x the resolution (see buildSkinTexture). */
function useActiveSkinTexture() {
  return useMemo(() => buildSkinTexture(COLOR.activeSkinStops, 4), []);
}

/** Subtle texture for inactive cards so they aren't a completely flat fill. */
function useInactiveSkinTexture() {
  return useMemo(() => buildSkinTexture(COLOR.inactiveSkinStops, 3), []);
}

function CardScreen({ stop }: { stop: TimelineStop }) {
  const texture = useTexture(stop.image as string);

  const { width, height } = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    const maxW = CARD.screenMaxWidth;
    const maxH = LAYOUT.screenHeight;
    const aspect = img?.width && img?.height ? img.width / img.height : maxW / maxH;
    let w = maxW;
    let h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    return { width: w, height: h };
  }, [texture]);

  return (
    <group position={[0, LAYOUT.screenCenterY, FRONT_Z - 0.006]}>
      <mesh>
        <planeGeometry args={[CARD.screenMaxWidth, LAYOUT.screenHeight]} />
        <meshBasicMaterial color={COLOR.screenBacking} toneMapped={false} />
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
    <group position={[0, LAYOUT.screenCenterY, FRONT_Z - 0.006]}>
      <mesh>
        <planeGeometry args={[CARD.screenMaxWidth, LAYOUT.screenHeight]} />
        <meshBasicMaterial color={COLOR.screenBacking} toneMapped={false} />
      </mesh>
      <Text
        font={FONT.sans}
        fontSize={TYPE.glyph.size}
        lineHeight={TYPE.glyph.lineHeight}
        color={COLOR.gold}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.006]}
      >
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
  const hoveredRef = useRef(false);
  // Local cursor offset within this card's own face (uv space, recentered to
  // -0.5..0.5), not the global viewport pointer — so a card tilts toward
  // wherever on IT the cursor actually sits, the same read as vanilla-tilt.js
  // on a DOM card, rather than every hovered card reacting identically to
  // one global cursor position.
  const hoverLocalRef = useRef({ x: 0, y: 0 });

  const isActive = snap.activeIndex === index;
  const isThisFocused = snap.focusedIndex === index;
  // Both the "front/active" gold skin and the close-up focus view put light
  // text over a bright surface, so both states need dark text.
  const useDarkText = isActive || isThisFocused;
  // Fluid title size: the largest step that keeps this specific title on one
  // line, so longer titles shrink instead of wrapping into the reserved
  // (single-line-height) slot above the screen. See theme.ts.
  const titleFontSize = useMemo(() => pickTitleFontSize(stop.title, TEXT_MAX_WIDTH), [stop.title]);
  // Fixed per-card orientation quirk layered on top of the distance-based
  // fan below, so neighboring cards read as individually placed rather than
  // a uniform mirrored curve — deterministic (not Math.random()) so it's
  // stable across renders instead of reshuffling.
  const orientationBias = useMemo(
    () => ({
      yaw: pseudoRandom(index * 3.1 + 1) * 0.22,
      roll: pseudoRandom(index * 7.7 + 4) * 0.05,
    }),
    [index]
  );

  useFrame((state, delta) => {
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
    // Three tilt regimes, in priority order: focused (tilts toward the
    // global cursor, since it fills most of the view), hovered-while-
    // browsing (tilts toward the cursor's position on that specific card's
    // own face — the classic vanilla-tilt.js read, "the card faces you"),
    // and idle (the static per-card fan + orientation quirk from render).
    const focusTiltMax = 0.1; // ~5.7°, subtle — card already fills the frame
    const hoverTiltMax = 0.16; // ~9.2°, noticeable but not disorienting
    const baseFan = offset * -0.16;
    let tiltX: number;
    let tiltY: number;
    let tiltZ: number;
    if (liveIsFocused) {
      tiltX = -state.pointer.y * focusTiltMax;
      tiltY = state.pointer.x * focusTiltMax;
      tiltZ = 0;
    } else if (hoveredRef.current) {
      const local = hoverLocalRef.current;
      tiltX = -local.y * hoverTiltMax;
      tiltY = local.x * hoverTiltMax;
      tiltZ = orientationBias.roll * 0.3;
    } else {
      tiltX = 0;
      tiltY = THREE.MathUtils.clamp(baseFan + orientationBias.yaw, -0.85, 0.85);
      tiltZ = orientationBias.roll;
    }
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, tiltX, 9, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, tiltY, 9, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, tiltZ, 8, delta);

    const liftTarget = liveIsFocused ? FOCUSED_CARD_LIFT : 0;
    group.position.y = THREE.MathUtils.damp(group.position.y, liftTarget, 4.5, delta);

    if (boxMatRef.current) {
      const targetEmissive = live.activeIndex === index && !live.isFocused ? 0.22 : 0;
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
        args={[CARD.width, CARD.height, CARD.depth]}
        radius={CARD.radius}
        smoothness={3}
        onClick={(e) => {
          e.stopPropagation();
          store.toggleFocus(index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          hoveredRef.current = true;
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          // World-space offset from the card's own center, normalized to
          // roughly -1..1 across its face — not e.uv, whose V-axis
          // orientation on RoundedBox's generated geometry doesn't match
          // "up" here and was flipping the tilt vertically.
          const group = groupRef.current;
          if (!group) return;
          const localX = (e.point.x - group.position.x) / (CARD.width / 2);
          const localY = (e.point.y - group.position.y) / (CARD.height / 2);
          hoverLocalRef.current = {
            x: THREE.MathUtils.clamp(localX, -1, 1),
            y: THREE.MathUtils.clamp(localY, -1, 1),
          };
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          hoveredRef.current = false;
        }}
      >
        <meshStandardMaterial
          ref={boxMatRef}
          color={isActive ? COLOR.gold : COLOR.surface}
          map={isActive ? activeSkin : inactiveSkin}
          roughness={0.68}
          metalness={0.12}
          emissive={new THREE.Color(COLOR.gold)}
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

      {/* Text hierarchy matches the main site's convention: white at a few
          fixed opacity steps, full-strength surface-black when on the gold
          skin (same pairing as the site's bg-gold CTA buttons). */}
      <Text
        font={FONT.sans}
        position={[TEXT_LEFT_X, LAYOUT.kickerY, FRONT_Z]}
        fontSize={TYPE.kicker.size}
        lineHeight={TYPE.kicker.lineHeight}
        anchorX="left"
        anchorY="middle"
        color={useDarkText ? COLOR.surface : COLOR.white}
        fillOpacity={useDarkText ? 0.75 : TYPE.kicker.fillOpacity}
        letterSpacing={TYPE.kicker.letterSpacing}
      >
        {stop.kicker}
      </Text>
      <Text
        font={FONT.sans}
        position={[TEXT_LEFT_X, LAYOUT.titleY, FRONT_Z]}
        fontSize={titleFontSize}
        lineHeight={TYPE.title.lineHeight}
        anchorX="left"
        anchorY="middle"
        color={useDarkText ? COLOR.surface : COLOR.white}
        fillOpacity={TYPE.title.fillOpacity}
        maxWidth={TEXT_MAX_WIDTH}
      >
        {stop.title}
      </Text>

      <group position={[TEXT_LEFT_X, LAYOUT.tagsY, FRONT_Z]}>
        {stop.tags.slice(0, 3).map((tag, i) => (
          <Text
            key={tag}
            font={FONT.sans}
            position={[i * 0.98, 0, 0]}
            fontSize={TYPE.tag.size}
            lineHeight={TYPE.tag.lineHeight}
            anchorX="left"
            anchorY="middle"
            color={useDarkText ? COLOR.surface : COLOR.white}
            fillOpacity={useDarkText ? 0.6 : TYPE.tag.fillOpacity}
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
      // Solved (not eyeballed) so the focused card's top/bottom edges land
      // at exact, known fractions of the viewport height — see the
      // derivation in FOCUS_CAMERA above. A prior version guessed this
      // framing and got it wrong (~72% instead of the assumed 66%), which
      // is why the focus description text was overlapping the card's own
      // bottom tags.
      const targetX = snap.focusedIndex * CARD_SPACING;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, FOCUS_CAMERA.y, 5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, FOCUS_CAMERA.distance, 5, delta);
      camera.lookAt(targetX, FOCUS_CAMERA.y, 0);
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
      <TimelineTrack />

      {TIMELINE_STOPS.map((stop, i) => (
        <TimelineCard key={stop.id} stop={stop} index={i} activeSkin={activeSkin} inactiveSkin={inactiveSkin} />
      ))}
    </>
  );
}
