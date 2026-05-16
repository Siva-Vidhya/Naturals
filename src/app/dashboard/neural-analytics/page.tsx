"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Star, ArrowUpRight, Filter, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Modal, { FieldLabel, FieldInput, FieldSelect, PrimaryButton, SecondaryButton } from "@/components/Modal";
import { exportCSV, exportExcel, exportPDF } from "@/lib/export-utils";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

const ALL_KPI = [
  { label: "Total Revenue",  value: "$148,920", delta: "+18.4%", icon: TrendingUp },
  { label: "Unique Clients", value: "3,241",    delta: "+9.1%",  icon: Users },
  { label: "Avg Rating",     value: "4.92",     delta: "+0.08",  icon: Star },
  { label: "AI Utilisation", value: "76.4%",    delta: "+12.2%", icon: BarChart3 },
];

const ALL_BRANCHES = [
  { name: "Soho Flagship",   revenue: 48920, target: 50000, sessions: 214, rating: 4.94 },
  { name: "Brooklyn Hub",    revenue: 37410, target: 40000, sessions: 178, rating: 4.89 },
  { name: "Midtown Studio",  revenue: 31800, target: 35000, sessions: 151, rating: 4.91 },
  { name: "Uptown Boutique", revenue: 22490, target: 28000, sessions: 119, rating: 4.87 },
];

