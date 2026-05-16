"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Modal, { FieldLabel, FieldInput, FieldSelect, FieldTextarea, PrimaryButton, SecondaryButton } from "@/components/Modal";
import { supabase } from "@/lib/supabase";
import NewBookingModal from "@/components/modals/new-booking-modal";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

const HOURS = ["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm"];
const DAYS = ["Mon 12","Tue 13","Wed 14","Thu 15","Fri 16","Sat 17","Sun 18"];

interface Appointment {
  name: string;
  service: string;
  duration: number;
  color: string;
}

const AI_SUGGESTIONS = [
  { text: "Move Elena V. 15 min earlier to reduce gap between appointments", type: "Optimise" },
  { text: "Dominic R. has 2 no-shows — send automated reminder at 1pm",      type: "Alert" },
  { text: "Saturday is at 94% capacity — open overflow bookings",             type: "Capacity" },
];

const COLORS = [
  "bg-lavender/30 border-lavender/50 text-[#5a3d8a]",
  "bg-blush/30 border-blush/50 text-[#8a3d5a]",
  "bg-sage/30 border-sage/50 text-[#3d6a5a]",
  "bg-peach/30 border-peach/50 text-[#8a5c3d]",
];

export default function NeuralSchedulePage() {
  const today = 2; // index of today (Wed 14)

  const [appointments, setAppointments] = useState<Record<string, Appointment[]>>({
    "10am": [{ name: "Seraphina J.", service: "Molecular Infusion",  duration: 2, color: COLORS[0] }],
    "12pm": [{ name: "Elena V.",     service: "Neural Color Scan",   duration: 1, color: COLORS[1] }],
    "2pm":  [{ name: "Dominic R.",   service: "Scalp Detox",          duration: 1, color: COLORS[2] }],
    "3pm":  [{ name: "Marcus W.",    service: "Keratin Treatment",    duration: 2, color: COLORS[3] }],
  });

  const [showNewBooking, setShowNewBooking] = useState(false);

  const handleBookingSuccess = (newBooking: any) => {
    // Update local state for immediate feedback
    const timeSlot = newBooking.booking_time || "10am";
    const newAppt: Appointment = {
      name: newBooking.customer_name || "New Client",
      service: newBooking.service || "Treatment",
      duration: parseInt(newBooking.duration_hours || "1"),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    setAppointments(prev => ({
      ...prev,
      [timeSlot]: [...(prev[timeSlot] || []), newAppt]
    }));
    toast.success("Schedule updated!");
  };



  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Operations</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Neural Schedule</h1>
          <p className="text-sm text-text-secondary mt-1">AI-optimised appointment calendar.</p>
        </div>
        <button onClick={() => setShowNewBooking(true)} className="h-10 px-4 rounded-xl bg-text-primary text-white text-sm font-semibold shadow-md hover:bg-text-primary/90 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </motion.div>

      {/* Calendar controls */}
      <motion.div variants={fadeUp} className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center hover:bg-black/[0.08] transition-all">
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </button>
          <h2 className="text-base font-bold text-text-primary">May 12 – 18, 2026</h2>
          <button className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center hover:bg-black/[0.08] transition-all">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <div className="flex gap-1">
          {["Day","Week","Month"].map((v, i) => (
            <button key={v} className={cn("h-8 px-3 rounded-lg text-[12px] font-semibold transition-all", i === 1 ? "bg-lavender/20 text-[#6b4fa0]" : "text-text-muted hover:text-text-secondary hover:bg-black/[0.04]")}>
              {v}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Week grid */}
      <motion.div variants={fadeUp} className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-black/[0.05]" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
          <div className="py-3 px-2" />
          {DAYS.map((d, i) => (
            <div key={d} className={cn("py-3 text-center border-l border-black/[0.04]", i === today && "bg-lavender/8")}>
              <p className={cn("text-[11px] font-semibold", i === today ? "text-[#6b4fa0]" : "text-text-muted")}>{d.split(" ")[0]}</p>
              <p className={cn("text-base font-bold mt-0.5", i === today ? "text-[#6b4fa0]" : "text-text-primary")}>{d.split(" ")[1]}</p>
            </div>
          ))}
        </div>
        {/* Time rows */}
        <div className="overflow-y-auto max-h-80">
          {HOURS.map((h) => (
            <div key={h} className="grid border-b border-black/[0.03] last:border-0" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
              <div className="py-3 px-2 text-right">
                <span className="text-[10px] font-medium text-text-muted">{h}</span>
              </div>
              {DAYS.map((_, di) => {
                const appt = di === today ? appointments[h] : undefined;
                return (
                  <div key={di} className={cn("py-1.5 px-1.5 border-l border-black/[0.04] min-h-[48px]", di === today && "bg-lavender/[0.03]")}>
                    {appt?.map((a, ai) => (
                      <div key={ai} className={cn("rounded-lg px-2 py-1.5 border text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity", a.color)}>
                        <p className="font-bold truncate">{a.name}</p>
                        <p className="opacity-70 truncate">{a.service}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI suggestions */}
      <motion.div variants={fadeUp} className="card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-lavender/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#6b4fa0]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">AI Scheduling Suggestions</h2>
            <p className="text-[11px] text-text-muted">3 optimisations available</p>
          </div>
        </div>
        <div className="space-y-2">
          {AI_SUGGESTIONS.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/[0.02] border border-black/[0.04] hover:bg-lavender/[0.04] hover:border-lavender/20 transition-all cursor-pointer group">
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5",
                s.type === "Optimise" ? "badge-info" : s.type === "Alert" ? "badge-warning" : "badge-success")}>
                {s.type}
              </span>
              <p className="text-[12px] font-medium text-text-secondary group-hover:text-text-primary transition-colors">{s.text}</p>
              <button className="ml-auto shrink-0 text-[11px] font-semibold text-lavender opacity-0 group-hover:opacity-100 transition-opacity">Apply</button>
            </div>
          ))}
        </div>
      </motion.div>

      <NewBookingModal 
        open={showNewBooking} 
        onClose={() => setShowNewBooking(false)} 
        onSuccess={handleBookingSuccess} 
      />
    </motion.div>
  );
}
