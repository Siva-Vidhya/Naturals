"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Award, 
  BarChart3, 
  PieChart as PieChartIcon, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  LayoutDashboard,
  BrainCircuit,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from '@/lib/utils';

// --- Mock Data ---

const REVENUE_DATA = [
  { name: 'Jan', revenue: 45000, aiBoost: 12000 },
  { name: 'Feb', revenue: 52000, aiBoost: 15000 },
  { name: 'Mar', revenue: 48000, aiBoost: 11000 },
  { name: 'Apr', revenue: 61000, aiBoost: 18000 },
  { name: 'May', revenue: 55000, aiBoost: 14000 },
  { name: 'Jun', revenue: 67000, aiBoost: 22000 },
];

const BRANCH_DATA = [
  { name: 'London Soho', revenue: 85000, score: 94, color: '#A78BFA' },
  { name: 'Paris Marais', revenue: 72000, score: 91, color: '#FFD1DA' },
  { name: 'Milan Brera', revenue: 91000, score: 96, color: '#D6D6FF' },
  { name: 'NYC Tribeca', revenue: 65000, score: 88, color: '#FFF7F1' },
];

const STAFF_PERFORMANCE = [
  { name: 'Elena Rossi', role: 'Master Stylist', score: 98, clients: 124, trend: 'up' },
  { name: 'Marcus Chen', role: 'Art Director', score: 95, clients: 98, trend: 'up' },
  { name: 'Sarah Miller', role: 'Technician', score: 92, clients: 112, trend: 'down' },
  { name: 'Julien Blanc', role: 'Stylist', score: 89, clients: 86, trend: 'up' },
];

const SATISFACTION_DATA = [
  { name: 'Positive', value: 78, color: '#22C55E' },
  { name: 'Neutral', value: 15, color: '#A78BFA' },
  { name: 'Issues', value: 7, color: '#F43F5E' },
];

// --- Components ---

const KPICard = ({ title, value, change, icon: Icon, trend }: { title: string; value: string; change: string; icon: any; trend: 'up' | 'down' }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-[2rem] border-white/60 shadow-xl"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-2xl bg-white shadow-sm text-lavender">
        <Icon className="w-6 h-6" />
      </div>
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
        trend === 'up' ? "bg-sage/10 text-sage" : "bg-red-400/10 text-red-400"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
    <div className="text-3xl font-black mb-1 tracking-tight">{value}</div>
    <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.1em]">{title}</div>
  </motion.div>
);

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-black tracking-tight">{title}</h2>
    <p className="text-xs font-medium text-foreground/40 uppercase tracking-widest mt-1">{description}</p>
  </div>
);

