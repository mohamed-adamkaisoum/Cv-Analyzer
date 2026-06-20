"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════════════ */

interface MascotMeta {
  id: string;
  name: string;
  tagline: string;
  color: string;
  description: string;
  image: string;
}

const MASCOTS: MascotMeta[] = [
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
const AUTO_PLAY_MS = 4000;
const SWIPE_THRESHOLD = 50;

/* ═══════════════════════════════════════════════════════════════════════
   Floating Orbs — blurred colour accents drifting around the mascot
   ═══════════════════════════════════════════════════════════════════════ */

const ORB_DATA = [
  { left: "10%", top: "28%", size: 100, blur: 50, opacity: 0.14, dur: 10 },
  { left: "82%", top: "18%", size: 140, blur: 70, opacity: 0.10, dur: 13 },
  { left: "78%", top: "65%", size: 80, blur: 40, opacity: 0.18, dur: 9 },
  { left: "14%", top: "70%", size: 120, blur: 60, opacity: 0.11, dur: 12 },
  { left: "48%", top: "10%", size: 70, blur: 35, opacity: 0.08, dur: 15 },
  { left: "6%",  top: "48%", size: 60, blur: 30, opacity: 0.16, dur: 11 },
];

function FloatingOrbs({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]">
      {ORB_DATA.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: o.left,
            top: o.top,
            width: o.size,
            height: o.size,
            filter: `blur(${o.blur}px)`,
          }}
          animate={{
            backgroundColor: color,
            y: [0, -22, 0, 16, 0],
            x: [0, 14, 0, -10, 0],
            opacity: [o.opacity, o.opacity * 1.4, o.opacity, o.opacity * 0.7, o.opacity],
          }}
          transition={{
            backgroundColor: { duration: 0.9, ease: "easeInOut" },
            y: { duration: o.dur, repeat: Infinity, ease: "easeInOut" },
            x: { duration: o.dur * 1.3, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: o.dur * 0.8, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Minimalist Navbar
   ═══════════════════════════════════════════════════════════════════════ */

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-0 left-0 right-0 z-50
                 flex items-center justify-between
                 h-[72px] px-6 sm:px-10 lg:px-16"
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-2" aria-label="CVision AI home">
        <span
          className="font-display font-bold text-[17px] tracking-[-0.02em]
                     bg-clip-text text-transparent"
          style={{
            backgroundImage: "linear-gradient(135deg, #7B6EF6, #C084FC, #F59E42)",
          }}
        >
          CVision
        </span>
        <span
          className="text-[10px] font-semibold tracking-[0.06em] px-2 py-0.5
                     rounded-full border border-violet-500/30 bg-violet-500/8
                     text-violet-400 select-none"
        >
          AI
        </span>
      </a>

      {/* Centre links */}
      <div className="hidden md:flex items-center gap-8">
        {["Features", "Mascots", "Pricing", "Contact"].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-[13.5px] text-white/45 hover:text-white font-medium
                       transition-colors duration-200"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Right — login */}
      <a
        href="#login"
        className="text-[13.5px] text-white/35 hover:text-white font-medium
                   transition-colors duration-200"
      >
        Log in
      </a>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Slide Variants — direction-aware enter / exit
   ═══════════════════════════════════════════════════════════════════════ */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const mascotVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir * 160,
    scale: 0.88,
    filter: "blur(6px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE_OUT },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: -dir * 160,
    scale: 0.88,
    filter: "blur(6px)",
    transition: { duration: 0.45, ease: EASE_OUT },
  }),
};

const nameVariants = {
  enter: {
    opacity: 0,
    filter: "blur(24px)",
    letterSpacing: "0.15em",
  },
  center: {
    opacity: 0.1,
    filter: "blur(0px)",
    letterSpacing: "0.04em",
    transition: { duration: 0.7, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    filter: "blur(18px)",
    letterSpacing: "0.12em",
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

const taglineVariants = {
  enter: { opacity: 0, y: 14 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT, delay: 0.15 },
  },
  exit: {
    opacity: 0,
    y: -14,
    transition: { duration: 0.3 },
  },
};

/* ═══════════════════════════════════════════════════════════════════════
   Main Hero Section
   ═══════════════════════════════════════════════════════════════════════ */

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(1); // Start with Nova
  const [direction, setDirection] = useState(0);
  const lastInteraction = useRef(Date.now());
  const dragStartX = useRef(0);

  const mascot = MASCOTS[activeIndex];

  /* ── Navigation ── */
  const goTo = useCallback(
    (newIndex: number, dir: number) => {
      setDirection(dir);
      setActiveIndex(((newIndex % COUNT) + COUNT) % COUNT);
      lastInteraction.current = Date.now();
    },
    []
  );

  const next = useCallback(() => goTo(activeIndex + 1, 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1, -1), [activeIndex, goTo]);

  /* ── Auto-play ── */
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastInteraction.current < AUTO_PLAY_MS) return;
      setDirection(1);
      setActiveIndex((i) => (i + 1) % COUNT);
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, []);

  /* ── Keyboard ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      const num = parseInt(e.key);
      if (num >= 1 && num <= COUNT) {
        goTo(num - 1, num - 1 > activeIndex ? 1 : -1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, goTo, activeIndex]);

  /* ── Pointer / drag ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const dx = e.clientX - dragStartX.current;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx > 0) prev();
        else next();
      }
    },
    [next, prev]
  );

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-[#07070A] select-none"
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      aria-label="Hero — choose your AI mascot"
    >
      {/* ── BG: radial glow per mascot ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at 50% 45%, ${mascot.color}0C 0%, transparent 65%)`,
        }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />

      {/* ── BG: vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(7,7,10,0.55) 100%)",
        }}
      />

      {/* ── BG: dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] z-[2]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Floating colour orbs ── */}
      <FloatingOrbs color={mascot.color} />

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Giant background name ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h2
            key={mascot.id + "-name"}
            variants={nameVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="font-display font-bold uppercase whitespace-nowrap select-none
                       text-[clamp(100px,20vw,340px)] leading-none"
            style={{ color: mascot.color }}
          >
            {mascot.name}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* ── Mascot image — centred, above the name ── */}
      <div className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={mascot.id + "-img"}
            custom={direction}
            variants={mascotVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mascot.image}
              alt={mascot.name}
              className="h-[48vh] sm:h-[55vh] lg:h-[62vh] w-auto object-contain"
              draggable={false}
            />

            {/* Glow halo behind the character */}
            <motion.div
              className="absolute inset-0 -z-10 rounded-full"
              animate={{ backgroundColor: `${mascot.color}00` }}
              style={{
                background: `radial-gradient(circle at 50% 55%, ${mascot.color}22 0%, transparent 55%)`,
                transform: "scale(1.7)",
                filter: "blur(50px)",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation arrows ── */}
      <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-8 lg:px-14 z-[10]">
        <motion.button
          onClick={prev}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          className="w-11 h-11 rounded-full
                     border border-white/[0.08] bg-white/[0.03]
                     backdrop-blur-md
                     flex items-center justify-center
                     text-white/40 hover:text-white hover:border-white/20
                     hover:bg-white/[0.06]
                     transition-all duration-300 cursor-pointer
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
          aria-label="Previous mascot"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </motion.button>

        <motion.button
          onClick={next}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          className="w-11 h-11 rounded-full
                     border border-white/[0.08] bg-white/[0.03]
                     backdrop-blur-md
                     flex items-center justify-center
                     text-white/40 hover:text-white hover:border-white/20
                     hover:bg-white/[0.06]
                     transition-all duration-300 cursor-pointer
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
          aria-label="Next mascot"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </motion.button>
      </div>

      {/* ── Tagline + description ── */}
      <div className="absolute bottom-[130px] sm:bottom-[140px] left-0 right-0 flex flex-col items-center gap-1.5 z-[10] pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mascot.id + "-tag"}
            variants={taglineVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col items-center gap-1"
          >
            <span
              className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: mascot.color }}
            >
              {mascot.tagline}
            </span>
            <span className="text-white/35 text-[13px] sm:text-sm italic">
              {mascot.description}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── CTA Button — centred bottom ── */}
      <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 flex justify-center z-[10]">
        <Link href={`/analyze/${mascot.id}`} passHref legacyBehavior>
          <motion.a
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-8 py-3.5
                       rounded-full bg-white text-[#07070A]
                       font-semibold text-sm tracking-[-0.01em]
                       cursor-pointer
                       transition-shadow duration-300"
            style={{
              boxShadow: `0 0 40px ${mascot.color}25, 0 8px 30px rgba(0,0,0,0.35)`,
            }}
          >
            Pick {mascot.name}
          </motion.a>
        </Link>
      </div>

      {/* ── Pagination dots ── */}
      <div className="absolute bottom-7 sm:bottom-10 left-0 right-0 flex justify-center gap-2 z-[10]">
        {MASCOTS.map((m, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={m.id}
              onClick={() =>
                goTo(i, i > activeIndex ? 1 : i < activeIndex ? -1 : 0)
              }
              aria-label={`Select ${m.name}`}
              className="relative rounded-full transition-all duration-400 cursor-pointer
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
              style={{
                width: isActive ? 28 : 8,
                height: 8,
                backgroundColor: isActive ? m.color : "rgba(255,255,255,0.15)",
                boxShadow: isActive ? `0 0 12px ${m.color}60` : "none",
              }}
            />
          );
        })}
      </div>

      {/* ── Keyboard hint ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-2 left-0 right-0 text-center
                   text-[9px] text-white/15 tracking-[0.12em] uppercase font-mono
                   z-[10] pointer-events-none hidden md:block"
      >
        ← → or swipe to navigate
      </motion.p>
    </section>
  );
}
