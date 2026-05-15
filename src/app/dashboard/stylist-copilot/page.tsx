"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  History, 
  ListChecks, 
  Clock, 
  Mic, 
  Send, 
  ChevronRight, 
  Zap, 
  Award, 
  ShoppingBag,
  MessageSquare,
  ClipboardList,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  X,
  Plus,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- Types ---
interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timeEstimate: number;
}

interface Message {
  id: string;
  sender: 'ai' | 'stylist';
  text: string;
  timestamp: Date;
}

// --- Mock Data ---
const MOCK_CUSTOMER = {
  name: "Alexandra Sterling",
  tier: "Platinum",
  lastVisit: "Oct 12, 2025",
  notes: "Prefers cold-pressed oils. Sensitive to strong fragrances.",
  history: [
    { date: "Oct 12", service: "Advanced Scalp Detox" },
    { date: "Sep 15", service: "Silk Protein Treatment" }
  ]
};

const INITIAL_STEPS: Step[] = [
  { id: '1', title: 'Neural Consultation', description: 'Analyze scalp and hair texture using Beauty Passport data.', completed: false, timeEstimate: 10 },
  { id: '2', title: 'Purification Wash', description: 'Apply NeuroGlow detoxifying shampoo with cold water.', completed: false, timeEstimate: 15 },
  { id: '3', title: 'Infusion Treatment', description: 'Deep tissue infusion of SilkProtein peptide serum.', completed: false, timeEstimate: 25 },
  { id: '4', title: 'Molecular Seal', description: 'Heat-activated sealant for long-lasting glow.', completed: false, timeEstimate: 10 },
];

const RECOMMENDED_PRODUCTS = [
  { name: "NeuroGlow Serum", price: "$85", category: "Treatment" },
  { name: "SilkProtein Mask", price: "$64", category: "Care" }
];

// --- Components ---

