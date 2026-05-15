"use client";

import { motion } from "framer-motion";
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Share2, 
  CreditCard,
  Camera,
  ChevronRight,
  Globe,
  Mail,
  Smartphone,
  Lock,
  Cloud,
  ExternalLink,
  Save,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'salon', label: 'Salon Information', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Share2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function CoreSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
         <div>
           <h2 className="text-4xl font-black tracking-tighter mb-2 text-text-primary">Core <span className="text-lavender">Settings</span></h2>
           <p className="text-sm font-medium text-text-secondary italic">Centralized configuration and account telemetry.</p>
         </div>
         <button className="px-8 py-4 rounded-2xl bg-lavender text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-lavender/20 hover:scale-105 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> Save All Changes
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Settings Tabs */}
         <div className="lg:col-span-3 space-y-3">
            {TABS.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                     "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                     activeTab === tab.id 
                        ? "bg-card shadow-xl shadow-foreground/5 text-lavender border border-foreground/5" 
                        : "text-text-secondary hover:bg-card/50 hover:text-text-primary"
                  )}
               >
                  <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-lavender" : "text-text-secondary/60")} />
                  {tab.label}
               </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="lg:col-span-9">
            <div className="glass p-10 rounded-[3.5rem] border-foreground/5 shadow-2xl bg-card">
               {activeTab === 'profile' && (
                  <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-12"
                  >
                     <div className="flex items-center gap-10">
                        <div className="relative group">
                           <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-lavender to-blush flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-card">
                              AV
                           </div>
                           <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-foreground text-card flex items-center justify-center shadow-lg border-2 border-card hover:scale-110 transition-all">
                              <Camera className="w-5 h-5" />
                           </button>
                        </div>
                        <div>
                           <h3 className="text-2xl font-black tracking-tight">Alexandra V.</h3>
                           <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Chief Operations Officer</p>
                           <div className="flex gap-2 mt-4">
                              <span className="px-3 py-1 rounded-full bg-lavender/10 text-lavender text-[9px] font-black uppercase tracking-widest">Admin Access</span>
                              <span className="px-3 py-1 rounded-full bg-sage/10 text-sage-dark text-[9px] font-black uppercase tracking-widest">Verified</span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                           { label: "Full Name", value: "Alexandra Volkov", icon: User },
                           { label: "Email Address", value: "alexandra.v@neurostrom.com", icon: Mail },
                           { label: "Phone Number", value: "+1 (555) 012-3456", icon: Smartphone },
                           { label: "Language", value: "English (US)", icon: Globe },
                        ].map((field, i) => (
                           <div key={i} className="space-y-2">
                              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">{field.label}</label>
                              <div className="relative group">
                                 <field.icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-lavender transition-colors" />
                                 <input 
                                    defaultValue={field.value}
                                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-foreground/[0.02] border border-foreground/5 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-lavender/5 transition-all"
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               )}

               {activeTab === 'salon' && (
                  <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-10"
                  >
                     <h3 className="text-2xl font-black tracking-tight mb-8">Salon Profile</h3>
                     <div className="space-y-6">
                        <div className="p-6 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5 flex items-center justify-between group hover:border-lavender/30 transition-all cursor-pointer">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-lavender/10 flex items-center justify-center">
                                 <Building2 className="w-6 h-6 text-lavender" />
                              </div>
                              <div>
                                 <p className="font-black text-base text-text-primary">Soho Flagship Hub</p>
                                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">42 Mercer St, New York, NY 10013</p>
                              </div>
                           </div>
                           <ChevronRight className="w-5 h-5 text-text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                     </div>
                     <button className="w-full py-5 rounded-2xl bg-card border-2 border-dashed border-foreground/10 text-text-muted text-[10px] font-black uppercase tracking-widest hover:border-lavender/40 hover:text-lavender transition-all">
                        + Add New Branch Location
                     </button>
                  </motion.div>
               )}

               {activeTab === 'security' && (
                  <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-10"
                  >
                     <h3 className="text-2xl font-black tracking-tight mb-8">Security & Privacy</h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/5">
                           <div className="flex items-center gap-4">
                              <Lock className="w-5 h-5 text-text-muted" />
                              <div>
                                 <p className="text-sm font-black text-text-primary">Two-Factor Authentication</p>
                                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Add an extra layer of security</p>
                              </div>
                           </div>
                           <button className="px-5 py-2 rounded-xl bg-sage/10 text-sage-dark text-[9px] font-black uppercase tracking-widest">Enabled</button>
                        </div>
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/5">
                           <div className="flex items-center gap-4">
                              <Cloud className="w-5 h-5 text-text-muted" />
                              <div>
                                 <p className="text-sm font-black text-text-primary">Data Encryption</p>
                                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">AES-256 System-wide protocol</p>
                              </div>
                           </div>
                           <button className="px-5 py-2 rounded-xl bg-sage/10 text-sage-dark text-[9px] font-black uppercase tracking-widest">Active</button>
                        </div>
                     </div>
                     <div className="pt-6 border-t border-foreground/5">
                        <button className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-70 transition-opacity">
                           <Trash2 className="w-4 h-4" /> Deactivate Account Telemetry
                        </button>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'billing' && (
                  <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-10"
                  >
                     <div className="p-10 rounded-[3rem] bg-gradient-to-br from-lavender to-blush text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10 flex justify-between items-start">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Current Plan</p>
                              <h3 className="text-4xl font-black tracking-tighter">Enterprise Pro</h3>
                              <p className="text-xs font-bold opacity-60 mt-4">$499 / Month • 12 Active Branches</p>
                           </div>
                           <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                              <CreditCard className="w-7 h-7" />
                           </div>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5">
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4">Payment Method</p>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-8 bg-foreground/10 rounded-md" />
                              <p className="text-sm font-black">Visa ending in 4242</p>
                           </div>
                        </div>
                        <div className="p-6 rounded-[2.5rem] bg-foreground/[0.02] border border-foreground/5">
                           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4">Next Billing Date</p>
                           <p className="text-sm font-black">November 12, 2026</p>
                        </div>
                     </div>
                  </motion.div>
               )}

               {activeTab !== 'profile' && activeTab !== 'salon' && activeTab !== 'security' && activeTab !== 'billing' && (
                  <div className="py-20 text-center">
                     <p className="text-sm font-bold text-text-muted italic">Neural interface for {activeTab} is currently in calibration...</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
