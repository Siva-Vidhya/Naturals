"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, MapPin, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Bookings", value: "2,840", change: "+12.5%", icon: Users, color: "text-blush" },
  { label: "Avg. Satisfaction", value: "98.2%", change: "+2.1%", icon: Activity, color: "text-sage" },
  { label: "Revenue", value: "$45,200", change: "+8.4%", icon: TrendingUp, color: "text-lavender" },
];

const branches = [
  { name: "Downtown Luxury", score: 94, status: "Active", revenue: "$12.4k" },
  { name: "Uptown Zen", score: 88, status: "Busy", revenue: "$9.8k" },
  { name: "Westside Glow", score: 91, status: "Active", revenue: "$10.2k" },
];

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="py-24 bg-white">
      <div className="container px-6 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Command Your <span className="text-gradient">Empire</span>
          </motion.h2>
          <p className="text-lg text-foreground/60">
            NeuroStrom gives you a unified dashboard to manage every branch, stylist, and customer touchpoint with AI-enhanced clarity.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 glass rounded-[2.5rem] p-10 border-white/50 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold">Branch Performance</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-xs font-bold glass rounded-full hover:bg-white/50 transition-colors">Weekly</button>
                <button className="px-4 py-2 text-xs font-bold bg-lavender text-white rounded-full">Monthly</button>
              </div>
            </div>

            <div className="grid gap-6">
              {branches.map((branch, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-cream/20 border border-white/40 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-lavender/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-lavender" />
                    </div>
                    <div>
                      <div className="font-bold">{branch.name}</div>
                      <div className="text-xs text-foreground/40">{branch.status} • {branch.revenue}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-foreground/30 mb-1">QUALITY SCORE</div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-white/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${branch.score}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className="h-full bg-sage"
                        />
                      </div>
                      <span className="text-sm font-bold">{branch.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats & Insights */}
          <div className="space-y-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-3xl border-white/50 shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-2xl bg-white/50 shadow-sm", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-sage bg-sage/10 px-2 py-1 rounded-md">{stat.change}</div>
                </div>
                <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-foreground/40">{stat.label}</div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blush/80 to-lavender/80 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group"
            >
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">AI Recommendation</h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  &quot;Increase booking slots for Saturday morning at Westside Glow. Sentiment analysis predicts 15% higher demand.&quot;
                </p>
                <button className="mt-4 px-6 py-2 bg-white text-lavender text-xs font-bold rounded-full hover:bg-opacity-90 transition-all">
                  Apply Insight
                </button>
              </div>
              <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
