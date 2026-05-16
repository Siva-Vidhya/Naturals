"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Award, TrendingUp, Search, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Modal, { FieldLabel, FieldInput, FieldSelect, PrimaryButton, SecondaryButton } from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import AddStaffModal from "@/components/modals/add-staff-modal";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

interface StaffMember {
  name: string;
  role: string;
  branch: string;
  status: string;
  sessions: number;
  rating: number;
  score: number;
}

const INITIAL_STAFF: StaffMember[] = [
  { name: "Maya Chen",     role: "Senior Stylist",  branch: "Soho",     status: "Active",  sessions: 12, rating: 4.97, score: 98 },
  { name: "James Okafor",  role: "AI Specialist",   branch: "Brooklyn", status: "Active",  sessions: 9,  rating: 4.94, score: 95 },
  { name: "Leila Moss",    role: "Color Expert",    branch: "Midtown",  status: "Active",  sessions: 11, rating: 4.90, score: 91 },
  { name: "Ryan Park",     role: "Junior Stylist",  branch: "Soho",     status: "Training",sessions: 5,  rating: 4.82, score: 78 },
  { name: "Sofia Reyes",   role: "Senior Colorist", branch: "Uptown",   status: "Active",  sessions: 8,  rating: 4.88, score: 88 },
  { name: "Amir Hassan",   role: "Scalp Specialist",branch: "Brooklyn", status: "On Leave",sessions: 0,  rating: 4.91, score: 0  },
];

const statusClass: Record<string, string> = {
  "Active":   "badge-success",
  "Training": "badge-warning",
  "On Leave": "bg-black/[0.04] text-text-muted border border-black/[0.06]",
};

export default function HumanAssetsPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleAddSuccess = (newStaff: any) => {
    setStaff(prev => [
      {
        name: newStaff.full_name || "New Member",
        role: newStaff.role || "Stylist",
        branch: newStaff.branch || "Soho",
        status: newStaff.status || "Active",
        sessions: 0,
        rating: 0,
        score: 0
      },
      ...prev
    ]);
  };

  const filteredStaff = searchQuery
    ? staff.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase()))
    : staff;



  const activeCount = staff.filter((s) => s.status === "Active").length;
  const avgScore = staff.length > 0 ? (staff.reduce((a, s) => a + s.score, 0) / staff.length).toFixed(1) : "0";

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Operations</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Human Assets</h1>
          <p className="text-sm text-text-secondary mt-1">Staff directory, performance, and training tracker.</p>
        </div>
        <button onClick={() => setShowAddStaff(true)} className="h-10 px-4 rounded-xl bg-text-primary text-white text-sm font-semibold shadow-md shadow-black/10 hover:bg-text-primary/90 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </motion.div>

      {/* KPI row */}
      <motion.div variants={stagger} className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Staff",    value: staff.length.toString(), icon: Users },
          { label: "Active Today",   value: activeCount.toString(),  icon: TrendingUp },
          { label: "Avg Performance",value: `${avgScore}%`,          icon: Award },
        ].map((k) => (
          <motion.div key={k.label} variants={fadeUp} className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-lavender/15 flex items-center justify-center shrink-0">
              <k.icon className="w-4.5 h-4.5 text-[#6b4fa0]" />
            </div>
            <div>
              <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">{k.label}</p>
              <p className="text-2xl font-extrabold text-text-primary tracking-tight">{k.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Directory table */}
      <motion.div variants={fadeUp} className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05]">
          <h2 className="text-base font-bold text-text-primary">Staff Directory</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              placeholder="Search staff…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-xl bg-black/[0.04] border border-transparent text-[13px] focus:bg-white focus:border-lavender/30 outline-none transition-all font-medium"
            />
          </div>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {filteredStaff.map((s, i) => (
            <motion.div key={`${s.name}-${i}`} variants={fadeUp}
              className="flex items-center gap-4 px-6 py-4 hover:bg-black/[0.02] transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender/25 to-blush/25 flex items-center justify-center text-text-primary font-bold text-sm shrink-0">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-text-primary">{s.name}</p>
                <p className="text-[11px] text-text-muted">{s.role} · {s.branch}</p>
              </div>
              <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full hidden sm:inline", statusClass[s.status] || statusClass["Active"])}>
                {s.status}
              </span>
              <div className="text-right hidden md:block">
                <p className="text-[12px] font-bold text-text-primary">{s.sessions} sessions</p>
                <p className="text-[11px] text-text-muted">★ {s.rating || "—"}</p>
              </div>
              <div className="w-20 hidden lg:block">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-text-muted font-medium">Score</p>
                  <p className="text-[11px] font-bold text-text-primary">{s.score}%</p>
                </div>
                <div className="h-1 bg-black/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                    className="h-full bg-lavender rounded-full"
                  />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Training progress */}
      <motion.div variants={fadeUp} className="card p-6">
        <h2 className="text-base font-bold text-text-primary mb-1">Training Progress</h2>
        <p className="text-[12px] text-text-muted mb-5">Current certification tracks</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { course: "AI-Assisted Colour",  progress: 72, enrolled: 8 },
            { course: "Scalp Diagnostics",   progress: 45, enrolled: 5 },
            { course: "Neural Consultation", progress: 90, enrolled: 11 },
          ].map((c, i) => (
            <div key={i} className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.04]">
              <p className="text-[13px] font-semibold text-text-primary mb-0.5">{c.course}</p>
              <p className="text-[11px] text-text-muted mb-3">{c.enrolled} enrolled</p>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-medium text-text-secondary">Progress</p>
                <p className="text-[12px] font-bold text-text-primary">{c.progress}%</p>
              </div>
              <div className="h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${c.progress}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-lavender to-blush rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <AddStaffModal 
        open={showAddStaff} 
        onClose={() => setShowAddStaff(false)} 
        onSuccess={handleAddSuccess} 
      />
    </motion.div>
  );
}
