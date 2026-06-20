"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  desc: string;
  popular: boolean;
  features: string[];
  color: string;
  btnText: string;
}

const PLANS: PricingPlan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    desc: "Test the engine with a single resume scan.",
    popular: false,
    color: "rgba(255,255,255,0.4)",
    btnText: "Start Free",
    features: [
      "1 CV scan audit",
      "Access to standard AI coach",
      "Basic scoring summary report",
      "Standard queue speed"
    ]
  },
  {
    name: "Pro",
    monthlyPrice: 19,
    yearlyPrice: 15,
    desc: "For active job seekers looking for coaching feedback.",
    popular: true,
    color: "#7B6EF6",
    btnText: "Upgrade to Pro",
    features: [
      "10 CV scan audits per month",
      "Access to all 5 AI Mascots",
      "Detailed strengths & weaknesses",
      "Tailored job opportunities matching",
      "5 compiled cover letters per month",
      "Priority parser queue speed"
    ]
  },
  {
    name: "Max",
    monthlyPrice: 49,
    yearlyPrice: 39,
    desc: "Unlimited power for high-intensity career consulting.",
    popular: false,
    color: "#FB923C",
    btnText: "Go Unlimited",
    features: [
      "Unlimited CV scans",
      "Access to all 5 AI Mascots",
      "Advanced ATS parser optimization logs",
      "Unlimited compiled cover letters",
      "Dynamic CSV download and exports",
      "Premium 24/7 dedicated support"
    ]
  }
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  return (
    <section id="pricing" className="py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 relative border-t border-white/[0.02]">
      
      {/* Background accents */}
      <div className="absolute left-1/4 bottom-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.span 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.22em] text-violet-400"
        >
          Pricing Plans
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mt-3 leading-tight tracking-tight text-white"
        >
          Choose Your Plan
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/45 text-sm sm:text-base mt-4 leading-relaxed font-sans"
        >
          Unlock detailed analytics, more file uploads, and personalized motivation letters. Cancel or switch subscriptions anytime.
        </motion.p>
      </div>

      {/* Billing Switcher Toggle Switch */}
      <div className="flex justify-center items-center gap-4 mb-16">
        <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${billingCycle === "monthly" ? "text-white" : "text-white/45"}`}>
          Monthly Billed
        </span>
        
        {/* Switch toggle container */}
        <button 
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
          className="w-14 h-7.5 rounded-full bg-white/[0.06] border border-white/[0.08] relative p-1 flex items-center cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
          aria-label="Toggle billing cycle"
        >
          <motion.div 
            className="w-5.5 h-5.5 rounded-full bg-white shadow-lg"
            animate={{
              x: billingCycle === "monthly" ? 0 : 26
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>

        <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 flex items-center gap-2 ${billingCycle === "yearly" ? "text-white" : "text-white/45"}`}>
          <span>Yearly Billed</span>
          <span className="text-[9px] font-bold text-[#34D399] px-2 py-0.5 rounded-full bg-[#34D399]/10 border border-[#34D399]/20 font-mono">
            Save 20%
          </span>
        </span>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
        {PLANS.map((plan, idx) => {
          const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const billingLabel = price === 0 ? "" : billingCycle === "monthly" ? "/ mo" : "/ mo";

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`rounded-3xl border p-7 sm:p-8 flex flex-col justify-between relative transition-all duration-400 group overflow-hidden text-left ${
                plan.popular 
                  ? "bg-[#0A0A10]/70 border-violet-500/40 z-10 md:-translate-y-2 md:scale-103" 
                  : "bg-white/[0.005] border-white/[0.04] hover:bg-white/[0.015] hover:border-white/[0.08]"
              }`}
              style={{
                boxShadow: plan.popular 
                  ? `0 12px 40px rgba(123, 110, 246, 0.08), 0 8px 30px rgba(0,0,0,0.5)`
                  : `0 8px 30px rgba(0,0,0,0.4)`
              }}
            >
              {/* Highlight Background Glow for Popular Plan */}
              {plan.popular && (
                <div className="absolute inset-0 opacity-15 pointer-events-none blur-[40px] -z-10 bg-gradient-to-b from-violet-600 to-indigo-800" />
              )}

              {/* Header Details */}
              <div>
                
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-violet-400 border border-violet-500/30 bg-violet-500/8 mb-6">
                    <Sparkles size={10} />
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2 tracking-wide flex items-center justify-between">
                  <span>{plan.name}</span>
                  {plan.name === "Pro" && <span className="text-xs text-white/30 font-semibold font-mono">Best Value</span>}
                </h3>
                <p className="text-xs text-white/45 leading-relaxed mb-6 max-w-[220px]">
                  {plan.desc}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-white/[0.04]">
                  <span className="text-4xl font-extrabold text-white tracking-tight">${price}</span>
                  <span className="text-xs text-white/35 font-semibold font-mono">{billingLabel}</span>
                  {billingCycle === "yearly" && price > 0 && (
                    <span className="text-[10px] text-white/30 font-mono block ml-2">
                      (Billed annually ${price * 12})
                    </span>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-xs text-white/70 leading-relaxed">
                      <span className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border"
                            style={{ 
                              borderColor: plan.popular ? `${plan.color}25` : "rgba(255,255,255,0.08)",
                              backgroundColor: plan.popular ? `${plan.color}08` : "rgba(255,255,255,0.02)" 
                            }}
                      >
                        <Check size={11} style={{ color: plan.popular ? plan.color : "rgba(255,255,255,0.6)" }} />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-3 rounded-full text-xs font-bold tracking-wider uppercase cursor-pointer transition-all duration-300 ${
                  plan.popular
                    ? "text-[#07070A]"
                    : "border border-white/[0.08] text-white hover:bg-white hover:text-[#07070A] hover:border-white"
                }`}
                style={{
                  backgroundColor: plan.popular ? plan.color : "transparent",
                  boxShadow: plan.popular ? `0 0 20px ${plan.color}40` : "none"
                }}
                onClick={() => alert(`Redirecting to subscribe process for ${plan.name} tier...`)}
              >
                {plan.btnText}
              </button>

            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
