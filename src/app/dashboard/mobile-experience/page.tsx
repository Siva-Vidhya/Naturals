"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Camera, 
  Sparkles, 
  Calendar, 
  Gift, 
  User, 
  History, 
  Bell, 
  ChevronRight, 
  Search,
  Star,
  Clock,
  MapPin,
  Heart,
  Plus,
  Zap,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
type MobileScreen = 'home' | 'scan' | 'recommendations' | 'appointments' | 'rewards' | 'profile' | 'timeline';

// --- Components ---

const ScreenWrapper = ({ children, title, showHeader = true }: { children: React.ReactNode; title?: string; showHeader?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="flex-1 flex flex-col h-full overflow-y-auto pb-32 pt-6 px-6 custom-scrollbar"
  >
    {showHeader && (
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
        <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center relative">
           <Bell className="w-5 h-5 text-foreground/40" />
           <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blush border-2 border-white" />
        </button>
      </div>
    )}
    {children}
  </motion.div>
);

const NavbarItem = ({ icon: Icon, active, onClick, label }: { icon: any; active: boolean; onClick: () => void; label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-all duration-300",
      active ? "text-lavender scale-110" : "text-foreground/20 hover:text-foreground/40"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
      active ? "bg-lavender/10 shadow-inner" : ""
    )}>
      <Icon className={cn("w-6 h-6", active ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
    </div>
    <span className={cn("text-[9px] font-black uppercase tracking-widest", active ? "opacity-100" : "opacity-0")}>
      {label}
    </span>
  </button>
);

// --- Main Page Component ---

export default function MobileAppUI() {
  const [activeScreen, setActiveScreen] = useState<MobileScreen>('home');

  return (
    <main className="min-h-screen bg-[#FDFCFB] flex items-center justify-center lg:p-12">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[430px] h-[90vh] bg-[#FDFCFB] rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-[8px] border-white overflow-hidden relative flex flex-col">
        
        <AnimatePresence mode="wait">
          {activeScreen === 'home' && (
            <ScreenWrapper key="home" showHeader={false}>
              <div className="pt-4 mb-8">
                <p className="text-[10px] font-black text-lavender uppercase tracking-[0.2em] mb-2">Welcome Back</p>
                <h1 className="text-3xl font-black tracking-tighter">Hello, Alexandra</h1>
              </div>

              {/* Loyalty Card */}
              <div className="bg-gradient-to-br from-lavender to-blush p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Platinum Member</p>
                        <h3 className="text-3xl font-black mt-1">2,450 <span className="text-sm font-bold opacity-60">pts</span></h3>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Gift className="w-5 h-5" />
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          className="h-full bg-white" 
                        />
                      </div>
                      <span className="text-[9px] font-black">75% to next reward</span>
                   </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <button 
                  onClick={() => setActiveScreen('scan')}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-foreground/5 text-left group hover:scale-[1.02] transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-peach/10 flex items-center justify-center mb-4 text-peach">
                      <Camera className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">AI Scan</p>
                    <p className="text-[9px] font-bold text-foreground/30 uppercase mt-1">Neural Profile</p>
                 </button>
                 <button 
                  onClick={() => setActiveScreen('appointments')}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-foreground/5 text-left group hover:scale-[1.02] transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center mb-4 text-sage">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Book Now</p>
                    <p className="text-[9px] font-bold text-foreground/30 uppercase mt-1">Reserve Station</p>
                 </button>
              </div>

              {/* Upcoming Appointment */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4 px-2">
                   <h4 className="text-sm font-black uppercase tracking-widest">Next Appointment</h4>
                   <ChevronRight className="w-4 h-4 text-foreground/20" />
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-foreground/5 flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-[#FFF7F1] flex flex-col items-center justify-center shrink-0">
                      <span className="text-sm font-black">18</span>
                      <span className="text-[9px] font-black uppercase text-lavender">Oct</span>
                   </div>
                   <div className="flex-1">
                      <h5 className="text-sm font-black tracking-tight">Molecular Infusion</h5>
                      <p className="text-[10px] font-bold text-foreground/40 mt-1 uppercase tracking-widest">4:30 PM • Soho Branch</p>
                   </div>
                </div>
              </div>
            </ScreenWrapper>
          )}

          {activeScreen === 'scan' && (
            <ScreenWrapper key="scan" title="AI Beauty Scan">
              <div className="aspect-[3/4] bg-neutral-900 rounded-[3rem] relative overflow-hidden mb-8">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Camera className="w-20 h-20 text-white" />
                 </div>
                 
                 {/* Scanning HUD Overlay */}
                 <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <div className="flex justify-between">
                       <div className="w-8 h-8 border-t-2 border-l-2 border-lavender rounded-tl-xl" />
                       <div className="w-8 h-8 border-t-2 border-r-2 border-lavender rounded-tr-xl" />
                    </div>
                    
                    <div className="text-center">
                       <motion.div 
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender text-white text-[10px] font-black uppercase tracking-widest shadow-xl"
                       >
                          <Zap className="w-3 h-3" />
                          Neural Mapping Active
                       </motion.div>
                    </div>

                    <div className="flex justify-between">
                       <div className="w-8 h-8 border-b-2 border-l-2 border-lavender rounded-bl-xl" />
                       <div className="w-8 h-8 border-b-2 border-r-2 border-lavender rounded-br-xl" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-lg font-black tracking-tight">Instructions</h3>
                 <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-foreground/5">
                    <div className="w-8 h-8 rounded-lg bg-lavender/10 flex items-center justify-center font-black text-xs text-lavender">01</div>
                    <p className="text-xs font-bold text-foreground/60 leading-relaxed">Position your face within the frame and ensure good lighting.</p>
                 </div>
                 <button className="w-full py-5 rounded-[2rem] bg-lavender text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-lavender/20">
                    Start Scanning
                 </button>
              </div>
            </ScreenWrapper>
          )}

          {activeScreen === 'recommendations' && (
            <ScreenWrapper key="recs" title="AI Recommendations">
              <div className="space-y-6">
                {[
                  { title: "SilkProtein Peptide", desc: "Based on your latest scan, your hair needs deep protein infusion.", price: "$84", icon: Sparkles, color: "text-lavender", bg: "bg-lavender/5" },
                  { title: "NeuroGlow Mask", desc: "Optimal for maintaining scalp hydration in the current climate.", price: "$62", icon: Zap, color: "text-peach", bg: "bg-peach/5" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[3rem] shadow-sm border border-foreground/5"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", item.bg, item.color)}>
                       <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-xs font-medium text-foreground/40 leading-relaxed mb-6">{item.desc}</p>
                    <div className="flex justify-between items-center">
                       <span className="text-lg font-black">{item.price}</span>
                       <button className="px-6 py-3 rounded-2xl bg-foreground text-white text-[10px] font-black uppercase tracking-widest">Buy Now</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScreenWrapper>
          )}

          {activeScreen === 'timeline' && (
            <ScreenWrapper key="timeline" title="Beauty Timeline">
              <div className="relative pl-8 space-y-12 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-foreground/5">
                {[
                  { date: "Oct 12", title: "Molecular Infusion", result: "98% Accuracy", tags: ["Hydration", "Repair"] },
                  { date: "Sep 15", title: "Neural Color Scan", result: "Perfect Match", tags: ["Tone Detection"] },
                  { date: "Aug 02", title: "Initial Consultation", result: "Profile Created", tags: ["Diagnostics"] }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-lavender flex items-center justify-center z-10 shadow-sm">
                       <div className="w-2 h-2 rounded-full bg-lavender" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-lavender uppercase tracking-widest mb-1">{item.date}</p>
                       <h3 className="text-lg font-black tracking-tight">{item.title}</h3>
                       <p className="text-[10px] font-bold text-foreground/40 uppercase mt-1">Status: {item.result}</p>
                       <div className="flex gap-2 mt-3">
                          {item.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-foreground/5 text-[9px] font-black uppercase tracking-widest text-foreground/60">{tag}</span>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScreenWrapper>
          )}

          {activeScreen === 'rewards' && (
            <ScreenWrapper key="rewards" title="Rewards Hub">
               <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-foreground/5 mb-8">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-lavender/10 flex items-center justify-center">
                        <Award className="w-8 h-8 text-lavender" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black tracking-tight">VIP Platinum</h3>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Active Tier</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground/60">Complementary Treatment</span>
                        <ChevronRight className="w-4 h-4 text-foreground/20" />
                     </div>
                     <div className="h-[1px] w-full bg-foreground/5" />
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground/60">Priority Booking</span>
                        <ChevronRight className="w-4 h-4 text-foreground/20" />
                     </div>
                  </div>
               </div>

               <h4 className="text-sm font-black uppercase tracking-widest mb-6 px-2">Available Perks</h4>
               <div className="space-y-4">
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-foreground/5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-peach/10 flex items-center justify-center text-peach">
                           <Gift className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-xs font-black tracking-tight">Free Scalp Detox</p>
                           <p className="text-[9px] font-bold text-foreground/30 uppercase">500 Points</p>
                        </div>
                     </div>
                     <button className="px-4 py-2 rounded-xl bg-lavender/10 text-lavender text-[9px] font-black uppercase tracking-widest">Redeem</button>
                  </div>
               </div>
            </ScreenWrapper>
          )}
        </AnimatePresence>

        {/* Floating Bottom Navbar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] glass p-3 rounded-[2.5rem] shadow-2xl border-white/60 flex justify-between items-center px-6 z-50">
          <NavbarItem icon={Home} active={activeScreen === 'home'} label="Home" onClick={() => setActiveScreen('home')} />
          <NavbarItem icon={Sparkles} active={activeScreen === 'recommendations'} label="AI Rec" onClick={() => setActiveScreen('recommendations')} />
          <div className="relative">
             <button 
              onClick={() => setActiveScreen('scan')}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender to-blush flex items-center justify-center shadow-lg -mt-12 border-4 border-[#FDFCFB]"
             >
                <Camera className="text-white w-6 h-6" />
             </button>
          </div>
          <NavbarItem icon={History} active={activeScreen === 'timeline'} label="Journey" onClick={() => setActiveScreen('timeline')} />
          <NavbarItem icon={Award} active={activeScreen === 'rewards'} label="Perks" onClick={() => setActiveScreen('rewards')} />
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/10 rounded-full" />
      </div>
    </main>
  );
}
