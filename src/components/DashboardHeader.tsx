"use client";

import { 
  Building2, 
  ChevronRight, 
  Command, 
  Bell 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="h-24 px-10 flex items-center justify-between border-b border-foreground/5 bg-cream/40 backdrop-blur-2xl z-40">
      <div className="flex items-center gap-8 flex-1">
        {/* Branch Navigator */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-foreground/5 shadow-sm group cursor-pointer hover:border-lavender/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-lavender/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-lavender" />
          </div>
          <div>
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Active Hub</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-text-primary">Soho Flagship, NY</span>
              <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-30 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Global Neural Search */}
        <div className="flex-1 max-w-xl relative group hidden md:block">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
             <Command className="w-4 h-4 text-text-muted group-focus-within:text-lavender transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search clients, stylists, or system logs..." 
            className="w-full h-14 pl-14 pr-6 rounded-[1.25rem] bg-foreground/[0.03] border border-transparent focus:bg-card focus:border-lavender/20 focus:ring-8 focus:ring-lavender/5 transition-all outline-none text-xs font-bold text-text-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-sage/10 border border-sage/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 italic">Neural Engine: Nominal</span>
        </div>
        
        <button className="p-3 rounded-2xl bg-card border border-foreground/5 relative group hover:scale-105 transition-all">
          <Bell className="w-5 h-5 text-text-secondary group-hover:text-lavender transition-colors" />
          <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-blush rounded-full border-2 border-card shadow-sm" />
        </button>

        <div className="flex items-center gap-4 pl-4 border-l border-foreground/5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black tracking-tight text-text-primary">{user?.user_metadata?.full_name || "Alexandra V."}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Chief Operations Officer</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lavender to-blush flex items-center justify-center text-white font-black text-sm shadow-xl shadow-lavender/10 border-2 border-card">
            {user?.user_metadata?.full_name?.charAt(0) || "AV"}
          </div>
        </div>
      </div>
    </header>
  );
}
