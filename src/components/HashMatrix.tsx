"use client";

import { useEffect, useRef, useCallback, type MutableRefObject } from "react";
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

export function HashMatrix({ scrollProgressRef }: { scrollProgressRef?: MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<string[]>([]);
  const dimsRef = useRef({ cols: 0, rows: 0, charW: 0, charH: 0 });
  const frameRef = useRef(0);
  const threeRef = useRef<ThreeScene | null>(null);
  const rotRef = useRef({ x: 0, y: 0 });
  const autoYRef = useRef(0);
  const dragRef = useRef({ down: false, lastX: 0, lastY: 0 });
  const spotRef = useRef({ x: -1, y: -1, active: false });
  const textMaskRef = useRef<Uint8Array | null>(null);
  const spSmoothRef = useRef(0); // internally lerped scroll progress

  /* ── Build Three.js offscreen scene ── */
  const buildThree = useCallback((cols: number, rows: number, pixelAspect: number) => {
    // Render at character-grid resolution — each pixel = one character cell
    const W = cols;
    const H = rows;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    // Use real pixel aspect so logo proportions aren't distorted by non-square character cells
    const camera = new THREE.PerspectiveCamera(55, pixelAspect, 0.1, 1000);
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
      const targetSize = 13;
      const fitScale = targetSize / faceDim;
      model.scale.setScalar(fitScale);

      // Re-center after rotation + scale
      const box2 = new THREE.Box3().setFromObject(model);
      const center2 = box2.getCenter(new THREE.Vector3());
      model.position.set(-center2.x, -center2.y + 0.5, -center2.z);

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
    const FONT_SIZE = 9;
    const LINE_HEIGHT = 11;

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

      // Build emboss text mask after fonts are loaded
      const buildMask = () => {
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = w;
      maskCanvas.height = h;
      const mctx = maskCanvas.getContext("2d")!;
      mctx.fillStyle = "white";
      mctx.textBaseline = "middle";

      const lines3 = [
        { text: "BLOCKCHAIN", x: w * 0.5, y: h * 0.72, maxW: w * 0.80, style: `bold 100px sans-serif` },
        { text: "@",          x: w * 0.5, y: h * 0.82, maxW: w * 0.10, style: `italic 100px "Instrument Serif", serif` },
        { text: "Berkeley",   x: w * 0.5, y: h * 0.91, maxW: w * 0.70, style: `italic 100px "Instrument Serif", serif` },
      ];
      for (const { text, x, y, maxW, style } of lines3) {
        mctx.font = style;
        const fs = Math.floor(100 * maxW / mctx.measureText(text).width);
        mctx.font = style.replace("100px", `${fs}px`);
        mctx.textAlign = "center";
        mctx.fillText(text, x, y);
      }

      const maskPx = mctx.getImageData(0, 0, w, h).data;
      const mask = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = Math.min(w - 1, Math.round((c + 0.5) * charW));
          const py = Math.min(h - 1, Math.round((r + 0.5) * charH));
          mask[r * cols + c] = maskPx[(py * w + px) * 4 + 3] > 20 ? 1 : 0;
        }
      }
      textMaskRef.current = mask;
      }; // end buildMask
      document.fonts.ready.then(buildMask);

      // Rebuild Three scene at new grid size
      threeRef.current?.renderer.dispose();
      threeRef.current = buildThree(cols, rows, w / h);
    }

    resize();
    window.addEventListener("resize", resize);

    /* ── Mouse events ── */
    const onMove = (e: MouseEvent) => {
      spotRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => { spotRef.current.active = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    let heat = new Float32Array(0);

    function animate() {
      const { cols, rows, charW, charH } = dimsRef.current;
      const needed = cols * rows;
      if (heat.length < needed) heat = new Float32Array(needed);
      const lines = linesRef.current;
      const three = threeRef.current;

      // Internally smooth sp so snap momentum doesn't feel jarring
      const spTarget = scrollProgressRef?.current ?? 0;
      spSmoothRef.current += (spTarget - spSmoothRef.current) * 0.06;
      const sp = spSmoothRef.current;
      // Phase 1: 0→0.5 = camera zoom through logo + matrix fade in
      // Phase 2: 0.5→1 = SVG burns into matrix below navbar
      const phase1 = Math.min(1, sp / 0.5);
      const phase2 = Math.max(0, Math.min(1, (sp - 0.5) / 0.5));

      /* Camera zooms into center of logo, logo fades as camera gets close */
      if (three) {
        const targetZ = 19 - phase1 * 22; // 19 → -3, zooms through
        three.camera.position.z += (targetZ - three.camera.position.z) * 0.055;
        three.logoGroup.position.x += (0 - three.logoGroup.position.x) * 0.055;
        three.logoGroup.position.y += (0 - three.logoGroup.position.y) * 0.055;
        three.logoGroup.scale.setScalar(
          three.logoGroup.scale.x + (1 - three.logoGroup.scale.x) * 0.055
        );
      }

      /* Logo fades out as camera zooms in close */
      const logoAlpha = Math.max(0, 1 - Math.max(0, (phase1 - 0.3) / 0.6));


      /* Rotate Three scene — pure cursor driven */
      if (three) {
        const spot = spotRef.current;
        if (spot.active) {
          const targetY = ((spot.x / window.innerWidth) - 0.5) * 1.2;
          const targetX = ((spot.y / window.innerHeight) - 0.5) * -0.6;
          rotRef.current.y += (targetY - rotRef.current.y) * 0.06;
          rotRef.current.x += (targetX - rotRef.current.x) * 0.06;
        } else {
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
          heat[r * cols + c] = 1.0;
        }
      }
      for (let i = 0; i < cols * rows; i++) {
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
      const pw = parent.clientWidth;
      const ph = parent.clientHeight;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, pw, ph);

      /* Vertical grid lines — fade out as matrix fades in */
      const lineOpacity = Math.max(0, 1 - phase1 * 2.5) * 0.07;
      if (lineOpacity > 0.002) {
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${lineOpacity})`;
        ctx.lineWidth = 1;
        const xPositions = [
          48,
          pw * 0.25 + 12,
          pw * 0.5,
          pw * 0.75 - 12,
          pw - 48,
        ];
        for (const x of xPositions) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ph);
          ctx.stroke();
        }
        ctx.restore();
      }

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

          if (a3 > 20 && logoAlpha > 0.01) {
            /* Inside 3D logo — fades out as camera zooms through */
            const boost = 1.8;
            const rb = Math.min(255, Math.round(r3 * boost));
            const gb = Math.min(255, Math.round(g3 * boost));
            const bb = Math.min(255, Math.round(b3 * boost));
            const brightness = (rb + gb + bb) / (3 * 255);
            const alpha = Math.min(1, (0.88 + brightness * 0.12 + hv * 0.05) * logoAlpha);
            ctx.fillStyle = `rgba(${rb},${gb},${bb},${alpha})`;
          } else {
            /* Background matrix — fades in during phase 1 */
            if (phase1 < 0.1) continue;
            const alpha = Math.min(1, phase1 * (0.06 + hv * 0.08));
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
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
