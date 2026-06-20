"use client";

import { motion } from "framer-motion";
import { Sparkles, ShieldAlert, Target, FileText } from "lucide-react";

interface StoryStep {
  number: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  desc: string;
  color: string;
  mockUI: React.ReactNode;
}

export default function FeaturesSection() {
  const steps: StoryStep[] = [
    {
      number: "01",
      icon: Sparkles,
      title: "Find Your Match",
      subtitle: "Choose from 5 AI Mascots",
      desc: "Connect with Scouty, Nova, Blaze, Sage, or Echo. Each character brings a unique feedback style—from Blaze's blunt critiques to Echo's narrative coaching. Find the aesthetic and guidance that suits you.",
      color: "#A78BFA",
      mockUI: (
        <div className="w-full h-full bg-[#0C0C12]/60 rounded-2xl p-5 border border-white/[0.04] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA] animate-pulse" />
            <span className="text-[10px] font-mono tracking-wider text-white/45">PERSONA SELECTOR</span>
          </div>
          <div className="space-y-2.5 my-4">
            {["Nova (The Visionary)", "Blaze (The Challenger)", "Sage (The Mentor)"].map((m, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-xl border text-[11px] font-semibold flex justify-between items-center transition-all duration-300 ${
                  idx === 0 ? 'border-violet-500/30 bg-violet-500/5 text-violet-400' : 'border-white/[0.03] bg-white/[0.005] text-white/50'
                }`}
              >
                <span>{m}</span>
                <span className="text-[9px] font-mono opacity-80">{idx === 0 ? "Active" : "Select"}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-white/30 italic text-left font-mono">
            &gt; Initializing welcome narrative script...
          </div>
        </div>
      )
    },
    {
      number: "02",
      icon: ShieldAlert,
      title: "Parser Integrity Audit",
      subtitle: "ATS scoring in real time",
      desc: "Our engine reviews your formatting, section divisions, and keyword weighting. Spot readability errors and passive phrasing before your CV ever hits a recruiter's applicant tracking system.",
      color: "#34D399",
      mockUI: (
        <div className="w-full h-full bg-[#0C0C12]/60 rounded-2xl p-5 border border-white/[0.04] flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono tracking-wider text-white/45">ATS AUDITING</span>
            <span className="text-xs font-bold font-mono text-[#34D399]">84% Match</span>
          </div>
          <div className="space-y-3 my-4 text-left">
            <div>
              <div className="flex justify-between text-[10px] font-medium text-white/60 mb-1">
                <span>Keyword Density</span>
                <span>76%</span>
              </div>
              <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full bg-[#34D399] rounded-full" style={{ width: '76%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-medium text-white/60 mb-1">
                <span>Impact Verbs</span>
                <span>92%</span>
              </div>
              <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full bg-[#34D399] rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#34D399] bg-[#34D399]/5 px-2.5 py-1.5 rounded-lg border border-[#34D399]/15">
            <Check size={10} /> Clean layout structure detected
          </div>
        </div>
      )
    },
    {
      number: "03",
      icon: Target,
      title: "Opportunity Scan",
      subtitle: "Map CV to active developer jobs",
      desc: "Our platform scans your core technologies and maps them directly to high-paying jobs in our directory. Instantly review salary margins, location details, and core qualifications for frontend, backend, and architect roles.",
      color: "#38BDF8",
      mockUI: (
        <div className="w-full h-full bg-[#0C0C12]/60 rounded-2xl p-5 border border-white/[0.04] flex flex-col justify-between relative overflow-hidden text-left">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono tracking-wider text-white/45">NovaScale AI</span>
            <span className="text-[9px] font-mono text-[#38BDF8] border border-[#38BDF8]/20 px-1.5 py-0.5 rounded">$140k - $175k</span>
          </div>
          <div className="my-3">
            <h4 className="text-xs font-bold text-white mb-1">Full-Stack Developer</h4>
            <p className="text-[10px] text-white/55 leading-relaxed truncate">Design REST/GraphQL API servers with Node.js and React...</p>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {["React", "Node.js", "SQL"].map((tag) => (
              <span key={tag} className="text-[8px] font-semibold font-mono text-white/40 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      number: "04",
      icon: FileText,
      title: "Letter Forging Room",
      subtitle: "Tailored motivation statements",
      desc: "Select a job opening, click compile, and watch the AI write a cover letter customized to your resume and the company's description. Copy or download a text copy to land interviews faster.",
      color: "#FB923C",
      mockUI: (
        <div className="w-full h-full bg-[#0C0C12]/60 rounded-2xl p-5 border border-white/[0.04] flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
            <span className="text-[10px] font-mono tracking-wider text-white/45">Motivation_Letter.txt</span>
            <span className="text-[9px] text-[#FB923C] font-semibold uppercase tracking-wider">Compiling</span>
          </div>
          <div className="bg-[#050508] border border-white/[0.03] rounded-lg p-3 my-3 font-mono text-[9px] text-white/60 text-left space-y-1 h-[72px] overflow-hidden">
            <div>Dear Hiring Committee,</div>
            <div className="opacity-80">I am writing to express my interest in the Full-Stack Developer...</div>
            <div className="opacity-50">My background in React matches your objectives...</div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-7 bg-white/[0.03] border border-white/[0.08] rounded-full flex items-center justify-center text-[9px] font-semibold text-white/50">
              Copy
            </div>
            <div className="flex-1 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-[#07070A]" style={{ backgroundColor: "#FB923C" }}>
              Download
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 relative border-t border-white/[0.02]">
      
      {/* Background accents */}
      <div className="absolute right-0 top-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-20 sm:mb-28">
        <motion.span 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.22em] text-violet-400"
        >
          Product Ecosystem
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mt-3 leading-tight tracking-tight text-white"
        >
          A Storytelling Journey
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/45 text-sm sm:text-base mt-4 leading-relaxed font-sans"
        >
          How CVision AI transforms your resume from an unread document to a highly optimized matching tool that wins interviews.
        </motion.p>
      </div>

      {/* Storytelling Timeline Vertical Grid */}
      <div className="relative w-full max-w-5xl mx-auto">
        
        {/* Central dashed line (desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-[1px] border-l border-dashed border-white/[0.08] hidden md:block" />

        <div className="space-y-16 sm:space-y-24 md:space-y-32">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full relative"
              >
                
                {/* Central Circle Marker (desktop) */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border bg-[#07070A] flex items-center justify-center z-10 hidden md:flex transition-transform duration-300 hover:scale-110"
                  style={{ borderColor: `${step.color}25` }}
                >
                  <Icon size={14} style={{ color: step.color }} />
                </div>

                {/* Left Column (Text on odd, UI mockup on even) */}
                <div className={`md:col-span-5 ${isEven ? "md:order-1 text-left md:text-right md:pr-10" : "md:order-3 text-left md:pl-10"}`}>
                  <div className="flex items-center gap-3 mb-2 justify-start md:justify-end">
                    <span className="font-mono text-2xl font-black opacity-20" style={{ color: step.color }}>{step.number}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: step.color }}>{step.subtitle}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-tight">{step.title}</h3>
                  <p className="text-white/45 text-xs sm:text-sm leading-relaxed max-w-md md:ml-auto">
                    {step.desc}
                  </p>
                </div>

                {/* Center Column Spacer */}
                <div className="md:col-span-2 md:order-2" />

                {/* Right Column (UI mockup on odd, Text on even) */}
                <div className={`md:col-span-5 ${isEven ? "md:order-3 md:pl-10" : "md:order-1 md:pr-10"}`}>
                  <div 
                    className="aspect-video w-full max-w-sm mx-auto p-1.5 rounded-3xl border bg-white/[0.005] shadow-2xl relative overflow-hidden group transition-all duration-500"
                    style={{ 
                      borderColor: "rgba(255,255,255,0.04)",
                      boxShadow: `0 8px 30px rgba(0,0,0,0.3)` 
                    }}
                  >
                    {step.mockUI}
                    {/* Hover Card Glow Accents */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-[40px] -z-10"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${step.color}18 0%, transparent 60%)`
                      }}
                    />
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>

    </section>
  );
}

function Check({ size, className }: { size?: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      style={{ width: size, height: size }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
