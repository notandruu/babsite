"use client";

import { useEffect, useRef, useCallback, type MutableRefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const HEX = "0123456789abcdef";
const KEYWORDS = [
  "BLOCK", "HASH", "NONCE", "MERKLE", "SHA256", "CHAIN",
  "PROOF", "LEDGER", "NODE", "CONSENSUS", "MINING", "STAKE",
  "ETHER", "WEI", "GWEI", "GENESIS", "ORPHAN", "FORK",
  "SHARD", "LAYER2", "ROLLUP", "BRIDGE", "VAULT",
  "0xDEAD", "0xBEEF", "0xCAFE", "0xBAAD", "0xFACE", "0xC0DE",
];
function randomHex(len: number) {
  let s = "";
  for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)];
  return s;
}
function randomFragment() {
  const r = Math.random();
  if (r < 0.35) return randomHex(64);
  if (r < 0.55) return `0x${randomHex(40)}`;
  if (r < 0.70) return `#${Math.floor(Math.random() * 18_000_000)}`;
  if (r < 0.82) return `nonce:${randomHex(8)}`;
  if (r < 0.90) return KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
  return randomHex(32);
}
function buildLine(cols: number) {
  let line = "";
  while (line.length < cols) line += randomFragment() + " ";
  return line.slice(0, cols);
}

interface ThreeScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  logoGroup: THREE.Group;
  readCanvas: HTMLCanvasElement;
  readCtx: CanvasRenderingContext2D;
}

interface CampanileScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  campGroup: THREE.Group;
  readCanvas: HTMLCanvasElement;
  readCtx: CanvasRenderingContext2D;
}

// Flat typed arrays for particle morph — avoids GC pressure
interface MorphData {
  count: number;
  sx: Float32Array; sy: Float32Array;   // source canvas coords
  dx: Float32Array; dy: Float32Array;   // dest canvas coords
  r: Uint8Array; g: Uint8Array; b: Uint8Array;  // dest color
  chars: string[];                      // locked-in char at snapshot time
}

function makeLights(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xfff0cc, 5.5);
  key.position.set(10, 8, 12); scene.add(key);
  const fill = new THREE.DirectionalLight(0xfecb33, 0.5);
  fill.position.set(-8, 6, 8); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xff7700, 3.0);
  rim.position.set(-2, -4, -12); scene.add(rim);
  const top = new THREE.DirectionalLight(0xffffff, 1.2);
  top.position.set(0, 20, 4); scene.add(top);
}