const VoiceWave = () => (
  <div className="flex items-center gap-1 h-6">
    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((_, i) => (
      <motion.div
        key={i}
        animate={{ height: [4, 16, 4] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
        className="w-[3px] bg-lavender rounded-full"
      />
    ))}
  </div>
);

const ModuleHeader = ({ title, icon: Icon, colorClass }: { title: string; icon: any; colorClass: string }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-xl bg-white shadow-sm", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-extrabold text-sm tracking-tight text-foreground">{title}</h3>
    </div>
    <button className="p-1 hover:bg-white/40 rounded-lg transition-colors">
      <MoreVertical className="w-4 h-4 text-foreground/20" />
    </button>
  </div>
);

export default function StylistCoPilotPage() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: "Welcome back! Alexandra's last treatment showed excellent results. I recommend focusing on moisture infusion today.", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<'profile' | 'sop' | 'analytics'>('sop');
  const [timer, setTimer] = useState(3600); // 1 hour
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const toggleStep = (id: string) => {
    setSteps(s => s.map(step => step.id === id ? { ...step, completed: !step.completed } : step));
    if (!steps.find(st => st.id === id)?.completed) {
      toast.success("Step marked as complete");
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), sender: 'stylist', text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    const currentInput = inputText;
    setInputText("");
    
    // Simulate AI response
    setIsTyping(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, newMsg],
          context: {
            customer: MOCK_CUSTOMER,
            focus: "Protein Recovery & Shine Booster"
          }
        })
      });
      
      const data = await response.json();
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: data.text, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      toast.error("Failed to reach AI CoPilot");
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <main className="h-screen bg-soft-gradient flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="px-8 py-4 glass border-b border-white/20 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter">Stylist <span className="text-lavender">CoPilot</span></h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
              <span className="text-[9px] font-black text-sage uppercase tracking-widest">Neural Link Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/40 border border-white/60">
            <Clock className="w-4 h-4 text-lavender" />
            <span className="text-sm font-black tabular-nums">{formatTime(timer)}</span>
            <div className="w-[1px] h-4 bg-foreground/10 mx-1" />
            <span className="text-[10px] font-bold text-foreground/40 uppercase">Total Service Time</span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black">Elena Rossi</p>
                <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-tighter text-lavender">Senior Stylist</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-lavender/20 border border-lavender/40 flex items-center justify-center">
                <User className="w-5 h-5 text-lavender" />
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Service Details & SOP */}
        <section className="flex-1 overflow-y-auto p-8 space-y-8 border-r border-white/20 custom-scrollbar">
          {/* Customer Profile Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass p-8 rounded-[2.5rem] border-white/60 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-peach/10 border border-peach/20">
                   <Zap className="w-3 h-3 text-peach" />
                   <span className="text-[9px] font-black text-peach uppercase">{MOCK_CUSTOMER.tier} Status</span>
                </div>
              </div>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-peach/30 to-blush/30 border border-white flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-foreground/40" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{MOCK_CUSTOMER.name}</h2>
                  <p className="text-sm font-bold text-foreground/40">Last Visit: {MOCK_CUSTOMER.lastVisit}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                    <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Key Insights</p>
                    <p className="text-xs font-semibold leading-relaxed">{MOCK_CUSTOMER.notes}</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-lavender/5 border border-lavender/10">
                    <p className="text-[9px] font-bold text-lavender uppercase tracking-widest mb-1">Recommended Focus</p>
                    <p className="text-xs font-semibold text-lavender">Protein Recovery & Shine Booster</p>
                 </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl flex flex-col justify-between">
              <ModuleHeader title="Quality Score" icon={Award} colorClass="text-sage" />
              <div className="text-center">
                <div className="relative inline-flex mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-foreground/5" />
                    <motion.circle 
                      cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" 
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * 0.92) }}
                      className="text-sage" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">92</span>
                    <span className="text-[8px] font-bold text-foreground/40 uppercase">Optimal</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-foreground/40 leading-tight">Current Technique Precision Score</p>
              </div>
            </div>
          </div>

          {/* SOP Workflow */}
          <div className="glass p-8 rounded-[3rem] border-white/60 shadow-xl">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-lavender/10">
                    <ClipboardList className="w-6 h-6 text-lavender" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl tracking-tight">Service Workflow (SOP)</h3>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Molecular Recovery Treatment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground/40">{steps.filter(s => s.completed).length}/{steps.length} Steps</span>
                </div>
             </div>

             <div className="space-y-4">
                {steps.map((step, i) => (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => toggleStep(step.id)}
                    className={cn(
                      "group relative flex items-start gap-6 p-6 rounded-3xl border transition-all cursor-pointer",
                      step.completed 
                        ? "bg-sage/5 border-sage/20 opacity-60" 
                        : "bg-white/40 border-white hover:bg-white/60 shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      step.completed ? "bg-sage border-sage" : "border-foreground/10 group-hover:border-lavender/50"
                    )}>
                      {step.completed ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className="w-2 h-2 rounded-full bg-foreground/10 group-hover:bg-lavender/50" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={cn("font-bold text-sm", step.completed && "line-through")}>{step.title}</h4>
                        <span className="text-[10px] font-bold text-foreground/30">{step.timeEstimate}m</span>
                      </div>
                      <p className="text-xs text-foreground/50 font-medium leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>

          {/* Smart Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="glass p-8 rounded-[2.5rem] border-white/60 bg-gradient-to-br from-white/40 to-lavender/5">
                <ModuleHeader title="Product Suggestions" icon={ShoppingBag} colorClass="text-blush" />
                <div className="space-y-3">
                   {RECOMMENDED_PRODUCTS.map((p, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-white hover:border-lavender/30 transition-all group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blush/10 flex items-center justify-center text-[10px] font-black text-blush">0{i+1}</div>
                           <div>
                              <p className="text-xs font-bold text-foreground/70">{p.name}</p>
                              <p className="text-[9px] font-black text-foreground/30 uppercase">{p.category}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-black text-foreground/80">{p.price}</span>
                           <button className="p-1.5 rounded-lg bg-lavender/10 text-lavender hover:bg-lavender hover:text-white transition-all opacity-0 group-hover:opacity-100">
                              <Plus className="w-3 h-3" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="glass p-8 rounded-[2.5rem] border-white/60">
                <ModuleHeader title="Neural Insights" icon={History} colorClass="text-lavender" />
                <div className="space-y-4">
                   {MOCK_CUSTOMER.history.map((h, i) => (
                     <div key={i} className="flex items-center gap-4">
                        <div className="text-[10px] font-black text-foreground/20 uppercase whitespace-nowrap">{h.date}</div>
                        <div className="flex-1 h-[1px] bg-foreground/5" />
                        <div className="text-xs font-bold text-foreground/60">{h.service}</div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-6 py-3 rounded-2xl bg-lavender/5 border border-lavender/10 text-[10px] font-black uppercase text-lavender tracking-widest hover:bg-lavender/10 transition-all">
                  Full Medical History
                </button>
             </div>
          </div>
        </section>

        {/* Right Side: AI Assistant Panel */}
        <aside className="w-[400px] bg-white/20 backdrop-blur-xl border-l border-white/20 flex flex-col relative">
          <div className="p-6 border-b border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-lavender flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
               </div>
               <div>
                  <h3 className="font-black text-sm uppercase tracking-tighter">AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                     <VoiceWave />
                     <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Listening...</span>
                  </div>
               </div>
            </div>
            <button className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
               <Settings className="w-4 h-4 text-foreground/20" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.sender === 'stylist' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "px-5 py-4 rounded-[2rem] text-xs font-medium leading-relaxed shadow-sm",
                    msg.sender === 'stylist' 
                      ? "bg-lavender text-white rounded-tr-sm" 
                      : "bg-white/60 border border-white text-foreground/70 rounded-tl-sm"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-bold text-foreground/20 mt-2 uppercase tracking-tighter">
                    {msg.sender === 'ai' ? 'Neural CoPilot' : 'Elena'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/40 border border-white px-5 py-3 rounded-2xl rounded-tl-sm flex gap-1"
                >
                  <span className="w-1.5 h-1.5 bg-lavender/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-lavender/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-lavender/40 rounded-full animate-bounce" />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="p-6">
             <div className="bg-white/60 border border-white p-4 rounded-[2.5rem] shadow-lg">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
                   <textarea
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSendMessage();
                       }
                     }}
                     placeholder="Ask the CoPilot anything..."
                     className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-foreground/20 resize-none h-20"
                   />
                   <div className="flex items-center justify-between border-t border-foreground/5 pt-3">
                      <div className="flex gap-2">
                        <button type="button" className="p-2 hover:bg-lavender/10 rounded-xl transition-all text-lavender">
                           <Mic className="w-5 h-5" />
                        </button>
                        <button type="button" className="p-2 hover:bg-lavender/10 rounded-xl transition-all text-lavender">
                           <Zap className="w-5 h-5" />
                        </button>
                      </div>
                      <button 
                        type="submit"
                        disabled={!inputText.trim()}
                        className={cn(
                          "flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blush to-lavender text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blush/20 transition-all",
                          !inputText.trim() && "opacity-50 grayscale cursor-not-allowed"
                        )}
                      >
                         Send Link
                         <Send className="w-3 h-3" />
                      </button>
                   </div>
                </form>
             </div>
             <p className="text-center mt-4 text-[9px] font-bold text-foreground/20 uppercase tracking-widest">
               Powered by NeuroStrom Neural Core v4.0
             </p>
          </div>
        </aside>
      </div>

      {/* Floating Status Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 glass rounded-full border-white/60 shadow-2xl flex items-center gap-12 z-[100]"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-sage shadow-[0_0_10px_#22c55e]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 italic">Live Sync: Optimal</span>
        </div>
        <div className="h-4 w-[1px] bg-foreground/10" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Molecular Temp:</span>
          <span className="text-xs font-black text-lavender">38.4°C</span>
        </div>
        <div className="h-4 w-[1px] bg-foreground/10" />
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">Active Profile:</span>
          <span className="text-xs font-black text-foreground/70">A. Sterling</span>
        </div>
      </motion.div>
    </main>
  );
}
