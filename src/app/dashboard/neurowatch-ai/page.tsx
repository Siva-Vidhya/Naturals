"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cctv, 
  Activity, 
  Smile, 
  Frown, 
  Meh, 
  ShieldCheck, 
  AlertTriangle, 
  Mic, 
  Volume2, 
  Maximize2, 
  MoreHorizontal,
  Sparkles,
  Zap,
  LayoutGrid,
  Monitor,
  Eye,
  Info,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Webcam from 'react-webcam';

// --- Types ---
type Emotion = 'Happy' | 'Neutral' | 'Anxious' | 'Satisfied';

interface CameraFeed {
  id: string;
  name: string;
  stylist: string;
  service: string;
  emotion: Emotion;
  compliance: number;
  posture: 'Optimal' | 'Tense' | 'Adjusting';
  status: 'Active' | 'Warning' | 'Idle';
}

// --- Mock Data ---
const CAMERA_FEEDS: CameraFeed[] = [
  { id: '1', name: 'Main Hall - Station 01', stylist: 'Elena Rossi', service: 'Molecular Infusion', emotion: 'Satisfied', compliance: 98, posture: 'Optimal', status: 'Active' },
  { id: '2', name: 'VIP Suite - Station 04', stylist: 'Marcus Chen', service: 'Scalp Detox', emotion: 'Neutral', compliance: 92, posture: 'Optimal', status: 'Active' },
  { id: '3', name: 'Wash Area - Section B', stylist: 'Sarah Miller', service: 'Purification', emotion: 'Anxious', compliance: 84, posture: 'Tense', status: 'Warning' },
  { id: '4', name: 'Treatment Lab - Desk 02', stylist: 'Julien Blanc', service: 'Hair Mapping', emotion: 'Happy', compliance: 96, posture: 'Optimal', status: 'Active' },
];

// --- Components ---

