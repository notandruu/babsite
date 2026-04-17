"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* ── Blockchain text ── */
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
  readCanvas: HTMLCanvasElement; // 2D canvas to read pixels from
  readCtx: CanvasRenderingContext2D;
}

export function HashMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<string[]>([]);
  const dimsRef = useRef({ cols: 0, rows: 0, charW: 0, charH: 0 });
  const frameRef = useRef(0);
  const threeRef = useRef<ThreeScene | null>(null);
  const rotRef = useRef({ x: 0, y: 0 }); // current rotation
  const dragRef = useRef({ down: false, lastX: 0, lastY: 0 });
  const spotRef = useRef({ x: -1, y: -1, active: false });

  /* ── Build Three.js offscreen scene ── */
  const buildThree = useCallback((cols: number, rows: number) => {
    // Render at character-grid resolution — each pixel = one character cell
    const W = cols;
    const H = rows;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 1000);
    camera.position.z = 19;

    // Lights — key, fill, rim for depth + shadow contrast
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xfff5d6, 3.5);
    key.position.set(5, 10, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfecb33, 1.4);
    fill.position.set(-8, -2, 5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffa040, 1.2);
    rim.position.set(2, -10, -6);
    scene.add(rim);

    // Load GLB logo
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load("/assets/blockchain-logo.glb", (gltf) => {
      const model = gltf.scene;

      // Apply metallic gold/orange materials
      model.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return;
        const mesh = child as THREE.Mesh;
        const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const origColor = (src as THREE.MeshStandardMaterial).color?.clone() ?? new THREE.Color("#FECB33");
        mesh.material = new THREE.MeshStandardMaterial({
          color: origColor,
          metalness: 0.9,
          roughness: 0.12,
        });
      });

      // Center, fit to view, orient facing camera
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      // GLB lies flat (X-Z plane, Y is thickness) — rotate to face camera
      model.rotation.x = Math.PI / 2;

      // Scale based on face dimensions (X width, Z becomes height after rotation)
      const faceDim = Math.max(size.x, size.z);
      const targetSize = 20;
      const fitScale = targetSize / faceDim;
      model.scale.setScalar(fitScale);

      // Re-center after rotation + scale
      const box2 = new THREE.Box3().setFromObject(model);
      const center2 = box2.getCenter(new THREE.Vector3());
      model.position.set(-center2.x, -center2.y, -center2.z);

      logoGroup.add(model);
    });

    // 2D read canvas (reused every frame)
    const readCanvas = document.createElement("canvas");
    readCanvas.width = W;
    readCanvas.height = H;
    const readCtx = readCanvas.getContext("2d")!;

    return { renderer, scene, camera, logoGroup, readCanvas, readCtx };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const FONT_SIZE = 13;
    const LINE_HEIGHT = 16;

    function resize() {
      const parent = canvas!.parentElement!;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      ctx.font = `${FONT_SIZE}px "Courier New", monospace`;
      const charW = ctx.measureText("M").width;
      const charH = LINE_HEIGHT;
      const cols = Math.ceil(w / charW);
      const rows = Math.ceil(h / charH);
      dimsRef.current = { cols, rows, charW, charH };

      const lines: string[] = [];
      for (let r = 0; r < rows; r++) lines.push(buildLine(cols));
      linesRef.current = lines;

      // Rebuild Three scene at new grid size
      threeRef.current?.renderer.dispose();
      threeRef.current = buildThree(cols, rows);
    }

    resize();
    window.addEventListener("resize", resize);

    /* ── Mouse events — listen on window so tilt works anywhere on page ── */
    const onMove = (e: MouseEvent) => {
      spotRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => { spotRef.current.active = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const heat = new Float32Array(10000); // pre-alloc, resized implicitly

    function animate() {
      const { cols, rows, charW, charH } = dimsRef.current;
      const lines = linesRef.current;
      const three = threeRef.current;

      /* Rotate Three scene based on mouse hover position */
      if (three) {
        const spot = spotRef.current;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const RANGE = 320; // px radius around logo center that activates tilt
        const dx = spot.x - cx;
        const dy = spot.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (spot.active && dist < RANGE) {
          const t = dist / RANGE; // 0 at center, 1 at edge
          const targetY = (dx / RANGE) * 0.7;
          const targetX = (dy / RANGE) * -0.45;
          rotRef.current.y += (targetY - rotRef.current.y) * 0.06;
          rotRef.current.x += (targetX - rotRef.current.x) * 0.06;
          void t;
        } else {
          // Ease back to center outside range
          rotRef.current.y += (0 - rotRef.current.y) * 0.03;
          rotRef.current.x += (0 - rotRef.current.x) * 0.03;
        }
        three.logoGroup.rotation.y = rotRef.current.y;
        three.logoGroup.rotation.x = rotRef.current.x;
        three.renderer.render(three.scene, three.camera);

        // Copy WebGL canvas → 2D canvas so we can read pixels
        three.readCtx.clearRect(0, 0, cols, rows);
        three.readCtx.drawImage(three.renderer.domElement, 0, 0);
      }

      /* Mutate text */
      const mutations = Math.floor(cols * rows * 0.004);
      for (let i = 0; i < mutations; i++) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (lines[r]) {
          const ch = lines[r].split("");
          ch[c] = HEX[Math.floor(Math.random() * 16)];
          lines[r] = ch.join("");
          const idx = r * cols + c;
          if (idx < heat.length) heat[idx] = 1.0;
        }
      }
      for (let i = 0; i < cols * rows && i < heat.length; i++) {
        if (heat[i] > 0) heat[i] = Math.max(0, heat[i] - 0.015);
      }

      /* Read Three pixel data once per frame */
      let pixels: Uint8ClampedArray | null = null;
      if (three) {
        try {
          pixels = three.readCtx.getImageData(0, 0, cols, rows).data;
        } catch (_) { /* cross-origin guard */ }
      }

      /* Draw */
      const parent = canvas!.parentElement!;
      ctx.clearRect(0, 0, parent.clientWidth, parent.clientHeight);
      ctx.font = `${FONT_SIZE}px "Courier New", monospace`;
      ctx.textBaseline = "top";

      for (let row = 0; row < rows; row++) {
        const line = lines[row];
        if (!line) continue;
        const y = row * charH;

        for (let col = 0; col < cols; col++) {
          const ch = line[col];
          if (!ch || ch === " ") continue;
          const x = col * charW;
          const hv = col + row * cols < heat.length ? heat[col + row * cols] : 0;

          /* Sample Three pixel at (col, row) */
          let r3 = 0, g3 = 0, b3 = 0, a3 = 0;
          if (pixels) {
            const pi = (row * cols + col) * 4;
            r3 = pixels[pi]; g3 = pixels[pi + 1]; b3 = pixels[pi + 2]; a3 = pixels[pi + 3];
          }

          /* Mouse spotlight */
          const spot = spotRef.current;
          let spotlight = 0;
          if (spot.active) {
            const dx = x + charW / 2 - spot.x;
            const dy = y + charH / 2 - spot.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) spotlight = (1 - d / 110) * 0.35;
          }

          if (a3 > 20) {
            /* Inside 3D logo — boost sampled colors so model parts are vivid */
            const boost = 1.8;
            const rb = Math.min(255, Math.round(r3 * boost));
            const gb = Math.min(255, Math.round(g3 * boost));
            const bb = Math.min(255, Math.round(b3 * boost));
            const brightness = (rb + gb + bb) / (3 * 255);
            const alpha = Math.min(1, 0.88 + brightness * 0.12 + hv * 0.05);
            ctx.fillStyle = `rgba(${rb},${gb},${bb},${alpha})`;
          } else {
            continue; // no background matrix
          }

          ctx.fillText(ch, x, y);
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
    };
  }, [buildThree]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