const ALL_WEEKLY = [62, 78, 55, 90, 84, 96, 88];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function NeuralAnalyticsPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    branch: "all",
    service: "all",
    stylist: "all",
    segment: "all",
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const filterCount = Object.values(activeFilters).filter((v) => v && v !== "all").length;

  // Filter branches based on active filters
  const branches = activeFilters.branch === "all"
    ? ALL_BRANCHES
    : ALL_BRANCHES.filter((b) => b.name.toLowerCase().includes(activeFilters.branch.toLowerCase()));

  // Dynamic KPIs based on filters
  const kpi = ALL_KPI.map(k => {
    if (activeFilters.branch === "all") return k;
    const branchData = ALL_BRANCHES.find(b => b.name.toLowerCase().includes(activeFilters.branch.toLowerCase()));
    if (!branchData) return k;
    
    // Simulate branch-specific KPI
    if (k.label === "Total Revenue") return { ...k, value: `$${branchData.revenue.toLocaleString()}`, delta: `${Math.round((branchData.revenue / branchData.target) * 100)}% of target` };
    if (k.label === "Unique Clients") return { ...k, value: Math.round(branchData.sessions * 1.5).toString(), delta: "+4.2%" };
    if (k.label === "Avg Rating") return { ...k, value: branchData.rating.toString(), delta: "stable" };
    return k;
  });

  // Dynamic chart data based on branch
  const [weekly, setWeekly] = useState(ALL_WEEKLY);

  useEffect(() => {
    if (activeFilters.branch === "all") {
      setWeekly(ALL_WEEKLY);
    } else {
      setWeekly(ALL_WEEKLY.map(v => Math.round(v * (0.4 + Math.random() * 0.4))));
    }
  }, [activeFilters.branch]);

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveFilters({ ...filters });
    setShowFilter(false);
    toast.success(`Filters applied${filterCount > 0 ? ` (${filterCount} active)` : ""}`);
  };

  const clearFilters = () => {
    const cleared = { dateFrom: "", dateTo: "", branch: "all", service: "all", stylist: "all", segment: "all" };
    setFilters(cleared);
    setActiveFilters(cleared);
    toast.info("All filters cleared");
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const headers = ["Branch", "Revenue", "Target", "Sessions", "Rating", "Achievement %"];
    const rows = branches.map((b) => [
      b.name,
      `$${b.revenue.toLocaleString()}`,
      `$${b.target.toLocaleString()}`,
      b.sessions.toString(),
      b.rating.toString(),
      `${Math.round((b.revenue / b.target) * 100)}%`,
    ]);

    if (format === "csv") {
      exportCSV(headers, rows, "neurostrom-analytics");
      toast.success("CSV exported successfully!");
    } else if (format === "excel") {
      exportExcel(headers, rows, "neurostrom-analytics");
      toast.success("Excel file exported!");
    } else {
      exportPDF("NeuroStrom Neural Analytics Report", [
        { heading: "KPI Summary", content: kpi.map((k) => `<p><strong>${k.label}:</strong> ${k.value} (${k.delta})</p>`).join("") },
        { heading: "Branch Performance", content: `<table style="width:100%;border-collapse:collapse;font-size:12px;"><tr style="background:#f5f0fa;"><th style="padding:8px;text-align:left;">Branch</th><th>Revenue</th><th>Target</th><th>Sessions</th><th>Rating</th></tr>${branches.map((b) => `<tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">${b.name}</td><td>$${b.revenue.toLocaleString()}</td><td>$${b.target.toLocaleString()}</td><td>${b.sessions}</td><td>★ ${b.rating}</td></tr>`).join("")}</table>` },
        { heading: "Weekly Sessions", content: `<p>${DAYS.map((d, i) => `${d}: ${Math.round(weekly[i] * 2.3)} sessions`).join(" · ")}</p>` },
      ]);
      toast.success("PDF report opened!");
    }
    setShowExport(false);
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Intelligence</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Neural Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">Performance intelligence across all branches.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilter(true)} className="h-10 px-4 rounded-xl bg-white border border-black/[0.07] text-sm font-semibold text-text-secondary flex items-center gap-2 shadow-sm hover:border-black/[0.12] transition-all">
            <Filter className="w-3.5 h-3.5" /> Filter
            {filterCount > 0 && <span className="w-5 h-5 rounded-full bg-lavender text-white text-[10px] font-bold flex items-center justify-center">{filterCount}</span>}
          </button>
          <button onClick={() => setShowExport(true)} className="h-10 px-4 rounded-xl bg-text-primary text-white text-sm font-semibold shadow-md shadow-black/10 hover:bg-text-primary/90 transition-all flex items-center gap-2">
            Export <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((k) => (
          <motion.div key={k.label} variants={fadeUp} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{k.label}</p>
              <k.icon className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-[28px] font-extrabold tracking-tight text-text-primary">{k.value}</p>
            <span className="text-[11px] font-semibold text-sage-dark bg-sage/20 px-2 py-0.5 rounded-full mt-1.5 inline-block">{k.delta}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Forecast */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-text-primary">Weekly Sessions</h2>
              <p className="text-[12px] text-text-muted mt-0.5">Appointments per day this week</p>
            </div>
            <div className="flex gap-1">
              {["Week","Month","Quarter"].map((t, i) => (
                <button key={t} className={cn("h-7 px-3 rounded-lg text-[11px] font-semibold transition-all", i === 0 ? "bg-lavender/20 text-[#6b4fa0]" : "text-text-muted hover:text-text-secondary hover:bg-black/[0.04]")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {weekly.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <p className="text-[10px] font-semibold text-text-secondary">{Math.round(h * 2.3)}</p>
                <motion.div
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.34,1.56,0.64,1] }}
                  style={{ height: `${h}%`, originY: 1 }}
                  className={cn("w-full rounded-t-xl", i === 6 ? "bg-lavender" : "bg-lavender/25 hover:bg-lavender/50 transition-colors cursor-pointer")}
                />
                <span className="text-[10px] text-text-muted font-medium">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-6 lg:col-span-4 flex flex-col">
          <h2 className="text-base font-bold text-text-primary mb-1">AI Forecast</h2>
          <p className="text-[12px] text-text-muted mb-5">Next 30-day projection</p>
          <div className="space-y-4 flex-1">
            {[
              { label: "Projected Revenue", value: "$52,400", trend: "+11%" },
              { label: "Expected Clients",  value: "1,180",   trend: "+8%"  },
              { label: "Peak Day",          value: "Saturday", trend: null  },
              { label: "AI Confidence",     value: "94.2%",   trend: "High" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-black/[0.04] last:border-0">
                <p className="text-[12px] text-text-secondary font-medium">{item.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold text-text-primary">{item.value}</p>
                  {item.trend && <span className="text-[10px] font-semibold text-sage-dark bg-sage/20 px-1.5 py-0.5 rounded-md">{item.trend}</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Branch comparison */}
      <motion.div variants={fadeUp} className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-text-primary">Branch Comparison</h2>
            <p className="text-[12px] text-text-muted mt-0.5">Revenue vs target across locations</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {branches.map((b, i) => {
            const pct = Math.round((b.revenue / b.target) * 100);
            return (
              <div key={i} className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
                <p className="text-[13px] font-semibold text-text-primary mb-0.5">{b.name}</p>
                <p className="text-[11px] text-text-muted mb-3">{b.sessions} sessions · ★ {b.rating}</p>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[12px] font-bold text-text-primary">${b.revenue.toLocaleString()}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", pct >= 90 ? "badge-success" : "badge-warning")}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                    className={cn("h-full rounded-full", pct >= 90 ? "bg-sage-dark" : "bg-peach")}
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1">Target: ${b.target.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══════ FILTER MODAL ═══════ */}
      <Modal open={showFilter} onClose={() => setShowFilter(false)} title="Filter Analytics" subtitle="Refine data across all charts and KPIs">
        <form onSubmit={applyFilters} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Date From</FieldLabel>
              <FieldInput type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
            </div>
            <div>
              <FieldLabel>Date To</FieldLabel>
              <FieldInput type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
            </div>
          </div>
          <div>
            <FieldLabel>Branch</FieldLabel>
            <FieldSelect value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })}>
              <option value="all">All Branches</option>
              <option value="Soho">Soho Flagship</option>
              <option value="Brooklyn">Brooklyn Hub</option>
              <option value="Midtown">Midtown Studio</option>
              <option value="Uptown">Uptown Boutique</option>
            </FieldSelect>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Service Type</FieldLabel>
              <FieldSelect value={filters.service} onChange={(e) => setFilters({ ...filters, service: e.target.value })}>
                <option value="all">All Services</option>
                <option value="cut">Cuts &amp; Styling</option>
                <option value="color">Colour Services</option>
                <option value="treatment">Treatments</option>
                <option value="scalp">Scalp Care</option>
              </FieldSelect>
            </div>
            <div>
              <FieldLabel>Stylist</FieldLabel>
              <FieldSelect value={filters.stylist} onChange={(e) => setFilters({ ...filters, stylist: e.target.value })}>
                <option value="all">All Stylists</option>
                <option value="maya">Maya Chen</option>
                <option value="james">James Okafor</option>
                <option value="leila">Leila Moss</option>
                <option value="ryan">Ryan Park</option>
                <option value="sofia">Sofia Reyes</option>
              </FieldSelect>
            </div>
          </div>
          <div>
            <FieldLabel>Customer Segment</FieldLabel>
            <FieldSelect value={filters.segment} onChange={(e) => setFilters({ ...filters, segment: e.target.value })}>
              <option value="all">All Segments</option>
              <option value="vip">VIP Clients</option>
              <option value="regular">Regular</option>
              <option value="new">New Clients</option>
              <option value="lapsed">Lapsed (60+ days)</option>
            </FieldSelect>
          </div>
          <div className="flex gap-3 pt-2">
            <PrimaryButton type="submit" className="flex-1">Apply Filters</PrimaryButton>
            <SecondaryButton type="button" onClick={clearFilters}>Clear All</SecondaryButton>
          </div>
        </form>
      </Modal>

      {/* ═══════ EXPORT MODAL ═══════ */}
      <Modal open={showExport} onClose={() => setShowExport(false)} title="Export Analytics" subtitle="Download filtered data in your preferred format" size="sm">
        <div className="space-y-3">
          {[
            { format: "csv" as const, label: "CSV", desc: "Comma-separated values for spreadsheets", icon: Download },
            { format: "excel" as const, label: "Excel", desc: "Microsoft Excel compatible format", icon: FileText },
            { format: "pdf" as const, label: "PDF Report", desc: "Formatted report with charts summary", icon: FileText },
          ].map((opt) => (
            <button
              key={opt.format}
              onClick={() => handleExport(opt.format)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-black/[0.05] hover:border-lavender/30 hover:bg-lavender/[0.03] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-lavender/15 flex items-center justify-center shrink-0 group-hover:bg-lavender/25 transition-colors">
                <opt.icon className="w-4 h-4 text-[#6b4fa0]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-text-primary">{opt.label}</p>
                <p className="text-[11px] text-text-muted">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </motion.div>
  );
}
