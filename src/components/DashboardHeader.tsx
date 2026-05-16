"use client";

import { Bell, Building2, ChevronDown, Command, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
export default function DashboardHeader() {
  const { user } = useAuth();
  const initial = (user?.user_metadata?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <header className="h-[68px] px-8 flex items-center justify-between border-b border-black/[0.05] bg-[#F8F3EE]/80 backdrop-blur-2xl z-40 shrink-0">
      {/* Left: breadcrumb + search */}
      <div className="flex items-center gap-6 flex-1">
        {/* Branch chip */}
        <button className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-black/[0.06] shadow-sm hover:border-lavender/40 transition-all group">
          <Building2 className="w-3.5 h-3.5 text-lavender" />
          <span className="text-[12px] font-semibold text-text-primary">Soho Flagship</span>
          <ChevronDown className="w-3 h-3 text-text-muted group-hover:text-text-secondary transition-colors" />
        </button>

        {/* Search */}
        <div className="relative group max-w-sm w-full hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within:text-lavender transition-colors" />
          <input
            type="search"
            placeholder="Search clients, stylists…"
            aria-label="Global search"
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-black/[0.04] border border-transparent text-[13px] font-medium text-text-primary placeholder:text-text-muted focus:bg-white focus:border-lavender/30 focus:ring-4 focus:ring-lavender/10 outline-none transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/[0.04] text-[10px] font-mono text-text-muted">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Right: status + notifications + profile */}
      <div className="flex items-center gap-3">
        {/* System status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-700">Systems Nominal</span>
        </div>

        {/* Bell */}
        <button
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center hover:border-lavender/40 transition-all shadow-sm"
        >
          <Bell className="w-4 h-4 text-text-secondary" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blush rounded-full border border-white" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-black/[0.06]">
          <div className="hidden sm:block text-right">
            <p className="text-[13px] font-semibold text-text-primary leading-none">{displayName}</p>
            <p className="text-[10px] font-medium text-text-muted mt-0.5">Chief Operations</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender to-blush flex items-center justify-center text-white font-bold text-sm shadow-md shadow-lavender/20">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
