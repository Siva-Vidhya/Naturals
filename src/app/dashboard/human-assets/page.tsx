"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Star, 
  Award, 
  TrendingUp, 
  CheckCircle2,
  MapPin,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAFF_MEMBERS = [
  { id: 1, name: "Elena Rossi", role: "Master Stylist", branch: "Soho Flagship", specialty: "Molecular Infusion", score: 98, progress: 100, status: "Active", experience: "12 yrs", image: "ER" },
  { id: 2, name: "Marcus Chen", role: "Senior Technician", branch: "Soho Flagship", specialty: "Scalp Detox", score: 94, progress: 85, status: "Active", experience: "8 yrs", image: "MC" },
  { id: 3, name: "Sarah Miller", role: "Junior Stylist", branch: "Brooklyn Hub", specialty: "Purification", score: 88, progress: 70, status: "Training", experience: "3 yrs", image: "SM" },
  { id: 4, name: "Julien Blanc", role: "Art Director", branch: "Upper East", specialty: "Hair Mapping", score: 99, progress: 100, status: "Active", experience: "15 yrs", image: "JB" },
  { id: 5, name: "Sofia Vega", role: "Color Specialist", branch: "Soho Flagship", specialty: "Tone Match", score: 92, progress: 95, status: "Active", experience: "6 yrs", image: "SV" },
];

export default function HumanAssetsPage() {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
         <div>
           <h2 className="text-4xl font-black tracking-tighter mb-2 text-text-primary">Human <span className="text-lavender">Assets</span></h2>
           <p className="text-sm font-medium text-text-secondary italic">Global workforce management and performance telemetry.</p>
         </div>
         <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-lavender transition-colors" />
              <input 
                placeholder="Search staff..." 
                className="pl-10 pr-6 py-3 rounded-2xl bg-card border border-foreground/5 text-xs font-bold w-64 focus:outline-none focus:ring-4 focus:ring-lavender/5 transition-all"
              />
            </div>
            <button className="p-3 rounded-2xl bg-card border border-foreground/5 text-text-muted hover:text-text-primary transition-all">
               <Filter className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 rounded-2xl bg-lavender text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-lavender/20 hover:scale-105 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Staff
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
            { label: "Total Workforce", value: "124", sub: "12 New this month", icon: Users, color: "text-lavender", bg: "bg-lavender/10" },
            { label: "Avg Performance", value: "94.2%", sub: "+2.1% vs last quarter", icon: Star, color: "text-sage-dark", bg: "bg-sage/20" },
            { label: "Training Completion", value: "86%", sub: "14 stylists in progress", icon: Award, color: "text-peach", bg: "bg-peach/10" },
         ].map((stat, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-card p-8 rounded-[2.5rem] border border-foreground/5 shadow-sm"
            >
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                  <stat.icon className="w-6 h-6" />
               </div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black tracking-tighter mb-2">{stat.value}</h3>
               <p className="text-[10px] font-bold text-text-secondary opacity-60 uppercase">{stat.sub}</p>
            </motion.div>
         ))}
      </div>

      {/* Staff Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
         {STAFF_MEMBERS.map((member, i) => (
            <motion.div 
               key={member.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.05 }}
               className="bg-card p-8 rounded-[3rem] border border-foreground/5 shadow-sm hover:shadow-2xl hover:shadow-lavender/5 transition-all group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-6">
                  <button className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
                     <MoreHorizontal className="w-5 h-5 text-text-muted" />
                  </button>
               </div>

               <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-lavender to-blush flex items-center justify-center text-white text-2xl font-black shadow-xl border-4 border-card">
                     {member.image}
                  </div>
                  <div>
                     <h3 className="text-xl font-black tracking-tight">{member.name}</h3>
                     <p className="text-xs font-bold text-lavender uppercase tracking-widest">{member.role}</p>
                  </div>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                     <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Branch</span>
                     </div>
                     <span className="text-[10px] font-black">{member.branch}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                     <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-sage-dark" />
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Score</span>
                     </div>
                     <span className="text-[10px] font-black text-sage-dark">{member.score}/100</span>
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Training Progress</span>
                     <span className="text-[9px] font-black text-text-primary uppercase">{member.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${member.progress}%` }}
                        className="h-full bg-lavender" 
                     />
                  </div>
               </div>

               <div className="mt-8 flex gap-3">
                  <button className="flex-1 py-3 rounded-xl bg-foreground text-card text-[10px] font-black uppercase tracking-widest hover:bg-foreground/90 transition-all">
                     View Profile
                  </button>
                  <button className="px-4 py-3 rounded-xl bg-card border border-foreground/5 hover:bg-foreground/5 transition-all">
                     <TrendingUp className="w-4 h-4 text-text-muted" />
                  </button>
               </div>
            </motion.div>
         ))}
      </div>

      {/* Leaderboard Section */}
      <div className="glass p-10 rounded-[3.5rem] border-foreground/5 shadow-2xl">
         <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-lavender/10 flex items-center justify-center">
               <Award className="w-5 h-5 text-lavender" />
            </div>
            <div>
               <h3 className="text-2xl font-black tracking-tight">Top Performers</h3>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1 italic">Neural excellence leaderboard</p>
            </div>
         </div>
         <div className="space-y-4">
            {STAFF_MEMBERS.sort((a, b) => b.score - a.score).slice(0, 3).map((member, i) => (
               <div key={member.id} className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-card border border-foreground/5 group hover:border-lavender/30 transition-all">
                  <div className="text-xl font-black text-text-muted w-8">0{i+1}</div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-peach/20 to-blush/20 flex items-center justify-center font-black text-xs text-text-primary">
                     {member.image}
                  </div>
                  <div className="flex-1">
                     <h4 className="font-black text-base">{member.name}</h4>
                     <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">{member.specialty} • {member.experience}</p>
                  </div>
                  <div className="flex items-center gap-8">
                     <div className="text-right">
                        <p className="text-[9px] font-black text-text-muted uppercase">Efficiency</p>
                        <p className="text-sm font-black text-sage-dark">{member.score}%</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-sage-dark" />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
