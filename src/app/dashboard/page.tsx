"use client";

import { motion } from "framer-motion";
import { TrendingUp, Sparkles, Heart, Zap, Bot, Calendar, ArrowUpRight, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25,0.46,0.45,0.94] as any } } };

const KPI_CARDS = [
  { label: "Daily Revenue",       value: "$12,480", delta: "+14.2%", positive: true,  icon: TrendingUp, accent: "bg-sage/20 text-sage-dark border-sage/20" },
  { label: "AI Scans Today",      value: "482",     delta: "+28.4%", positive: true,  icon: Sparkles,   accent: "bg-lavender/20 text-[#6b4fa0] border-lavender/20" },
  { label: "Client Satisfaction", value: "98.2%",   delta: "+1.2%",  positive: true,  icon: Heart,      accent: "bg-blush/20 text-[#a0416b] border-blush/20" },
  { label: "Active Services",     value: "24",      delta: "Live",   positive: true,  icon: Zap,        accent: "bg-peach/20 text-[#9a5c2e] border-peach/20" },
];

const APPOINTMENTS = [
  { name: "Seraphina J.", service: "Molecular Infusion",  time: "14:30", status: "In Progress", statusClass: "badge-info" },
  { name: "Dominic R.",   service: "Scalp Detox",          time: "15:00", status: "Arrived",     statusClass: "badge-success" },
  { name: "Elena V.",     service: "Neural Color Scan",    time: "15:45", status: "Upcoming",    statusClass: "badge-warning" },
  { name: "Marcus W.",    service: "Keratin Treatment",    time: "16:15", status: "Upcoming",    statusClass: "badge-warning" },
];

const CHART_BARS = [42, 67, 55, 80, 72, 91, 78, 95, 85, 100, 88, 76];
const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">

      {/* Page header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Overview</p>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Command Center</h1>
          <p className="text-sm text-text-secondary mt-1">Aggregated intelligence across all active branches.</p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded-xl bg-white border border-black/[0.07] text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-black/[0.12] transition-all shadow-sm">
            System Report
          </button>
          <button className="h-10 px-4 rounded-xl bg-text-primary text-white text-sm font-semibold hover:bg-text-primary/90 transition-all shadow-md shadow-black/10">
            + Manual Entry
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div key={kpi.label} variants={fadeUp} className="card p-6 relative overflow-hidden group cursor-default">
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold mb-4", kpi.accent)}>
              <kpi.icon className="w-3 h-3" />
              {kpi.label}
            </div>
            <p className="text-[32px] font-extrabold tracking-tight text-text-primary leading-none">{kpi.value}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", kpi.positive ? "bg-sage/20 text-sage-dark" : "bg-red-50 text-red-500")}>
                {kpi.delta}
              </span>
              <span className="text-[11px] text-text-muted">vs yesterday</span>
            </div>
            <div className="absolute top-4 right-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
              <kpi.icon className="w-16 h-16 text-text-primary" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Middle row */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-text-primary">Revenue Trend</h2>
              <p className="text-[12px] text-text-muted mt-0.5">12-month performance overview</p>
            </div>
            <div className="flex gap-1">
              {["1M","3M","6M","1Y"].map((t, i) => (
                <button key={t} className={cn("h-7 px-3 rounded-lg text-[11px] font-semibold transition-all", i === 3 ? "bg-lavender/20 text-[#6b4fa0]" : "text-text-muted hover:text-text-secondary hover:bg-black/[0.04]")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {CHART_BARS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: [0.34,1.56,0.64,1] }}
                  style={{ height: `${h}%`, originY: 1 }}
                  className={cn("w-full rounded-t-lg", i === 11 ? "bg-lavender" : "bg-lavender/25 hover:bg-lavender/50 transition-colors cursor-pointer")}
                />
                <span className="text-[9px] text-text-muted font-medium">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insight */}
        <motion.div variants={fadeUp} className="lg:col-span-4 rounded-[28px] p-6 bg-[#14110E] text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-lavender/20 via-transparent to-blush/10 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <Zap className="w-4 h-4 text-lavender" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">Neural Insight</h3>
                <p className="text-[10px] text-lavender/80 mt-0.5 font-medium">Optimisation Active</p>
              </div>
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed font-medium">
              "12% spike in Scalp Detox demand at Soho Hub detected. Recommend reallocating 2 junior stylists from Brooklyn for the evening shift."
            </p>
          </div>
          <button className="relative z-10 mt-4 w-full py-3 rounded-xl bg-lavender text-white text-[12px] font-bold hover:bg-lavender/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-lavender/20">
            Auto-Allocate Resources
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Appointments */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-text-primary">Active Appointments</h2>
              <p className="text-[12px] text-text-muted mt-0.5">Today's real-time queue</p>
            </div>
            <button onClick={() => router.push("/dashboard/neural-schedule")}
              className="flex items-center gap-1 text-[12px] font-semibold text-lavender hover:underline">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {APPOINTMENTS.map((appt, i) => (
              <motion.div key={i} variants={fadeUp}
                className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-black/[0.025] transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-lavender/10 flex items-center justify-center text-lavender font-bold text-sm shrink-0">
                  {appt.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{appt.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{appt.service}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-text-primary">{appt.time}</p>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block", appt.statusClass)}>
                    {appt.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Staff Snapshot */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-text-primary">Staff Performance</h2>
              <p className="text-[12px] text-text-muted mt-0.5">Top performers today</p>
            </div>
            <button onClick={() => router.push("/dashboard/human-assets")}
              className="flex items-center gap-1 text-[12px] font-semibold text-lavender hover:underline">
              All staff <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: "Maya Chen",    role: "Senior Stylist",  score: 98, services: 12 },
              { name: "James Okafor", role: "AI Specialist",   score: 95, services: 9  },
              { name: "Leila Moss",   role: "Color Expert",    score: 91, services: 11 },
            ].map((staff, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender/30 to-blush/30 flex items-center justify-center text-text-primary font-bold text-sm shrink-0">
                  {staff.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] font-semibold text-text-primary truncate">{staff.name}</p>
                    <span className="text-[11px] font-bold text-text-primary">{staff.score}%</span>
                  </div>
                  <div className="h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${staff.score}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-lavender to-blush rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">{staff.services} services · {staff.role}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/dashboard/beauty-passport")}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-lavender/10 border border-lavender/20 text-[12px] font-semibold text-[#6b4fa0] hover:bg-lavender/20 transition-all">
            <Sparkles className="w-3.5 h-3.5" /> Run Beauty Passport Scan
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
