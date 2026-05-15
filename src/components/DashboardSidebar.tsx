"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Sparkles,
  Camera,
  Bot,
  Cctv,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardSidebar() {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Command Center", path: "/dashboard" },
    { icon: Camera, label: "Beauty Passport", path: "/dashboard/beauty-passport" },
    { icon: Bot, label: "Stylist CoPilot", path: "/dashboard/stylist-copilot" },
    { icon: BarChart3, label: "Neural Analytics", path: "/dashboard/neural-analytics" },
    { icon: Cctv, label: "NeuroWatch AI", path: "/dashboard/neurowatch-ai" },
    { icon: Smartphone, label: "Mobile Experience", path: "/dashboard/mobile-experience" },
  ];

  const resourceItems = [
    { icon: Users, label: "Human Assets", path: "/dashboard/human-assets" },
    { icon: Calendar, label: "Neural Schedule", path: "/dashboard/neural-schedule" },
    { icon: Settings, label: "Core Settings", path: "/dashboard/core-settings" },
  ];

  return (
    <aside className="w-80 bg-sidebar border-r border-foreground/5 flex flex-col p-8 hidden xl:flex z-50">
      <div className="flex items-center gap-4 mb-16 px-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center shadow-2xl shadow-lavender/30">
          <Sparkles className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="font-black text-2xl tracking-tighter text-text-primary">NeuroStrom</h1>
          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] italic">Enterprise OS v4.0</p>
        </div>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 px-4">Management</p>
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => router.push(item.path!)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all",
              pathname === item.path 
                ? "bg-card shadow-xl shadow-foreground/5 text-lavender border border-foreground/5" 
                : "text-text-secondary hover:bg-card/50 hover:text-text-primary"
            )}
          >
            <item.icon className={cn("w-5 h-5", pathname === item.path ? "text-lavender" : "text-text-secondary/60")} />
            {item.label}
          </button>
        ))}

        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-12 mb-6 px-4">Resources</p>
        {resourceItems.map((item, i) => (
          <button
            key={i}
            onClick={() => router.push(item.path)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all",
              pathname === item.path 
                ? "bg-card shadow-xl shadow-foreground/5 text-lavender border border-foreground/5" 
                : "text-text-secondary hover:bg-card/50 hover:text-text-primary"
            )}
          >
            <item.icon className={cn("w-5 h-5", pathname === item.path ? "text-lavender" : "text-text-secondary/60")} />
            {item.label}
          </button>
        ))}

        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-12 mb-6 px-4">Utility</p>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50/50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </nav>
    </aside>
  );
}

// Fixed missing BarChart3 import in the file
import { BarChart3 } from "lucide-react";
