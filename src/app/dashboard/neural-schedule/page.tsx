"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  Zap, 
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const APPOINTMENTS = [
  { id: 1, client: "Seraphina J.", service: "Molecular Infusion", stylist: "Elena Rossi", time: "10:00 AM", duration: "90m", status: "In-Progress", color: "text-lavender", bg: "bg-lavender/10" },
  { id: 2, client: "Dominic R.", service: "Scalp Detox", stylist: "Marcus Chen", time: "11:30 AM", duration: "60m", status: "Arrived", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: 3, client: "Elena V.", service: "Neural Color Scan", stylist: "Sofia Vega", time: "12:45 PM", duration: "45m", status: "Upcoming", color: "text-peach", bg: "bg-peach/10" },
  { id: 4, client: "Thomas K.", service: "Precision Cut", stylist: "Julien Blanc", time: "02:00 PM", duration: "60m", status: "Upcoming", color: "text-lavender", bg: "bg-lavender/10" },
  { id: 5, client: "Isabella L.", service: "Hydration Therapy", stylist: "Sarah Miller", time: "03:30 PM", duration: "75m", status: "Upcoming", color: "text-blush", bg: "bg-blush/10" },
];

export default function NeuralSchedulePage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
         <div>
           <h2 className="text-4xl font-black tracking-tighter mb-2 text-text-primary">Neural <span className="text-lavender">Schedule</span></h2>
           <p className="text-sm font-medium text-text-secondary italic">AI-optimized appointment and staff allocation engine.</p>
         </div>
         <div className="flex gap-4">
            <div className="flex p-1.5 rounded-2xl bg-card border border-foreground/5 shadow-sm">
               {['day', 'week', 'month'].map((v) => (
                  <button 
                    key={v}
                    onClick={() => setView(v as any)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      view === v ? "bg-foreground text-card shadow-lg" : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {v}
                  </button>
               ))}
            </div>
            <button className="px-8 py-4 rounded-2xl bg-lavender text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-lavender/20 hover:scale-105 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Appointment
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Main Calendar View */}
         <div className="lg:col-span-8 space-y-8">
            <div className="glass p-10 rounded-[3.5rem] border-foreground/5 shadow-2xl">
               <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-6">
                     <h3 className="text-2xl font-black tracking-tight">Today, 12 Oct</h3>
                     <div className="flex gap-2">
                        <button className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors">
                           <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors">
                           <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-sage/10 border border-sage/20">
                     <Sparkles className="w-4 h-4 text-sage-dark" />
                     <span className="text-[10px] font-black uppercase text-sage-dark italic">AI Slot Optimized</span>
                  </div>
               </div>

               <div className="space-y-4">
                  {APPOINTMENTS.map((apt, i) => (
                     <motion.div 
                        key={apt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-card border border-foreground/5 group hover:border-lavender/30 transition-all cursor-pointer relative overflow-hidden"
                     >
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", apt.status === 'In-Progress' ? "bg-lavender" : "bg-foreground/10")} />
                        
                        <div className="w-24 text-center border-r border-foreground/5 pr-6">
                           <p className="text-sm font-black text-text-primary">{apt.time}</p>
                           <p className="text-[9px] font-black text-text-muted uppercase mt-1">{apt.duration}</p>
                        </div>

                        <div className="flex-1">
                           <h4 className="font-black text-base text-text-primary">{apt.client}</h4>
                           <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">{apt.service}</p>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-text-muted uppercase">Stylist</p>
                              <p className="text-xs font-black text-text-primary">{apt.stylist}</p>
                           </div>
                           <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] flex items-center justify-center font-black text-[10px] text-text-muted">
                              {apt.stylist.split(' ').map(n => n[0]).join('')}
                           </div>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-foreground/5">
                           <div className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full", apt.bg, apt.color)}>
                              {apt.status}
                           </div>
                           <button className="p-2 hover:bg-foreground/5 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4 text-text-muted" />
                           </button>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar Stats & Agenda */}
         <div className="lg:col-span-4 space-y-10">
            {/* AI Scheduling Recommendation */}
            <div className="bg-[#0A0A0B] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-32 h-32 text-lavender" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-xl">
                        <Bot className="w-6 h-6 text-lavender" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black tracking-tight">Schedule Hub</h3>
                        <p className="text-[9px] font-black text-lavender uppercase tracking-widest italic">Neural Optimizer</p>
                     </div>
                  </div>
                  <p className="text-sm font-medium text-white/50 leading-relaxed italic mb-8">
                    "Detected a 30min gap at 12:00 PM. High probability of walk-in for 'Scalp Detox' based on Soho branch historical data. Ready for allocation."
                  </p>
                  <button className="w-full py-5 rounded-2xl bg-lavender text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-lavender/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                     <Zap className="w-4 h-4" /> Apply Optimization
                  </button>
               </div>
            </div>

            {/* Today's Agenda Summary */}
            <div className="bg-card p-10 rounded-[3.5rem] border border-foreground/5 shadow-2xl">
               <h3 className="text-xl font-black tracking-tight mb-8 px-2">Today's Pulse</h3>
               <div className="space-y-6">
                  {[
                     { label: "Booked Slots", value: "32/40", icon: CheckCircle2, color: "text-sage-dark", bg: "bg-sage/20" },
                     { label: "Waitlist", value: "12 Clients", icon: Clock, color: "text-lavender", bg: "bg-lavender/10" },
                     { label: "Conflicts", value: "0 Detected", icon: AlertCircle, color: "text-peach", bg: "bg-peach/10" },
                  ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-[2rem] bg-foreground/[0.02] border border-foreground/5">
                        <div className="flex items-center gap-4">
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.bg, item.color)}>
                              <item.icon className="w-5 h-5" />
                           </div>
                           <span className="text-xs font-black text-text-secondary uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className="text-sm font-black text-text-primary">{item.value}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
