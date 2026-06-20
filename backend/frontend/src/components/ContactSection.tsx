"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, User, Mail, MessageSquare, Code, Terminal, Server } from "lucide-react";

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 relative border-t border-white/[0.02]">
      
      {/* Background accents */}
      <div className="absolute right-1/4 top-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-20">
        <motion.span 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.22em] text-violet-400"
        >
          Get in Touch
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mt-3 leading-tight tracking-tight text-white"
        >
          Contact Developer
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/45 text-sm sm:text-base mt-4 leading-relaxed font-sans"
        >
          Have questions or want to learn more about the parser engine? Shoot us a message directly.
        </motion.p>
      </div>

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto items-stretch">
        
        {/* Left Side: Developer Credit details Card (5 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 rounded-3xl border border-white/[0.04] bg-white/[0.005] p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden text-left"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 opacity-10 blur-[40px] pointer-events-none -z-10 bg-gradient-to-r from-violet-600 to-[#FB923C]" />
          
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-violet-400 border border-violet-500/30 bg-violet-500/8 mb-6">
              <Code size={10} /> Lead Architect
            </div>
            
            <h3 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Adam Kaisoum</h3>
            <p className="text-xs text-violet-400 font-mono tracking-wider font-semibold mb-6 uppercase">Lead Developer & Systems Engineer</p>
            
            <p className="text-xs text-white/50 leading-relaxed mb-6 font-sans">
              Designed and built the full-stack resume parsing sandbox, dynamic career matching directories, and cover letter compilers powering the CVision AI portal.
            </p>

            {/* Technical Stack details info */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-white/70">
                <span className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <Terminal size={12} className="text-violet-400" />
                </span>
                <span className="font-mono">Next.js 16, React 19, TypeScript</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/70">
                <span className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <Server size={12} className="text-emerald-400" />
                </span>
                <span className="font-mono">Framer Motion, Tailwind CSS</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.04] pt-6 mt-8">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/20">CVision AI Platform Project</span>
          </div>
        </motion.div>

        {/* Right Side: Contact Form (7 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 rounded-3xl border border-white/[0.04] bg-white/[0.005] p-7 sm:p-8 relative"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                key="contact-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                {/* Name Field */}
                <div className="space-y-2 relative">
                  <label htmlFor="form-name" className="text-[10px] font-bold uppercase tracking-wider text-white/40 font-mono block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="text"
                      id="form-name"
                      required
                      placeholder="e.g. Jean Dupont"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] focus:border-violet-500/50 rounded-2xl text-sm text-white placeholder-white/20 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2 relative">
                  <label htmlFor="form-email" className="text-[10px] font-bold uppercase tracking-wider text-white/40 font-mono block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="email"
                      id="form-email"
                      required
                      placeholder="e.g. name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] focus:border-violet-500/50 rounded-2xl text-sm text-white placeholder-white/20 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-2 relative">
                  <label htmlFor="form-message" className="text-[10px] font-bold uppercase tracking-wider text-white/40 font-mono block">
                    Your Message
                  </label>
                  <div className="relative">
                    <MessageSquare size={14} className="absolute left-4 top-4.5 text-white/25" />
                    <textarea
                      id="form-message"
                      required
                      rows={4}
                      placeholder="How can we help optimize your career flow?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/[0.06] focus:border-violet-500/50 rounded-2xl text-sm text-white placeholder-white/20 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full text-xs font-bold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-2 bg-white text-[#07070A] hover:bg-white/95 transition-all duration-300 disabled:opacity-50"
                  style={{ boxShadow: "0 0 30px rgba(255,255,255,0.08)" }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#07070A] animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Submit Form</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              
              /* SUCCESS MESSAGE BLOCK */
              <motion.div 
                key="success-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} className="text-[#34D399]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Received!</h3>
                <p className="text-sm text-white/45 max-w-sm leading-relaxed">
                  Thank you for reaching out. We have logged your details. Lead developer Adam Kaisoum will get back to you shortly.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

    </section>
  );
}
