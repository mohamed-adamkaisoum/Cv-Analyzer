"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════════════ */

interface MascotData {
  id: string;
  name: string;
  tagline: string;
  color: string;
  description: string;
  image: string;
}

const MASCOTS: MascotData[] = [
  {
    id: "scouty",
    name: "Scouty",
    tagline: "The Explorer",
    color: "#34D399",
    description: "Thorough, curious, and detail-obsessed.",
    image: "/scouty.png",
  },
  {
    id: "nova",
    name: "Nova",
    tagline: "The Visionary",
    color: "#A78BFA",
    description: "Sees the career you haven't built yet.",
    image: "/nova.png",
  },
  {
    id: "blaze",
    name: "Blaze",
    tagline: "The Challenger",
    color: "#FB923C",
    description: "Brutally honest. Exceptionally effective.",
    image: "/blaze.png",
  },
  {
    id: "sage",
    name: "Sage",
    tagline: "The Mentor",
    color: "#38BDF8",
    description: "Calm, wise, and deeply reassuring.",
    image: "/sage.png",
  },
  {
    id: "echo",
    name: "Echo",
    tagline: "The Empath",
    color: "#F472B6",
    description: "Tells your story with genuine warmth.",
    image: "/echo.png",
  },
];

const COUNT = MASCOTS.length;
const ARC = (Math.PI * 2) / COUNT;
const RING_RADIUS = 3.5;
const AUTO_PLAY_MS = 4000;
const DRAG_THRESHOLD = 40;

/* Spring physics tuning */
const SPRING_K = 0.045;
const SPRING_DAMP = 0.82;

/* ═══════════════════════════════════════════════════════════════════════
   Texture Factories — procedural glow + shadow discs
   ═══════════════════════════════════════════════════════════════════════ */