export function HashMatrix({ scrollProgressRef }: { scrollProgressRef?: MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<string[]>([]);
  const dimsRef = useRef({ cols: 0, rows: 0, charW: 0, charH: 0 });
  const frameRef = useRef(0);
  const threeRef = useRef<ThreeScene | null>(null);
  const campRef = useRef<CampanileScene | null>(null);
  const rotRef = useRef({ x: 0, y: 0 });
  const spotRef = useRef({ x: -1, y: -1, active: false });
  const mountTimeRef = useRef(Date.now());
  // Particle morph snapshot — taken once when morph begins
  const morphRef = useRef<MorphData | null>(null);
  const morphSnappedRef = useRef(false);

  const buildThree = useCallback((cols: number, rows: number, pixelAspect: number) => {
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(cols, rows);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, pixelAspect, 0.1, 1000);
    camera.position.z = 19;
    makeLights(scene);
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);
    new GLTFLoader().load("/assets/blockchain-logo.glb", (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        const mesh = child as THREE.Mesh;
        const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const origColor = (src as THREE.MeshStandardMaterial).color?.clone() ?? new THREE.Color("#FECB33");
        mesh.material = new THREE.MeshStandardMaterial({ color: origColor, metalness: 0.9, roughness: 0.12 });
      });
      model.rotation.x = Math.PI / 2;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const faceDim = Math.max(size.x, size.z);
      const visibleWidth = 2 * Math.tan(27.5 * Math.PI / 180) * 19 * pixelAspect;
      model.scale.setScalar((visibleWidth * 0.7) / faceDim);
      const box2 = new THREE.Box3().setFromObject(model);
      const center2 = box2.getCenter(new THREE.Vector3());
      model.position.set(-center2.x, -center2.y + 0.5, -center2.z);
      logoGroup.add(model);
    });
    const readCanvas = document.createElement("canvas");
    readCanvas.width = cols; readCanvas.height = rows;
    const readCtx = readCanvas.getContext("2d")!;
    return { renderer, scene, camera, logoGroup, readCanvas, readCtx };
  }, []);

  const buildCampanile = useCallback((cols: number, rows: number, pixelAspect: number) => {
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(cols, rows);
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, pixelAspect, 0.1, 1000);
    camera.position.z = 19;
    makeLights(scene);
    const campGroup = new THREE.Group();
    scene.add(campGroup);
    new STLLoader().load("/assets/campanile.stl", (geometry) => {
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color: new THREE.Color("#FECB33"), metalness: 0.9, roughness: 0.12 })
      );
      mesh.rotation.x = -Math.PI / 2;
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const visibleHeight = 2 * Math.tan(27.5 * Math.PI / 180) * 19;
      const tallDim = Math.max(size.x, size.y, size.z);
      mesh.scale.setScalar((visibleHeight * 1.75) / tallDim);
      const box2 = new THREE.Box3().setFromObject(mesh);
      const center2 = box2.getCenter(new THREE.Vector3());
      mesh.position.set(-center2.x, -center2.y, -center2.z);
      campGroup.add(mesh);
    });
    const readCanvas = document.createElement("canvas");
    readCanvas.width = cols; readCanvas.height = rows;
    const readCtx = readCanvas.getContext("2d")!;
    return { renderer, scene, camera, campGroup, readCanvas, readCtx };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const FONT_SIZE = 9, LINE_HEIGHT = 11;

    function resize() {
      const parent = canvas!.parentElement!;
      const w = parent.clientWidth, h = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      ctx.font = `${FONT_SIZE}px "Courier New", monospace`;
      const charW = ctx.measureText("M").width;
      const charH = LINE_HEIGHT;
      const cols = Math.ceil(w / charW);
      const rows = Math.ceil(h / charH);
      dimsRef.current = { cols, rows, charW, charH };
      linesRef.current = Array.from({ length: rows }, () => buildLine(cols));
      // Invalidate any existing snapshot when grid changes
      morphRef.current = null;
      morphSnappedRef.current = false;
      threeRef.current?.renderer.dispose();
      threeRef.current = buildThree(cols, rows, w / h);
      campRef.current?.renderer.dispose();
      campRef.current = buildCampanile(cols, rows, w / h);
    }

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => { spotRef.current = { x: e.clientX, y: e.clientY, active: true }; };
    const onLeave = () => { spotRef.current.active = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let heat = new Float32Array(0);

    function buildMorphSnapshot(
      logoPixels: Uint8ClampedArray,
      campPixels: Uint8ClampedArray,
      cols: number, rows: number,
      charW: number, charH: number,
      lines: string[]
    ): MorphData {
      // Collect lit cells from each shape
      const logoLit: { x: number; y: number; col: number; row: number }[] = [];
      const campLit: { x: number; y: number; r: number; g: number; b: number }[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pi = (row * cols + col) * 4;
          if (logoPixels[pi + 3] > 20)
            logoLit.push({ x: col * charW, y: row * charH, col, row });
          if (campPixels[pi + 3] > 20) {
            const boost = 1.8;
            campLit.push({
              x: col * charW, y: row * charH,
              r: Math.min(255, Math.round(campPixels[pi]     * boost)),
              g: Math.min(255, Math.round(campPixels[pi + 1] * boost)),
              b: Math.min(255, Math.round(campPixels[pi + 2] * boost)),
            });
          }
        }
      }

      // Shuffle camp so logo cells get random camp destinations
      for (let i = campLit.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [campLit[i], campLit[j]] = [campLit[j], campLit[i]];
      }

      // Only paired particles — every logo cell maps to a camp cell (wrap around)
      // No extras: avoids off-screen clutter
      const count = logoLit.length;
      const sx = new Float32Array(count); const sy = new Float32Array(count);
      const dx = new Float32Array(count); const dy = new Float32Array(count);
      const r = new Uint8Array(count); const g = new Uint8Array(count); const b = new Uint8Array(count);
      const chars: string[] = new Array(count);

      for (let i = 0; i < count; i++) {
        const src = logoLit[i];
        const dst = campLit[i % campLit.length]; // wrap: multiple logo → same camp cell is fine
        sx[i] = src.x; sy[i] = src.y;
        dx[i] = dst.x; dy[i] = dst.y;
        r[i] = dst.r; g[i] = dst.g; b[i] = dst.b;
        chars[i] = lines[src.row]?.[src.col] ?? HEX[Math.floor(Math.random() * 16)];
      }

      return { count, sx, sy, dx, dy, r, g, b, chars };
    }

    function animate() {
      const { cols, rows, charW, charH } = dimsRef.current;
      const three = threeRef.current;
      const camp  = campRef.current;

      const mountAge = Date.now() - mountTimeRef.current;
      const mountFade = Math.min(1, Math.max(0, (mountAge - 400) / 900));

      const parent  = canvas!.parentElement!;
      const parentW = parent.clientWidth;
      const parentH = parent.clientHeight;
      const sp = scrollProgressRef?.current ?? 0;

      const aspect   = parentW / parentH;
      const halfVisW = Math.tan(27.5 * Math.PI / 180) * 19 * aspect;
      const halfVisH = Math.tan(27.5 * Math.PI / 180) * 19;

      // Cursor tilt
      const spot = spotRef.current;
      if (spot.active) {
        rotRef.current.y += (((spot.x / window.innerWidth)  - 0.5) *  0.25 - rotRef.current.y) * 0.04;
        rotRef.current.x += (((spot.y / window.innerHeight) - 0.5) * -0.15 - rotRef.current.x) * 0.04;
      } else {
        rotRef.current.y += (0 - rotRef.current.y) * 0.02;
        rotRef.current.x += (0 - rotRef.current.x) * 0.02;
      }

      // ── Logo 3D render ────────────────────────────────────────────────────
      if (three) {
        const heroX = ((0.82 * parentW - 12) / parentW - 0.5) * halfVisW * 2;
        three.logoGroup.position.x = heroX;
        three.logoGroup.position.y = 0;
        three.logoGroup.scale.setScalar(three.logoGroup.scale.x + (1 - three.logoGroup.scale.x) * 0.055);
        three.logoGroup.rotation.y = Math.PI / 9 + rotRef.current.y;
        three.logoGroup.rotation.x = rotRef.current.x;
        three.renderer.render(three.scene, three.camera);
        three.readCtx.clearRect(0, 0, cols, rows);
        three.readCtx.drawImage(three.renderer.domElement, 0, 0);
      }

      // ── Campanile 3D render — always at final position ────────────────────
      if (camp) {
        camp.campGroup.position.x = halfVisW * 0.55;
        camp.campGroup.position.y = -halfVisH;
        camp.campGroup.rotation.y = Math.PI / 12 + rotRef.current.y * 0.5;
        camp.campGroup.rotation.x = rotRef.current.x * 0.3;
        camp.renderer.render(camp.scene, camp.camera);
        camp.readCtx.clearRect(0, 0, cols, rows);
        camp.readCtx.drawImage(camp.renderer.domElement, 0, 0);
      }

      // ── Character grid mutation ───────────────────────────────────────────
      const lines = linesRef.current;
      if (heat.length < cols * rows) heat = new Float32Array(cols * rows);
      for (let i = 0; i < Math.floor(cols * rows * 0.004); i++) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (lines[row]) {
          const ch = lines[row].split("");
          ch[col] = HEX[Math.floor(Math.random() * 16)];
          lines[row] = ch.join("");
          heat[row * cols + col] = 1.0;
        }
      }
      for (let i = 0; i < cols * rows; i++) {
        if (heat[i] > 0) heat[i] = Math.max(0, heat[i] - 0.015);
      }

      // ── Pixel sampling ────────────────────────────────────────────────────
      let logoPixels: Uint8ClampedArray | null = null;
      let campPixels: Uint8ClampedArray | null = null;
      if (three) try { logoPixels = three.readCtx.getImageData(0, 0, cols, rows).data; } catch (_) {}
      if (camp)  try { campPixels = camp.readCtx.getImageData(0, 0, cols, rows).data;  } catch (_) {}

      // Reset snapshot when user scrolls back to start
      if (sp < 0.1) {
        morphSnappedRef.current = false;
        morphRef.current = null;
      }

      // Take snapshot once when morph begins — requires both pixel sets ready
      if (sp >= 0.35 && !morphSnappedRef.current && logoPixels && campPixels) {
        morphSnappedRef.current = true;
        morphRef.current = buildMorphSnapshot(logoPixels, campPixels, cols, rows, charW, charH, lines);
      }

      // ── Render ────────────────────────────────────────────────────────────
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, parentW, parentH);
      ctx.textBaseline = "top";
      ctx.font = `${FONT_SIZE}px "Courier New", monospace`;

      const rawT = morphRef.current ? Math.min(1, Math.max(0, (sp - 0.35) / 0.65)) : 0;
      const t    = rawT * rawT * (3 - 2 * rawT); // smoothstep

      if (sp < 0.35 || !morphRef.current) {
        // ── Pre-morph: logo from live pixels ──────────────────────────────
        if (logoPixels && mountFade > 0.01) {
          for (let row = 0; row < rows; row++) {
            const line = lines[row];
            if (!line) continue;
            for (let col = 0; col < cols; col++) {
              const ch = line[col];
              if (!ch || ch === " ") continue;
              const pi = (row * cols + col) * 4;
              if (logoPixels[pi + 3] <= 20) continue;
              const hv = heat[col + row * cols] ?? 0;
              const boost = 1.8;
              const rb = Math.min(255, Math.round(logoPixels[pi]     * boost));
              const gb = Math.min(255, Math.round(logoPixels[pi + 1] * boost));
              const bb = Math.min(255, Math.round(logoPixels[pi + 2] * boost));
              const brightness = (rb + gb + bb) / (3 * 255);
              ctx.fillStyle = `rgba(${rb},${gb},${bb},${Math.min(1, (0.88 + brightness * 0.12 + hv * 0.05) * mountFade)})`;
              ctx.fillText(ch, col * charW, row * charH);
            }
          }
        }
      } else if (t < 1) {
        // ── Particle morph: same chars travel logo → campanile ────────────
        const morph = morphRef.current;
        for (let i = 0; i < morph.count; i++) {
          const x = morph.sx[i] + (morph.dx[i] - morph.sx[i]) * t;
          const y = morph.sy[i] + (morph.dy[i] - morph.sy[i]) * t;
          ctx.fillStyle = `rgba(${morph.r[i]},${morph.g[i]},${morph.b[i]},0.9)`;
          ctx.fillText(morph.chars[i], x, y);
        }
      } else {
        // ── Post-morph: campanile from live pixels (full shape) ───────────
        if (campPixels) {
          for (let row = 0; row < rows; row++) {
            const line = lines[row];
            if (!line) continue;
            for (let col = 0; col < cols; col++) {
              const ch = line[col];
              if (!ch || ch === " ") continue;
              const pi = (row * cols + col) * 4;
              if (campPixels[pi + 3] <= 20) continue;
              const hv = heat[col + row * cols] ?? 0;
              const boost = 1.8;
              const rb = Math.min(255, Math.round(campPixels[pi]     * boost));
              const gb = Math.min(255, Math.round(campPixels[pi + 1] * boost));
              const bb = Math.min(255, Math.round(campPixels[pi + 2] * boost));
              const brightness = (rb + gb + bb) / (3 * 255);
              ctx.fillStyle = `rgba(${rb},${gb},${bb},${Math.min(1, 0.88 + brightness * 0.12 + hv * 0.05)})`;
              ctx.fillText(ch, col * charW, row * charH);
            }
          }
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      threeRef.current?.renderer.dispose();
      campRef.current?.renderer.dispose();
    };
  }, [buildThree, buildCampanile]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
