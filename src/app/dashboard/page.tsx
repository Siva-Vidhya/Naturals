"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Sparkles,
  Zap,
  Smartphone,
  Star,
  Award,
  Heart,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Bot
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();

  const stats = [
    { label: "Daily Revenue", value: "$12,480", change: "+14.2%", icon: TrendingUp, color: "text-sage-dark", bg: "bg-sage/20" },
    { label: "AI Scans", value: "482", change: "+28.4%", icon: Sparkles, color: "text-lavender", bg: "bg-lavender/10" },
    { label: "Client Satisfaction", value: "98.2%", change: "+1.2%", icon: Heart, color: "text-blush", bg: "bg-blush/10" },
    { label: "Active Services", value: "24", change: "Live", icon: Zap, color: "text-peach", bg: "bg-peach/10" },
  ];

  return (
    <>
      <div className="flex justify-between items-end mb-12">
         <div>
           <h2 className="text-4xl font-black tracking-tighter mb-2 text-text-primary">Command <span className="text-lavender">Center</span></h2>
           <p className="text-sm font-medium text-text-secondary italic">Aggregated neural telemetry from all active branches.</p>
         </div>
         <div className="flex gap-4">
            <button className="px-8 py-4 rounded-2xl bg-card text-xs font-black uppercase tracking-widest border border-foreground/5 shadow-sm hover:bg-text-primary hover:text-card transition-all">
              System Report
            </button>
            <button className="px-8 py-4 rounded-2xl bg-lavender text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-lavender/30 hover:scale-105 transition-all">
              + Manual Entry
            </button>
         </div>
      </div>

      {/* Core Metrics HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-8 rounded-[3rem] shadow-sm border border-foreground/5 relative overflow-hidden group hover:shadow-2xl hover:shadow-foreground/5 transition-all cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-15 transition-opacity">
              <stat.icon className="w-20 h-20 text-text-muted" />
            </div>
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-white/40", stat.bg, stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-4">
              <h3 className="text-4xl font-black tracking-tighter text-text-primary">{stat.value}</h3>
              <div className={cn("text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1", stat.bg, stat.color)}>
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Activity Monitor */}
         <div className="lg:col-span-7 glass p-10 rounded-[3.5rem] border-foreground/5 shadow-2xl">
            <div className="flex justify-between items-center mb-12">
               <div>
                  <h3 className="text-2xl font-black tracking-tight text-text-primary">Active Pulse</h3>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1 italic">Real-time scheduling telemetry</p>
               </div>
               <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
                     <Calendar className="w-5 h-5" />
                  </button>
               </div>
            </div>
            <div className="space-y-6">
               {[
                  { client: "Seraphina J.", service: "Molecular Infusion", time: "14:30", tech: "AI-Assist v4", status: "In-Progress", color: "text-lavender", bg: "bg-lavender/10" },
                  { client: "Dominic R.", service: "Scalp Detox", time: "15:00", tech: "Standard SOP", status: "Arrived", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { client: "Elena V.", service: "Neural Color Scan", time: "15:45", tech: "OpenCV Engine", status: "Upcoming", color: "text-peach", bg: "bg-peach/10" },
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-card border border-foreground/5 hover:scale-[1.02] transition-all cursor-pointer group">
                     <div className="w-16 h-16 rounded-2xl bg-foreground/[0.03] flex items-center justify-center text-text-muted font-black text-xl group-hover:bg-lavender/10 group-hover:text-lavender transition-all shadow-sm">
                        {item.client.charAt(0)}
                     </div>
                     <div className="flex-1">
                        <h4 className="font-black text-base text-text-primary">{item.client}</h4>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">{item.service} • {item.tech}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-text-primary">{item.time}</p>
                        <div className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 inline-block", item.bg, item.color)}>
                           {item.status}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Right Column: AI Insights & Mobile Preview */}
         <div className="lg:col-span-5 space-y-10">
            {/* Neural Insights Card */}
            <div className="bg-[#0A0A0B] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Bot className="w-32 h-32 text-lavender" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-xl">
                        <Zap className="w-6 h-6 text-lavender" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black tracking-tight">Neural Insight</h3>
                        <p className="text-[9px] font-black text-lavender uppercase tracking-widest italic">Optimization Active</p>
                     </div>
                  </div>
                  <p className="text-sm font-medium text-white/60 leading-relaxed italic mb-8">
                    "System detects a 12% spike in 'Scalp Detox' demand for Soho Hub. Recommend reallocating 2 junior stylists from Brooklyn branch for the evening shift."
                  </p>
                  <button className="w-full py-5 rounded-2xl bg-lavender text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-lavender/30 hover:scale-[1.02] transition-all">
                     Auto-Allocate Resources
                  </button>
               </div>
            </div>

            {/* Customer Portal Quick Access */}
            <div className="bg-card p-10 rounded-[3.5rem] border border-foreground/5 shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => router.push("/dashboard/mobile-experience")}>
               <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-peach/10 rounded-full blur-3xl" />
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                     <div className="w-14 h-14 rounded-2xl bg-peach/10 flex items-center justify-center text-peach border border-peach/20 shadow-sm">
                        <Smartphone className="w-7 h-7" />
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-peach/5 border border-peach/10">
                        <Star className="w-3 h-3 text-peach" />
                        <span className="text-[9px] font-black text-peach uppercase tracking-widest italic">Live Preview</span>
                     </div>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-4 text-text-primary">Customer Portal</h3>
                  <p className="text-xs font-medium text-text-secondary leading-relaxed mb-10 max-w-xs">
                     Experience the NeuroStrom journey from the client's perspective. Beauty Passport, AI rewards, and more.
                  </p>
                  <button className="flex items-center gap-4 px-8 py-4 bg-text-primary text-card rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-foreground/10 group-hover:scale-105 transition-all">
                     Launch Experience
                     <ArrowUpRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
      </div>
    </>
  );
}
