"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles, ChevronRight, ShoppingBag, Scissors, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

const SERVICES = [
  { name: "Molecular Shine Booster",   duration: "60 min", price: "$120", fit: "High",   reason: "Matches hair texture profile" },
  { name: "Scalp Neural Detox",        duration: "45 min", price: "$95",  fit: "Medium", reason: "Scalp condition trending dry" },
  { name: "AI Colour Mapping Session", duration: "90 min", price: "$180", fit: "High",   reason: "Colour passport indicates warm undertones" },
];

const SOP_STEPS = [
  { step: 1, title: "Client Consultation",    detail: "Review Beauty Passport scan and discuss goals",       done: true },
  { step: 2, title: "Scalp Analysis",         detail: "Use digital scalp reader on crown and nape sections", done: true },
  { step: 3, title: "Product Preparation",    detail: "Mix formula per AI-calculated ratios",               done: false },
  { step: 4, title: "Application",            detail: "Apply in 4 quadrants, starting from nape",           done: false },
  { step: 5, title: "Processing & Rinse",     detail: "Monitor via thermal sensor, rinse at optimal temp",  done: false },
  { step: 6, title: "Finish & Recommendation",detail: "Style and hand off home-care kit",                   done: false },
];

const PRODUCTS = [
  { name: "Lustre Radiance Serum",   price: "$48", category: "Finish" },
  { name: "Hydro-Bond Mask",         price: "$36", category: "Treatment" },
  { name: "Colour-Lock Shampoo",     price: "$28", category: "Cleanse" },
  { name: "Neural Scalp Activator",  price: "$55", category: "Scalp" },
];

export default function StylistCoPilotPage() {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">AI Tools</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Stylist CoPilot</h1>
          <p className="text-sm text-text-secondary mt-1">AI-driven service recommendations and live SOP guidance.</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-lavender/15 border border-lavender/30 text-[#6b4fa0] text-sm font-semibold flex items-center gap-2 hover:bg-lavender/25 transition-all">
          <Bot className="w-4 h-4" /> Load Client
        </button>
      </motion.div>

      {/* Customer summary */}
      <motion.div variants={fadeUp} className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender/30 to-blush/30 flex items-center justify-center text-2xl font-black text-text-primary shrink-0">S</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-extrabold text-text-primary">Seraphina J.</h2>
              <span className="badge-info text-[10px] font-bold px-2.5 py-1 rounded-full">VIP Client</span>
              <span className="text-[11px] text-text-muted">★ 4.9 · 18 visits</span>
            </div>
            <p className="text-[12px] text-text-secondary mt-1">Last visit: 6 weeks ago · Molecular Infusion + Colour</p>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Face Shape", value: "Oval" },
              { label: "Skin Tone",  value: "Light / Warm" },
              { label: "Hair Type",  value: "Wavy · Fine" },
            ].map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-black/[0.03]">
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{d.label}</p>
                <p className="text-[13px] font-bold text-text-primary mt-0.5">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Services + SOP side by side */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Recommended services */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-5">
          <h2 className="text-base font-bold text-text-primary mb-1">Recommended Services</h2>
          <p className="text-[12px] text-text-muted mb-4">Based on scan + visit history</p>
          <div className="space-y-2.5">
            {SERVICES.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.05] hover:border-lavender/30 hover:bg-lavender/[0.02] transition-all cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-lavender/15 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-[#6b4fa0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text-primary truncate">{s.name}</p>
                  <p className="text-[10px] text-text-muted">{s.duration} · {s.price}</p>
                  <p className="text-[10px] text-text-secondary mt-0.5 italic">{s.reason}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", s.fit === "High" ? "badge-success" : "badge-warning")}>
                  {s.fit} Fit
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SOP Steps */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-7">
          <h2 className="text-base font-bold text-text-primary mb-1">SOP Timeline</h2>
          <p className="text-[12px] text-text-muted mb-5">Molecular Infusion · Step-by-step protocol</p>
          <div className="relative">
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-black/[0.06]" />
            <div className="space-y-3">
              {SOP_STEPS.map((s, i) => (
                <motion.div key={i} variants={fadeUp}
                  className={cn("flex items-start gap-3.5 pl-1", s.done ? "opacity-60" : "")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10 mt-0.5 border-2",
                    s.done ? "bg-sage/30 border-sage text-sage-dark" : i === SOP_STEPS.filter(x => x.done).length ? "bg-lavender border-lavender text-white" : "bg-white border-black/[0.10] text-text-muted")}>
                    {s.done ? "✓" : s.step}
                  </div>
                  <div className={cn("flex-1 p-3 rounded-2xl border transition-all", i === SOP_STEPS.filter(x => x.done).length ? "border-lavender/30 bg-lavender/[0.04]" : "border-black/[0.04] bg-transparent")}>
                    <p className="text-[13px] font-semibold text-text-primary">{s.title}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{s.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Upsell + Products */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Upsell */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-4 bg-[#14110E] text-white relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-lavender/30 to-blush/10 pointer-events-none" />
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Star className="w-4 h-4 text-peach" />
              <h2 className="text-sm font-bold">Upsell Opportunity</h2>
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed mb-4">
              "Seraphina's colour is due for a refresh. Recommend the AI Colour Mapping upgrade — 82% of similar clients convert at this stage."
            </p>
            <div className="p-3 rounded-xl bg-white/[0.06] border border-white/[0.08] mb-4">
              <p className="text-[11px] text-white/50 font-medium">Potential add-on value</p>
              <p className="text-2xl font-extrabold text-white mt-0.5">+ $180</p>
            </div>
          </div>
          <button className="relative z-10 w-full py-2.5 rounded-xl bg-lavender text-white text-[12px] font-bold hover:bg-lavender/90 transition-all flex items-center justify-center gap-2">
            Suggest to Client <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Product recommendations */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-8">
          <h2 className="text-base font-bold text-text-primary mb-1">Product Recommendations</h2>
          <p className="text-[12px] text-text-muted mb-4">Tailored retail for today's service</p>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.05] hover:border-lavender/30 transition-all cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-peach/15 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4 text-[#9a5c2e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-text-primary truncate">{p.name}</p>
                  <p className="text-[10px] text-text-muted">{p.category}</p>
                </div>
                <p className="text-[13px] font-bold text-text-primary shrink-0">{p.price}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
