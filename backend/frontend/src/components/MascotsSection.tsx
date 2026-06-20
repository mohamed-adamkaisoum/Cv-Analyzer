"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Award, Compass, Heart, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";

interface MascotCardData {
  id: string;
  name: string;
  tagline: string;
  color: string;
  desc: string;
  focus: string;
  image: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
}

const MASCOTS_DATA: MascotCardData[] = [
  {
    id: "scouty",
    name: "Scouty",
    tagline: "The Explorer",
    color: "#34D399",
    desc: "Rigorous detail audit. Scouts out every structural mismatch, checks formatting guidelines, and validates keyword density.",
    focus: "ATS Grammar & Keywords",
    image: "/scouty.png",
    icon: Compass
  },
  {
    id: "nova",
    name: "Nova",
    tagline: "The Visionary",
    color: "#A78BFA",
    desc: "Long-term career focus. Aligns your experience with emerging industry technologies and projects 5-year trajectories.",
    focus: "Market Trends & Trajectory",
    image: "/nova.png",
    icon: Sparkles
  },
  {
    id: "blaze",
    name: "Blaze",
    tagline: "The Challenger",
    color: "#FB923C",
    desc: "Raw, unfiltered honesty. Calls out filler sentences, weak action verbs, and helps you strip the clutter from your resume.",
    focus: "Impact Verbs & Efficiency",
    image: "/blaze.png",
    icon: ShieldAlert
  },
  {
    id: "sage",
    name: "Sage",
    tagline: "The Mentor",
    color: "#38BDF8",
    desc: "Wisdom-focused guidance. Helps you frame your achievements confidently, balancing advice with encouragement.",
    focus: "Value Framing & Confidence",
    image: "/sage.png",
    icon: Award
  },
  {
    id: "echo",
    name: "Echo",
    tagline: "The Empath",
    color: "#F472B6",
    desc: "Story-driven coach. Focuses on the human element, elevator summaries, and building an authentic professional narrative.",
    focus: "Narrative Tone & Bio Summary",
    image: "/echo.png",
    icon: Heart
  }
];

export default function MascotsSection() {
  return (
    <section id="mascots" className="py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 relative border-t border-white/[0.02] bg-gradient-to-b from-transparent via-[#08080C]/40 to-transparent">
      
      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-20">
        <motion.span 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.22em] text-violet-400"
        >
          AI Coaches
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mt-3 leading-tight tracking-tight text-white"
        >
          Meet the Mascots
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/45 text-sm sm:text-base mt-4 leading-relaxed font-sans"
        >
          Each personality offers a different perspective on your professional career. Find the coaching voice that helps you achieve your goals.
        </motion.p>
      </div>

      {/* Mascot directory grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {MASCOTS_DATA.map((mascot, idx) => {
          const FocusIcon = mascot.icon;

          return (
            <motion.div
              key={mascot.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="group rounded-3xl border border-white/[0.04] bg-white/[0.005] hover:bg-white/[0.015] hover:border-white/[0.08] p-5 flex flex-col justify-between transition-all duration-400 relative overflow-hidden text-left"
              style={{
                boxShadow: "0 8px 30px rgba(0,0,0,0.4)"
              }}
            >
              
              {/* Mascot Spotlight Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-[40px] -z-10"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${mascot.color}0F 0%, transparent 60%)`
                }}
              />

              {/* Upper Section Info */}
              <div>
                
                {/* Mascot Image Float */}
                <div className="w-full aspect-square rounded-2xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-center relative overflow-hidden mb-5 group-hover:border-white/[0.08] transition-colors">
                  <motion.div
                    className="absolute w-24 h-24 rounded-full blur-[24px] opacity-15"
                    style={{ backgroundColor: mascot.color }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mascot.image}
                    alt={mascot.name}
                    className="h-[80%] w-auto object-contain select-none group-hover:scale-108 group-hover:-translate-y-2 transition-all duration-500 ease-out"
                    draggable={false}
                  />
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: mascot.color }}>
                    {mascot.tagline}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-wide">{mascot.name}</h3>
                
                <p className="text-white/40 text-xs leading-relaxed mb-4">
                  {mascot.desc}
                </p>
              </div>

              {/* Lower Section Focus Details & Link */}
              <div className="border-t border-white/[0.04] pt-4 mt-2">
                <div className="flex items-center gap-2 text-white/50 text-[10px] font-semibold tracking-wide uppercase mb-3">
                  <FocusIcon size={12} style={{ color: mascot.color }} />
                  <span className="truncate">{mascot.focus}</span>
                </div>
                
                <Link
                  href={`/analyze/${mascot.id}`}
                  className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] hover:bg-white text-xs font-semibold text-white hover:text-[#07070A] hover:border-white transition-all duration-300 cursor-pointer"
                >
                  <span>Consult {mascot.name}</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>

            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