function makeRadialTexture(
  stops: [number, string][],
  size = 256
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  stops.forEach(([offset, col]) => g.addColorStop(offset, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

/* ═══════════════════════════════════════════════════════════════════════
   3D — Individual Mascot Panel
   ═══════════════════════════════════════════════════════════════════════ */

function MascotPanel({
  mascot,
  index,
  texture,
  ringRef,
}: {
  mascot: MascotData;
  index: number;
  texture: THREE.Texture;
  ringRef: React.RefObject<THREE.Group | null>;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const mainMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const shadowMatRef = useRef<THREE.MeshBasicMaterial>(null!);

  const glowTex = useMemo(
    () =>
      makeRadialTexture([
        [0, "rgba(255,255,255,0.55)"],
        [0.35, "rgba(255,255,255,0.12)"],
        [1, "rgba(255,255,255,0)"],
      ]),
    []
  );

  const shadowTex = useMemo(
    () =>
      makeRadialTexture([
        [0, "rgba(0,0,0,0.5)"],
        [0.55, "rgba(0,0,0,0.10)"],
        [1, "rgba(0,0,0,0)"],
      ]),
    []
  );

  const color = useMemo(() => new THREE.Color(mascot.color), [mascot.color]);
  const θ = index * ARC;
  const px = RING_RADIUS * Math.sin(θ);
  const pz = RING_RADIUS * Math.cos(θ);

  useFrame(({ clock }) => {
    if (!ringRef.current || !meshRef.current) return;

    /* ── Compute visibility from angle relative to camera ── */
    const ringY = ringRef.current.rotation.y;
    const rel =
      (((θ + ringY) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) -
      Math.PI;
    const dist = Math.abs(rel);

    const fadeStart = ARC * 0.3;
    const fadeEnd = ARC * 1.15;
    const vis = 1 - THREE.MathUtils.smoothstep(dist, fadeStart, fadeEnd);

    /* ── Update material opacities ── */
    if (mainMatRef.current) mainMatRef.current.opacity = vis;
    if (glowMatRef.current) glowMatRef.current.opacity = vis * 0.4;
    if (shadowMatRef.current) shadowMatRef.current.opacity = vis * 0.45;

    /* ── Float + scale (active mascot only) ── */
    const floatY =
      vis > 0.4
        ? Math.sin(clock.elapsedTime * 0.7 + index * 1.3) * 0.14
        : 0;
    meshRef.current.position.y = floatY;

    const s = THREE.MathUtils.lerp(0.82, 1.0, vis);
    meshRef.current.scale.set(s, s, s);

    /* ── Sync shadow with float ── */
    if (shadowMatRef.current) {
      const shadowScale = THREE.MathUtils.lerp(1.0, 0.9, floatY / 0.14);
      shadowMatRef.current.opacity = vis * 0.45 * shadowScale;
    }
  });

  return (
    <group position={[px, 0, pz]} rotation={[0, θ, 0]}>
      {/* Glow halo — large disc behind mascot in their signature color */}
      <mesh position={[0, 0, -0.12]} scale={[5.2, 5.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={glowMatRef}
          map={glowTex}
          color={color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Mascot artwork */}
      <mesh ref={meshRef}>
        <planeGeometry args={[2.8, 3.4]} />
        <meshBasicMaterial
          ref={mainMatRef}
          map={texture}
          transparent
          opacity={0}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ground shadow ellipse */}
      <mesh
        position={[0, -1.85, 0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[2.6, 1.4, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={shadowMatRef}
          map={shadowTex}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3D — Decorative Orbit Rings
   ═══════════════════════════════════════════════════════════════════════ */

function OrbitRings() {
  const innerRef = useRef<THREE.Mesh>(null!);
  const outerRef = useRef<THREE.Mesh>(null!);
  const dotRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (innerRef.current) innerRef.current.rotation.z = t * 0.08;
    if (outerRef.current) outerRef.current.rotation.z = -t * 0.04;
    if (dotRef.current) {
      dotRef.current.position.x = Math.cos(t * 0.08) * 4.61;
      dotRef.current.position.z = Math.sin(t * 0.08) * 4.61;
    }
  });

  return (
    <>
      {/* Inner ring */}
      <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.6, 4.63, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.035}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbit dot */}
      <mesh ref={dotRef} position={[4.61, 0, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.6} />
      </mesh>

      {/* Outer ring */}
      <mesh ref={outerRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.8, 5.82, 128]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3D — Ambient Particles
   ═══════════════════════════════════════════════════════════════════════ */

function Particles({ color, count = 40 }: { color: string; count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const targetColor = useMemo(() => new THREE.Color(color), [color]);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      spd[i] = 0.15 + Math.random() * 0.5;
    }
    return [pos, spd];
  }, [count]);

  const geomRef = useRef<THREE.BufferGeometry>(null!);

  useEffect(() => {
    if (geomRef.current) {
      geomRef.current.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
    }
  }, [positions]);

  useFrame(() => {
    if (!ref.current || !geomRef.current) return;
    const attr = geomRef.current.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    if (!attr) return;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.003;
      // subtle horizontal drift
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.8 + i) * 0.001;
      if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -5;
    }
    attr.needsUpdate = true;

    const mat = ref.current.material as THREE.PointsMaterial;
    mat.color.lerp(targetColor, 0.025);
  });

  return (
    <points ref={ref}>
      <bufferGeometry ref={geomRef} />
      <pointsMaterial
        size={0.04}
        color={targetColor}
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3D — Scene Composition
   ═══════════════════════════════════════════════════════════════════════ */

function Scene({
  rotRef,
  activeIndex,
}: {
  rotRef: React.MutableRefObject<number>;
  activeIndex: number;
}) {
  const ringRef = useRef<THREE.Group>(null!);
  const vel = useRef(0);
  const { viewport } = useThree();

  /* Load all mascot textures in one batch */
  const textures = useTexture(MASCOTS.map((m) => m.image));

  /* Spring-based rotation */
  useFrame(() => {
    if (!ringRef.current) return;
    const diff = rotRef.current - ringRef.current.rotation.y;
    vel.current += diff * SPRING_K;
    vel.current *= SPRING_DAMP;
    ringRef.current.rotation.y += vel.current;
  });

  /* Responsive scale: smaller scenes on narrow viewports */
  const scale = Math.min(viewport.width / 7.5, 1);

  return (
    <>
      <ambientLight intensity={1.3} />

      <group scale={[scale, scale, scale]}>
        {/* Rotating mascot ring */}
        <group ref={ringRef}>
          {MASCOTS.map((m, i) => (
            <MascotPanel
              key={m.id}
              mascot={m}
              index={i}
              texture={textures[i]}
              ringRef={ringRef}
            />
          ))}
        </group>

        <OrbitRings />
        <Particles color={MASCOTS[activeIndex].color} />
      </group>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Loading Fallback (shown while textures stream in)
   ═══════════════════════════════════════════════════════════════════════ */

function CarouselFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="w-24 h-24 rounded-full border border-white/[0.06]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Main Exported Component
   ═══════════════════════════════════════════════════════════════════════ */

interface CarouselProps {
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

export default function MascotCarousel3D({
  activeIndex,
  onIndexChange,
}: CarouselProps) {
  /* ── Refs ── */
  const rotRef = useRef(-activeIndex * ARC);
  const idxRef = useRef(activeIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInteraction = useRef(Date.now());

  /* ── Drag state ── */
  const dragging = useRef(false);
  const dragX0 = useRef(0);
  const dragRot0 = useRef(0);

  /* ── Sync external index changes (from pills, keyboard, etc.) ── */
  useEffect(() => {
    if (activeIndex !== idxRef.current) {
      let d = activeIndex - idxRef.current;
      if (d > 2) d -= COUNT;
      if (d < -2) d += COUNT;
      rotRef.current -= d * ARC;
      idxRef.current = activeIndex;
    }
  }, [activeIndex]);

  /* ── Navigate to a specific index (internal use) ── */
  const goTo = useCallback(
    (i: number) => {
      const ni = ((i % COUNT) + COUNT) % COUNT;
      let d = ni - idxRef.current;
      if (d > 2) d -= COUNT;
      if (d < -2) d += COUNT;
      rotRef.current -= d * ARC;
      idxRef.current = ni;
      onIndexChange(ni);
      lastInteraction.current = Date.now();
    },
    [onIndexChange]
  );

  /* ── Auto-play every 4 s ── */
  useEffect(() => {
    const id = setInterval(() => {
      if (dragging.current) return;
      if (Date.now() - lastInteraction.current < AUTO_PLAY_MS) return;
      goTo(idxRef.current + 1);
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [goTo]);

  /* ── Pointer / drag handlers ── */
  const onDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    dragX0.current = e.clientX;
    dragRot0.current = rotRef.current;
    lastInteraction.current = Date.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragX0.current;
    const w = containerRef.current?.clientWidth || 600;
    rotRef.current = dragRot0.current + (dx / w) * ARC * 2.5;
  }, []);

  const onUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      const dx = e.clientX - dragX0.current;
      // Reset to pre-drag rotation first
      rotRef.current = dragRot0.current;
      // Then snap to next/prev if drag exceeds threshold
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        goTo(idxRef.current + (dx > 0 ? -1 : 1));
      }
    },
    [goTo]
  );

  const mascot = MASCOTS[activeIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none", background: "transparent" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* ── Ambient glow that shifts per mascot ── */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at center, ${mascot.color}14 0%, transparent 70%)`,
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* ── Giant kinetic background name ── */}
      <AnimatePresence mode="wait">
        <motion.span
          key={mascot.id}
            className="absolute inset-0 flex items-center justify-center font-display font-bold uppercase select-none pointer-events-none text-[clamp(80px,16vw,220px)] leading-none tracking-wide z-0"
          style={{
            color: mascot.color,
            opacity: 0.07,
            mixBlendMode: "screen",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
          initial={{
            opacity: 0,
            letterSpacing: "0.2em",
            filter: "blur(12px)",
          }}
          animate={{
            opacity: 0.07,
            letterSpacing: "0.05em",
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            letterSpacing: "0.15em",
            filter: "blur(8px)",
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          {mascot.name}
        </motion.span>
      </AnimatePresence>

      {/* ── 3D Canvas ── */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-transparent">
        <Canvas
          camera={{ position: [0, 0.3, 9], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ pointerEvents: "none", background: "transparent" }}
        >
          <Suspense fallback={null}>
            <Scene rotRef={rotRef} activeIndex={activeIndex} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── Loading fallback (visible until Suspense resolves) ── */}
      <CarouselFallback />

      {/* ── Bottom overlay: mascot info + navigation dots ── */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center gap-3 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={mascot.id}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-1"
              style={{ color: mascot.color }}
            >
              {mascot.tagline}
            </p>
            <p className="text-white/50 text-sm leading-relaxed max-w-[220px] font-[family-name:var(--font-inter)] italic">
              {mascot.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex gap-2.5 pointer-events-auto">
          {MASCOTS.map((m, i) => (
            <button
              key={m.id}
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              aria-label={`Select ${m.name}`}
              className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor:
                  i === activeIndex ? m.color : "rgba(255,255,255,0.2)",
                boxShadow:
                  i === activeIndex ? `0 0 10px ${m.color}80` : "none",
                transform: i === activeIndex ? "scale(1.5)" : "scale(1)",
                outlineColor: m.color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