const EmotionMeter = ({ emotion }: { emotion: Emotion }) => {
  const getLevel = () => {
    switch (emotion) {
      case 'Happy': return 90;
      case 'Satisfied': return 85;
      case 'Neutral': return 50;
      case 'Anxious': return 30;
      default: return 50;
    }
  };

  const getColor = () => {
    switch (emotion) {
      case 'Happy':
      case 'Satisfied': return 'bg-sage';
      case 'Neutral': return 'bg-lavender';
      case 'Anxious': return 'bg-red-400';
      default: return 'bg-white';
    }
  };

  return (
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${getLevel()}%` }}
        className={cn("h-full shadow-[0_0_8px_rgba(255,255,255,0.3)]", getColor())}
      />
    </div>
  );
};

const PostureSkeleton = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="stroke-lavender stroke-[0.5] fill-none"
    >
      {/* Skeleton Lines */}
      <motion.path 
        d="M50 20 L50 50 L35 75 M50 50 L65 75 M50 30 L30 45 M50 30 L70 45" 
        animate={{ 
          d: [
            "M50 20 L50 50 L35 75 M50 50 L65 75 M50 30 L30 45 M50 30 L70 45",
            "M50 21 L51 51 L36 76 M51 51 L66 76 M51 31 L31 46 M51 31 L71 46",
            "M50 20 L50 50 L35 75 M50 50 L65 75 M50 30 L30 45 M50 30 L70 45"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Joints */}
      <circle cx="50" cy="20" r="1.5" className="fill-lavender shadow-xl" />
      <circle cx="50" cy="50" r="1.5" className="fill-lavender" />
      <circle cx="35" cy="75" r="1.5" className="fill-lavender" />
      <circle cx="65" cy="75" r="1.5" className="fill-lavender" />
    </motion.g>
  </svg>
);

const CameraFeedCard = ({ feed, isActive, useWebcam = false }: { feed: CameraFeed; isActive: boolean; useWebcam?: boolean }) => {
  return (
    <motion.div 
      layout
      className={cn(
        "glass rounded-[2.5rem] border-white/60 shadow-xl overflow-hidden relative group cursor-pointer",
        isActive ? "ring-2 ring-lavender/40 scale-[1.02]" : "hover:scale-[1.01]"
      )}
    >
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              feed.status === 'Active' ? "bg-sage animate-pulse" : "bg-red-400"
            )} />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{feed.name}</span>
          </div>
          <p className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">Stylist: {feed.stylist}</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="text-[9px] font-black text-white uppercase">{feed.service}</span>
           </div>
        </div>
      </div>

      {/* Video Feed Area */}
      <div className="aspect-video bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        
        {useWebcam ? (
          <Webcam 
            audio={false}
            className="w-full h-full object-cover grayscale-[0.3] contrast-[1.2]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Monitor className="w-16 h-16 text-white" />
          </div>
        )}
        
        {/* Posture Overlay */}
        <PostureSkeleton />

        {/* Neural Scanning HUD Effect */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-lavender/30 shadow-[0_0_15px_rgba(167,139,250,0.5)] z-20"
        />

        {/* AI Detection Labels */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end gap-3 z-30 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-fit"
          >
            <div className="w-1 h-8 bg-lavender rounded-full" />
            <div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Neural Posture</p>
              <p className="text-[10px] font-black text-lavender uppercase">{feed.posture} Alignment</p>
            </div>
          </motion.div>
          
          <div className="flex gap-2">
            <div className="bg-sage/20 backdrop-blur-md px-2 py-1 rounded-md border border-sage/30">
               <span className="text-[8px] font-black text-sage uppercase">SOP COMPLIANT</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
               <span className="text-[8px] font-black text-white uppercase">FACE DETECTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-6 grid grid-cols-3 gap-6 bg-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">Sentiment</p>
            <span className="text-[10px] font-black">{feed.emotion}</span>
          </div>
          <EmotionMeter emotion={feed.emotion} />
        </div>
        <div className="text-center border-x border-foreground/5 flex flex-col justify-center">
          <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mb-1">Quality Score</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm font-black text-lavender">{feed.compliance}</span>
            <span className="text-[8px] font-bold text-foreground/20">/100</span>
          </div>
        </div>
        <div className="flex flex-col justify-center items-end">
          <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mb-1">Safety Lock</p>
          <div className="flex items-center gap-1.5">
             <ShieldCheck className="w-3.5 h-3.5 text-sage" />
             <span className="text-[9px] font-black uppercase text-sage">SECURED</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function MonitoringDashboard() {
  const [activeFeedId, setActiveFeedId] = useState('1');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [alerts, setAlerts] = useState([
    { id: '1', type: 'compliance', message: 'Station 03: Water temperature outside SOP range (42°C)', time: '12:45' },
    { id: '2', type: 'emotion', message: 'Station 01: Client emotion shift detected (Neutral → Satisfied)', time: '12:48' }
  ]);

  return (
    <main className="min-h-screen bg-[#080809] text-white flex overflow-hidden">
      {/* Side HUD */}
      <aside className="w-85 bg-neutral-900/40 border-r border-white/5 flex flex-col p-8 z-50 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center shadow-2xl shadow-lavender/20">
            <Cctv className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter">Neuro<span className="text-lavender">Watch</span></h1>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
               <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Live Engine v4.0.2</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* Global Quality Score HUD */}
           <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Activity className="w-24 h-24 text-lavender" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <Sparkles className="w-3.5 h-3.5 text-lavender" />
                   <h3 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Aggregate Precision</h3>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl font-black mb-2 tracking-tighter flex items-baseline gap-1"
                >
                  94.8<span className="text-lg text-lavender">%</span>
                </motion.div>
                <div className="flex items-center gap-2">
                   <TrendingUp className="w-3 h-3 text-sage" />
                   <span className="text-[9px] font-bold text-sage uppercase">+2.4% vs last hour</span>
                </div>
              </div>
           </div>

           {/* Voice Assistant Module */}
           <div className="p-6 rounded-3xl bg-lavender/5 border border-lavender/10 relative">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-lavender" />
                    <h3 className="text-[10px] font-black text-lavender uppercase tracking-widest">Neural Voice</h3>
                 </div>
                 <button 
                   onClick={() => setIsVoiceActive(!isVoiceActive)}
                   className={cn(
                     "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                     isVoiceActive ? "bg-lavender text-white shadow-xl shadow-lavender/30" : "bg-white/5 text-white/40 border border-white/5"
                   )}
                 >
                    <Mic className={cn("w-4 h-4", isVoiceActive && "animate-pulse")} />
                 </button>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-medium text-white/50 leading-relaxed italic border-l-2 border-lavender/20 pl-3">
                  {isVoiceActive ? "Assistant: 'Station 03 compliance recovered. Monitoring emotion shift at Station 01.'" : "Neural Assistant standby..."}
                </p>
              </div>
           </div>

           {/* Live Alerts Feed */}
           <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-white/20" />
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Critical Feed</h3>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-red-400/20 text-red-400 text-[8px] font-black">2 ACTIVE</div>
              </div>
              <div className="space-y-3">
                 {alerts.map((alert) => (
                   <motion.div 
                     key={alert.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer"
                   >
                      <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5">
                           {alert.type === 'compliance' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : <Zap className="w-3.5 h-3.5 text-lavender" />}
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-bold text-white/70 leading-relaxed">{alert.message}</p>
                           <div className="flex items-center justify-between mt-2">
                             <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{alert.time}</span>
                             <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/40 transition-colors" />
                           </div>
                        </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </aside>

      {/* Main Monitoring Wall */}
      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-lavender/5 via-transparent to-transparent">
         <header className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-6">
               <div>
                  <h2 className="text-4xl font-black tracking-tighter">Monitoring <span className="text-lavender">Wall</span></h2>
                  <div className="flex items-center gap-3 mt-2">
                     <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-sage" />
                        <span className="text-[9px] font-black uppercase text-sage tracking-[0.2em]">Feed Live</span>
                     </div>
                     <div className="w-1 h-1 rounded-full bg-white/10" />
                     <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Multi-Channel Active</span>
                  </div>
               </div>
               
               <div className="h-12 w-[1px] bg-white/5" />
               
               <div className="flex gap-8">
                  <div className="text-center">
                     <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Encrypted</p>
                     <p className="text-xs font-black text-white/60 uppercase">AES-256</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Bandwidth</p>
                     <p className="text-xs font-black text-white/60 uppercase">4.2 GB/S</p>
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all group">
                  <LayoutGrid className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                  <span>Mosaic View</span>
               </button>
               <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-white/5">
                  <Maximize2 className="w-4 h-4" />
                  <span>Full Control</span>
               </button>
            </div>
         </header>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-20">
            {CAMERA_FEEDS.map((feed, index) => (
              <CameraFeedCard 
                key={feed.id} 
                feed={feed} 
                isActive={activeFeedId === feed.id} 
                useWebcam={index === 0} // Use real webcam for the first feed
              />
            ))}
         </div>

         {/* AI Optimization HUD Popup */}
         <motion.div 
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="fixed bottom-12 right-12 w-96 glass-dark p-8 rounded-[3rem] border-white/10 shadow-2xl z-[100] bg-[#0A0A0B]/90 backdrop-blur-3xl overflow-hidden"
         >
            <div className="absolute -right-8 -bottom-8 opacity-5">
               <Sparkles className="w-32 h-32" />
            </div>
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-sage/20 flex items-center justify-center border border-sage/30 shadow-lg shadow-sage/10">
                        <BrainCircuit className="w-6 h-6 text-sage" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black tracking-tighter">Neural Advice</h4>
                        <p className="text-[9px] font-bold text-sage uppercase tracking-widest italic">Live Optimization</p>
                     </div>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                     <Info className="w-4 h-4 text-white/20" />
                  </button>
               </div>
               
               <p className="text-[11px] font-medium text-white/60 leading-relaxed mb-8 italic">
                 "Station 03: Postural shift detected. Stylist alignment is reaching threshold. Recommending a 5-minute neural reset session after current treatment."
               </p>
               
               <div className="flex gap-3">
                  <button className="flex-1 py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all">
                     Log Incident
                  </button>
                  <button className="flex-1 py-4 rounded-2xl bg-lavender text-white font-black text-[10px] uppercase tracking-widest hover:bg-lavender/90 transition-all shadow-xl shadow-lavender/20">
                     Approve Reset
                  </button>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Global Bottom HUD Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-10 py-4 bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 flex items-center gap-16 z-[100]"
      >
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-sage shadow-[0_0_15px_#22c55e]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Neural Engine: Nominal</span>
        </div>
        <div className="h-5 w-[1px] bg-white/10" />
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Encryption:</span>
          <span className="text-[11px] font-black text-lavender tracking-widest">TLS 1.3 / E2E</span>
        </div>
        <div className="h-5 w-[1px] bg-white/10" />
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Latency:</span>
          <span className="text-[11px] font-black text-sage">12ms</span>
        </div>
      </motion.div>
    </main>
  );
}
