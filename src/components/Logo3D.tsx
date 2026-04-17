"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";

/* Full logo SVG — all paths with correct fill colors */
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44">
  <path fill="#FECB33" d="M10.9768 11.2663L14.9792 4.22496C15.0582 4.0859 15.2059 4 15.3658 4H23.6539C23.9958 4 24.2099 4.36985 24.0395 4.66633L19.9923 11.7077C19.913 11.8457 19.7659 11.9308 19.6067 11.9308H11.3634C11.0224 11.9308 10.8083 11.5628 10.9768 11.2663Z"/>
  <path fill="#FECB33" d="M0.377697 29.7221L4.38008 22.6807C4.45913 22.5416 4.60676 22.4557 4.76671 22.4557H13.0548C13.3967 22.4557 13.6107 22.8256 13.4403 23.1221L9.39319 30.1634C9.31386 30.3015 9.16681 30.3866 9.00762 30.3866H0.764322C0.423307 30.3866 0.209181 30.0185 0.377697 29.7221Z"/>
  <path fill="#EAA536" d="M25.8748 38.8388L29.8772 31.7974C29.9562 31.6583 30.1038 31.5724 30.2638 31.5724H38.5518C38.8938 31.5724 39.1078 31.9423 38.9374 32.2388L34.8903 39.2801C34.8109 39.4182 34.6639 39.5033 34.5047 39.5033H26.2614C25.9204 39.5033 25.7063 39.1352 25.8748 38.8388Z"/>
  <path fill="#FECB33" d="M34.7922 38.8388L30.7898 31.7974C30.7108 31.6583 30.5632 31.5724 30.4032 31.5724H22.1152C21.7732 31.5724 21.5592 31.9423 21.7296 32.2388L25.7767 39.2801C25.8561 39.4182 26.0031 39.5033 26.1623 39.5033H34.4056C34.7466 39.5033 34.9607 39.1352 34.7922 38.8388Z"/>
  <path fill="#FECB33" d="M18.9713 31.6425L14.8797 38.9062C14.8009 39.0461 14.6528 39.1327 14.4923 39.1327H5.75498C5.40844 39.1327 5.19505 38.7539 5.37464 38.4575L9.9059 30.9795H18.5838C18.9241 30.9795 19.1383 31.3461 18.9713 31.6425Z"/>
  <path fill="#EAA536" d="M14.2593 38.9215L9.91329 31.4043C9.83319 31.2657 9.83371 31.0948 9.91466 30.9567L14.2606 23.545C14.4311 23.2542 14.8506 23.2514 15.0249 23.5399L19.5036 30.9517C19.5885 31.0923 19.5891 31.2683 19.505 31.4094L15.0263 38.9265C14.8526 39.2182 14.4292 39.2154 14.2593 38.9215Z"/>
  <path fill="#FECB33" fill-rule="evenodd" clip-rule="evenodd" d="M34.253 22.9005C34.5949 22.9005 34.8089 23.2701 34.6387 23.5665L30.5919 30.6085C30.5125 30.7464 30.3652 30.8311 30.2061 30.8312H21.963C21.622 30.8312 21.4079 30.4636 21.5762 30.1671L25.5352 23.2003L27.4825 26.6788L27.0684 27.4269C27.0418 27.4754 27.0766 27.5346 27.1319 27.5363L28.4757 27.5773C28.5025 27.5781 28.5282 27.5651 28.5421 27.5421L29.2559 26.3468C29.2848 26.2984 29.2516 26.2366 29.1954 26.2345L28.3253 26.2062C27.8534 25.3226 26.9208 23.7178 26.4434 22.9005H34.253Z"/>
  <path fill="#FECB33" fill-rule="evenodd" clip-rule="evenodd" d="M23.853 20.677C24.195 20.677 24.409 20.3074 24.2388 20.011L20.1919 12.969C20.1126 12.8311 19.9653 12.7463 19.8062 12.7463H11.563C11.2221 12.7463 11.008 13.114 11.1763 13.4104L15.1353 20.3772L17.0825 16.8987L16.6685 16.1506C16.6418 16.1022 16.6758 16.0422 16.731 16.0403L18.0757 16.0002C18.1024 15.9994 18.1273 16.0126 18.1411 16.0354L18.856 17.2307C18.8848 17.2792 18.8508 17.3402 18.7944 17.342L17.9253 17.3713C17.4535 18.2548 16.5209 19.8596 16.0435 20.677H23.853Z"/>
  <path fill="#EAA536" d="M28.0273 12.7463C28.3693 12.7463 28.5834 13.1158 28.4131 13.4123L24.3662 20.4543C24.2868 20.5921 24.1396 20.6769 23.9805 20.6769H16.0449C16.5224 19.8595 17.455 18.2547 17.9268 17.3713L18.7969 17.343C18.8531 17.3408 18.8863 17.279 18.8574 17.2307L18.1426 16.0363C18.1288 16.0132 18.104 15.9994 18.0771 16.0002L17.623 16.0139L19.3535 12.9709C19.4326 12.8321 19.5804 12.7463 19.7402 12.7463H28.0273Z"/>
</svg>`;

function LogoMesh() {
  const groupRef = useRef<THREE.Group>(null);

  const meshes = useMemo(() => {
    const loader = new SVGLoader();
    const data = loader.parse(LOGO_SVG);
    const result: React.ReactNode[] = [];

    // SVG is 40×44, center at (20, 22) — we'll offset so logo is centered
    const offsetX = -20;
    const offsetY = -22;

    data.paths.forEach((path, pi) => {
      const fillColor = path.userData?.style?.fill ?? "#FECB33";
      const color = new THREE.Color(fillColor);

      const shapes = SVGLoader.createShapes(path);

      shapes.forEach((shape, si) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 6,
          bevelEnabled: true,
          bevelThickness: 0.4,
          bevelSize: 0.3,
          bevelSegments: 4,
        });

        // Center the geometry based on SVG coordinate system
        geometry.translate(offsetX, offsetY, 0);
        // Flip Y (SVG Y goes down, Three.js Y goes up)
        geometry.scale(1, -1, 1);

        const material = new THREE.MeshStandardMaterial({
          color,
          metalness: 0.85,
          roughness: fillColor === "#FECB33" ? 0.15 : 0.25,
          envMapIntensity: 1.5,
        });

        result.push(
          <mesh key={`${pi}-${si}`} geometry={geometry} material={material} />
        );
      });
    });

    return result;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.06;
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.15;
  });

  return (
    <group ref={groupRef} scale={0.38}>
      {meshes}
    </group>
  );
}

export function Logo3D() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      camera={{ position: [0, 0, 24], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 8]} intensity={2} color="#fff8e7" />
      <directionalLight position={[-8, -4, 6]} intensity={0.8} color="#fecb33" />
      <pointLight position={[0, 0, 12]} intensity={1} color="#ffffff" />
      <LogoMesh />
    </Canvas>
  );
}
