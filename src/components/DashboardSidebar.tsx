"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Calendar, Settings, LogOut,
  Sparkles, Camera, Bot, BarChart3, ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Management",
    items: [
      { icon: LayoutDashboard, label: "Command Center",   path: "/dashboard" },
      { icon: Camera,          label: "Beauty Passport",  path: "/dashboard/beauty-passport" },
      { icon: Bot,             label: "Stylist CoPilot",  path: "/dashboard/stylist-copilot" },
      { icon: BarChart3,       label: "Neural Analytics", path: "/dashboard/neural-analytics" },
    ],
  },
  {
    label: "Operations",
    items: [
      { icon: Users,    label: "Human Assets",   path: "/dashboard/human-assets" },
      { icon: Calendar, label: "Neural Schedule", path: "/dashboard/neural-schedule" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: Settings, label: "Core Settings", path: "/dashboard/core-settings" },
    ],
  },
];

export default function DashboardSidebar() {
  const { signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside
      aria-label="Main navigation"
      className="hidden xl:flex flex-col w-[280px] shrink-0 h-screen bg-[#F2EBE5] border-r border-black/[0.05] z-50 overflow-y-auto custom-scrollbar"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-7 pt-8 pb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lavender to-blush flex items-center justify-center shadow-lg shadow-lavender/20 shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-[17px] tracking-tight text-text-primary leading-none">NeuroStrom</span>
          <p className="text-[9px] font-semibold text-text-muted uppercase tracking-[0.18em] mt-0.5">Enterprise OS · v4.0</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-black/[0.06] mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-6 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="section-label px-3 mb-2">{section.label}</p>
            <ul className="space-y-0.5" role="list">
              {section.items.map((item) => {
                const active = pathname === item.path ||
                  (item.path !== "/dashboard" && pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <motion.button
                      onClick={() => router.push(item.path)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                        active
                          ? "nav-pill-active text-text-primary"
                          : "text-text-secondary hover:bg-black/[0.04] hover:text-text-primary"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          active ? "text-lavender" : "text-text-muted group-hover:text-text-secondary"
                        )}
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && (
                        <motion.div
                          layoutId="activeDot"
                          className="w-1.5 h-1.5 rounded-full bg-lavender"
                        />
                      )}
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6 mt-auto space-y-0.5">
        <div className="mx-1 h-px bg-black/[0.06] mb-3" />
        <p className="section-label px-3 mb-2">Utility</p>
        <button
          onClick={async () => { await signOut(); router.push("/auth/login"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-50/60 hover:text-red-500 transition-all duration-200"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
