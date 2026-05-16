"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, Heart, Zap, ChevronRight, FileText, Download, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Modal, { FieldLabel, FieldInput, FieldTextarea, PrimaryButton, SecondaryButton } from "@/components/Modal";
import { exportCSV, exportPDF } from "@/lib/export-utils";
import { supabase } from "@/lib/supabase";
import ManualEntryModal from "@/components/modals/manual-entry-modal";

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25,0.46,0.45,0.94] as [number,number,number,number] } } };

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
  const [showReport, setShowReport] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [reportRange, setReportRange] = useState("today");
  const [reportLoading, setReportLoading] = useState(false);
  const [allocationLoading, setAllocationLoading] = useState(false);
  const [allocationStep, setAllocationStep] = useState(0);
  const [allocationLog, setAllocationLog] = useState<string[]>([]);
  const [insightText, setInsightText] = useState("12% spike in Scalp Detox demand at Soho Hub detected. Recommend reallocating 2 junior stylists from Brooklyn for the evening shift.");
  
  const DYNAMIC_INSIGHTS = [
    "12% spike in Scalp Detox demand at Soho Hub detected. Recommend reallocating 2 junior stylists.",
    "Saturday is at 94% capacity. Suggesting overflow schedule for Senior Stylists.",
    "Low color conversion in Brooklyn. AI recommends promotion for 'Neural Color Scan'.",
    "Energy efficiency at Midtown Hub is sub-optimal. Neural Link suggests HVAC adjustment.",
    "Customer wait time at Uptown is increasing. AI suggests immediate break redistribution."
  ];

  const [lastOptimized, setLastOptimized] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Pause cycling if loading OR if we just optimized in the last 60 seconds
      const secondsSinceLastOpt = (Date.now() - lastOptimized) / 1000;
      if (!allocationLoading && secondsSinceLastOpt > 60) {
        setInsightText(prev => {
          const currentIndex = DYNAMIC_INSIGHTS.indexOf(prev);
          const nextIndex = (currentIndex + 1) % DYNAMIC_INSIGHTS.length;
          return DYNAMIC_INSIGHTS[nextIndex];
        });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [allocationLoading, lastOptimized]);

  const [kpiValues, setKpiValues] = useState({
    revenue: "$12,480",
    scans: "482",
    satisfaction: "98.2%",
    active: "24"
  });

  const refreshDashboardData = (newData?: any) => {
    if (newData?.revenue) {
      setKpiValues(prev => ({
        ...prev,
        revenue: `$${(parseFloat(prev.revenue.replace(/[^0-9.]/g, '')) + parseFloat(newData.revenue)).toLocaleString()}`
      }));
    }
    if (newData?.appointments_count) {
      setKpiValues(prev => ({
        ...prev,
        active: (parseInt(prev.active) + parseInt(newData.appointments_count)).toString()
      }));
    }
  };

  /* ── System Report ─────────────────────────────────────────────────── */
  const generateReport = (format: "csv" | "pdf") => {
    setReportLoading(true);
    const rangeLabel = reportRange === "today" ? "Today" : reportRange === "week" ? "This Week" : reportRange === "month" ? "This Month" : "Custom";

    setTimeout(() => {
      if (format === "csv") {
        exportCSV(
          ["Metric", "Value", "Change", "Period"],
          [
            ["Revenue", "$12,480", "+14.2%", rangeLabel],
            ["AI Scans", "482", "+28.4%", rangeLabel],
            ["Client Satisfaction", "98.2%", "+1.2%", rangeLabel],
            ["Active Services", "24", "Live", rangeLabel],
            ["Appointments Completed", "38", "+8", rangeLabel],
            ["Product Sales", "$3,240", "+11.5%", rangeLabel],
            ["Staff Utilization", "91.2%", "+3.1%", rangeLabel],
            ["Walk-ins Converted", "12", "+4", rangeLabel],
          ],
          `neurostrom-report-${reportRange}`
        );
        toast.success("CSV report downloaded successfully!");
      } else {
        exportPDF(`NeuroStrom System Report — ${rangeLabel}`, [
          { heading: "Revenue Summary", content: "<p>Total Revenue: <strong>$12,480</strong> (+14.2% vs previous period)</p><p>Product Sales: <strong>$3,240</strong> (+11.5%)</p><p>Average ticket value: <strong>$328</strong></p>" },
          { heading: "Appointments", content: "<p>Completed: <strong>38</strong> | Scheduled: <strong>24</strong> | No-shows: <strong>2</strong></p><p>Utilization rate: <strong>91.2%</strong></p>" },
          { heading: "Customer Satisfaction", content: "<p>Overall rating: <strong>98.2%</strong> (+1.2%)</p><p>Net Promoter Score: <strong>87</strong></p><p>Repeat visit rate: <strong>74%</strong></p>" },
          { heading: "Staff Productivity", content: "<ul><li>Maya Chen — 12 services, 98% score</li><li>James Okafor — 9 services, 95% score</li><li>Leila Moss — 11 services, 91% score</li></ul>" },
          { heading: "AI Scan Insights", content: "<p>Total scans: <strong>482</strong> (+28.4%)</p><p>Most common face shape: Oval (38%)</p><p>Top recommended service: Molecular Shine Booster</p>" },
        ]);
        toast.success("PDF report opened for printing!");
      }
      setReportLoading(false);
      setShowReport(false);
    }, 800);
  };

  /* ── Auto-Allocate Resources ───────────────────────────────────────── */
  const handleAutoAllocate = async () => {
    setAllocationLoading(true);
    setAllocationStep(1);
    setAllocationLog(["[CONNECT] Neural Link established.", "[SCAN] Analyzing staff distribution..."]);
    toast.info("Neural Link established. Analyzing staff distribution...");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAllocationStep(2);
    setAllocationLog(prev => [...prev, "[LOAD] Branch demand maps synchronized.", "[CALC] Processing real-time queue..."]);
    toast.info("Processing branch demand and real-time appointment queue...");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAllocationStep(3);
    setAllocationLog(prev => [...prev, "[OPTIMIZE] Generating rebalancing path.", "[VERIFY] Revenue shift impact: +$1.2k"]);
    toast.info("Finalizing optimization path...");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Record the allocation event
      await supabase.from("resource_allocations").insert({
        type: "STAFF_REDISTRIBUTION",
        insight: insightText,
        impact: "Estimated +$1.2k revenue shift",
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Could not save allocation to Supabase:", e);
    }

    // Update UI to show "optimized" state
    setInsightText("Optimization complete. Staff resources rebalanced across all hubs. Efficiency +18.4%.");
    setLastOptimized(Date.now());
    
    setKpiValues(prev => ({
      ...prev,
      active: "28", // Simulated increase
      revenue: `$${(parseFloat(prev.revenue.replace(/[^0-9.]/g, '')) + 620).toLocaleString()}`
    }));

    toast.success("Branch resources rebalanced successfully!");
    setAllocationLoading(false);
    setAllocationStep(0);
  };

  /* ── Manual Entry ──────────────────────────────────────────────────── */
  // Moved to separate component ManualEntryModal

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
          <button onClick={() => setShowReport(true)} className="h-10 px-4 rounded-xl bg-white border border-black/[0.07] text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-black/[0.12] transition-all shadow-sm">
            System Report
          </button>
          <button onClick={() => setShowManualEntry(true)} className="h-10 px-4 rounded-xl bg-text-primary text-white text-sm font-semibold hover:bg-text-primary/90 transition-all shadow-md shadow-black/10">
            + Manual Entry
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Daily Revenue",       value: kpiValues.revenue, delta: "+14.2%", positive: true,  icon: TrendingUp, accent: "bg-sage/20 text-sage-dark border-sage/20" },
          { label: "AI Scans Today",      value: kpiValues.scans,     delta: "+28.4%", positive: true,  icon: Sparkles,   accent: "bg-lavender/20 text-[#6b4fa0] border-lavender/20" },
          { label: "Client Satisfaction", value: kpiValues.satisfaction,   delta: "+1.2%",  positive: true,  icon: Heart,      accent: "bg-blush/20 text-[#a0416b] border-blush/20" },
          { label: "Active Services",     value: kpiValues.active,      delta: "Live",   positive: true,  icon: Zap,        accent: "bg-peach/20 text-[#9a5c2e] border-peach/20" },
        ].map((kpi) => (
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
        <motion.div variants={fadeUp} className="lg:col-span-4 rounded-[28px] p-6 bg-[#0F0D0B] text-white relative overflow-hidden flex flex-col justify-between border border-white/[0.05] shadow-2xl">
          <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-lavender/30 via-transparent to-blush/20 pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-lavender/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 relative">
                  <Zap className="w-5 h-5 text-lavender" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-lavender/20 rounded-2xl"
                  />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold tracking-tight">Neural Insight</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                    <p className="text-[10px] text-lavender font-bold uppercase tracking-widest opacity-80">Live Monitoring</p>
                  </div>
                </div>
              </div>
              <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-tighter opacity-60">
                NS-Core v4.2
              </div>
            </div>
            
            <div className="min-h-[100px] flex flex-col justify-center">
              {allocationLoading ? (
                <div className="space-y-1.5 py-2">
                  {allocationLog.slice(-3).map((log, i) => (
                    <motion.p 
                      key={log + i} 
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] font-mono text-lavender/60 truncate"
                    >
                      {log}
                    </motion.p>
                  ))}
                </div>
              ) : (
                <motion.p 
                  key={insightText}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[14px] text-white/90 leading-relaxed font-medium italic"
                >
                  &quot;{insightText}&quot;
                </motion.p>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4 relative z-10">
            {allocationLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-lavender/70 uppercase tracking-wider">
                  <span>Neural Processing</span>
                  <span>{allocationStep * 33}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${allocationStep * 33}%` }}
                    className="h-full bg-gradient-to-r from-lavender via-blush to-lavender rounded-full"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={handleAutoAllocate}
              disabled={allocationLoading}
              className="w-full py-4 rounded-2xl bg-lavender text-white text-[13px] font-black hover:bg-lavender/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-lavender/30 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {allocationLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
              {allocationLoading ? "Processing Optimization..." : "Auto-Allocate Resources"}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Appointments */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-text-primary">Active Appointments</h2>
              <p className="text-[12px] text-text-muted mt-0.5">Today&apos;s real-time queue</p>
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

      {/* ═══════ SYSTEM REPORT MODAL ═══════ */}
      <Modal open={showReport} onClose={() => setShowReport(false)} title="System Report" subtitle="Generate a performance summary for any period">
        <form onSubmit={(e) => { e.preventDefault(); generateReport("pdf"); }} className="space-y-5">
          <div>
            <FieldLabel>Report Period</FieldLabel>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "today", label: "Today" },
                { id: "week", label: "This Week" },
                { id: "month", label: "This Month" },
                { id: "custom", label: "Custom" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReportRange(r.id)}
                  className={cn(
                    "h-10 rounded-xl text-[12px] font-semibold transition-all border",
                    reportRange === r.id
                      ? "bg-lavender/15 border-lavender/30 text-[#6b4fa0]"
                      : "bg-black/[0.03] border-transparent text-text-muted hover:text-text-secondary"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Sections Included</FieldLabel>
            <div className="space-y-2">
              {["Revenue Summary", "Appointments", "Customer Satisfaction", "Staff Productivity", "AI Scan Insights"].map((s) => (
                <div key={s} className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                  <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                  <span className="text-[13px] font-medium text-text-primary">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <PrimaryButton type="submit" loading={reportLoading} className="flex-1">
              <FileText className="w-4 h-4" /> Generate PDF
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => generateReport("csv")} className="flex-1 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download CSV
            </SecondaryButton>
          </div>
        </form>
      </Modal>

      <ManualEntryModal 
        open={showManualEntry} 
        onClose={() => setShowManualEntry(false)} 
        onSuccess={refreshDashboardData} 
      />
    </motion.div>
  );
}