export default function AnalyticsDashboard() {
  const [activeView, setActiveView] = useState('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'branches', label: 'Branches', icon: Building2 },
    { id: 'staff', label: 'Staff Analysis', icon: Users },
    { id: 'ai', label: 'AI Intelligence', icon: BrainCircuit },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ];

  return (
    <main className="min-h-screen bg-[#FFFDFB] flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 glass border-r border-white/20 p-8 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-xl tracking-tighter">Neuro<span className="text-lavender">Stream</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all",
                activeView === item.id 
                  ? "bg-white shadow-xl shadow-lavender/10 text-lavender border border-white" 
                  : "text-foreground/30 hover:bg-white/60 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeView === item.id ? "text-lavender" : "text-foreground/20")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-foreground/5">
          <div className="bg-lavender/5 p-4 rounded-2xl border border-lavender/10">
            <p className="text-[10px] font-black uppercase text-lavender tracking-widest mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
              <span className="text-[10px] font-bold text-foreground/40 italic">Global Sync Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto max-h-screen custom-scrollbar p-8 lg:p-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 rounded-md bg-lavender/10 border border-lavender/20 text-[9px] font-black text-lavender uppercase tracking-widest">Enterprise Edition</div>
              <div className="text-[9px] font-bold text-foreground/20">Last updated: 2 mins ago</div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Management <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender to-blush">Console</span></h1>
          </div>

          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glass border-white/60 text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm">
                <Calendar className="w-4 h-4 text-lavender" />
                <span>Last 30 Days</span>
             </button>
             <button className="p-3.5 rounded-2xl bg-lavender text-white shadow-xl shadow-lavender/20 hover:scale-105 transition-all">
                <Download className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <KPICard title="Total Revenue" value="$482,900" change="+14.2%" icon={DollarSign} trend="up" />
          <KPICard title="Avg AI Quality" value="94.2%" change="+2.1%" icon={ShieldCheck} trend="up" />
          <KPICard title="Customer Retention" value="88.4%" change="-1.4%" icon={Users} trend="down" />
          <KPICard title="Active Branches" value="12" change="+1" icon={MapPin} trend="up" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Revenue Growth Chart */}
          <div className="xl:col-span-2 glass p-8 rounded-[3rem] border-white/60 shadow-xl">
             <div className="flex justify-between items-center mb-10">
                <SectionHeader title="Revenue Performance" description="Monthly revenue vs AI-optimized boost" />
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-lavender" />
                      <span className="text-[9px] font-black uppercase text-foreground/40">Organic</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blush" />
                      <span className="text-[9px] font-black uppercase text-foreground/40">AI Boost</span>
                   </div>
                </div>
             </div>
             
             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={REVENUE_DATA}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBoost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD1DA" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#FFD1DA" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.3)'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.3)'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#A78BFA" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="aiBoost" stroke="#FFD1DA" strokeWidth={3} fillOpacity={1} fill="url(#colorBoost)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Customer Satisfaction Pie */}
          <div className="glass p-8 rounded-[3rem] border-white/60 shadow-xl flex flex-col">
             <SectionHeader title="Client Sentiment" description="Real-time satisfaction analysis" />
             <div className="flex-1 flex flex-col items-center justify-center">
                <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                           data={SATISFACTION_DATA}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={90}
                           paddingAngle={8}
                           dataKey="value"
                         >
                           {SATISFACTION_DATA.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full mt-6">
                   {SATISFACTION_DATA.map((s) => (
                     <div key={s.name} className="text-center">
                        <p className="text-[10px] font-black uppercase text-foreground/30 mb-1">{s.name}</p>
                        <p className="text-lg font-black" style={{ color: s.color }}>{s.value}%</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Branch Comparison */}
           <div className="glass p-8 rounded-[3rem] border-white/60 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                 <SectionHeader title="Top Branches" description="Revenue vs AI Compliance Score" />
                 <Filter className="w-4 h-4 text-foreground/20 cursor-pointer" />
              </div>
              <div className="space-y-6">
                 {BRANCH_DATA.map((branch, i) => (
                   <div key={branch.name} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                         <span className="text-xs font-black tracking-tight">{branch.name}</span>
                         <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">${branch.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(branch.revenue / 100000) * 100}%` }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                           className="h-full rounded-full" 
                           style={{ backgroundColor: branch.color }}
                         />
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: branch.color }} />
                         <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Compliance: {branch.score}%</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Staff Rankings */}
           <div className="glass p-8 rounded-[3rem] border-white/60 shadow-xl overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                 <SectionHeader title="Top Performers" description="Master stylists ranked by neural precision" />
                 <Award className="w-5 h-5 text-lavender" />
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="text-left border-b border-foreground/5">
                          <th className="pb-4 text-[9px] font-black uppercase text-foreground/30 tracking-[0.2em]">Stylist</th>
                          <th className="pb-4 text-[9px] font-black uppercase text-foreground/30 tracking-[0.2em]">Quality</th>
                          <th className="pb-4 text-[9px] font-black uppercase text-foreground/30 tracking-[0.2em]">Trend</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-foreground/5">
                       {STAFF_PERFORMANCE.map((staff, i) => (
                         <tr key={staff.name} className="group">
                            <td className="py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-peach/20 to-blush/20 flex items-center justify-center font-black text-xs text-foreground/40">
                                     {staff.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                     <p className="text-xs font-black tracking-tight">{staff.name}</p>
                                     <p className="text-[9px] font-bold text-foreground/30 uppercase">{staff.role}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="py-4">
                               <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-sage" />
                                  <span className="text-xs font-black text-sage">{staff.score}%</span>
                               </div>
                            </td>
                            <td className="py-4">
                               <div className={cn(
                                 "p-1.5 rounded-lg inline-flex items-center justify-center",
                                 staff.trend === 'up' ? "bg-sage/10 text-sage" : "bg-red-400/10 text-red-400"
                               )}>
                                  {staff.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Predictive AI Panel */}
        <div className="mt-12 bg-gradient-to-br from-lavender to-blush p-1.5 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
           <div className="bg-white/95 backdrop-blur-xl p-10 rounded-[3rem] relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-lavender flex items-center justify-center shadow-lg animate-pulse">
                       <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black tracking-tighter">Predictive Neural Insights</h3>
                       <p className="text-[10px] font-black text-lavender uppercase tracking-[0.2em]">Algorithm v8.4 • Active Forecasting</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-lavender/5 border border-lavender/10">
                       <p className="text-sm font-bold text-foreground/70 leading-relaxed italic">
                          "AI models predict a **24% increase** in demand for scalp-health treatments across European branches next quarter. Recommend increasing inventory for NeuroGlow Serum by 15%."
                       </p>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '84%' }}
                            transition={{ duration: 2, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-lavender to-blush" 
                          />
                       </div>
                       <span className="text-[9px] font-black text-foreground/30 uppercase">Probability: 84%</span>
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full lg:w-72">
                 <div className="p-6 rounded-3xl bg-white border border-foreground/5 shadow-sm text-center">
                    <p className="text-[9px] font-black text-foreground/30 uppercase mb-2">Churn Prediction</p>
                    <p className="text-2xl font-black text-red-400">-4.2%</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white border border-foreground/5 shadow-sm text-center">
                    <p className="text-[9px] font-black text-foreground/30 uppercase mb-2">Upsell Rate</p>
                    <p className="text-2xl font-black text-sage">+18.5%</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
