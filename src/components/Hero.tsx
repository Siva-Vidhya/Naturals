"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-soft-gradient">
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-blush/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-20 w-96 h-96 bg-lavender/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-sage/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="container px-6 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium border glass rounded-full text-foreground/70"
        >
          <Sparkles className="w-4 h-4 text-lavender" />
          The Future of Salon Intelligence is Here
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-6 text-5xl font-extrabold tracking-tight md:text-7xl lg:text-8xl"
        >
          AI-Powered <span className="text-gradient">Salon Intelligence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-foreground/60"
        >
          Elevate your beauty business with NeuroStrom. The world&apos;s first luxury beauty-tech OS designed to automate operations, track emotions, and scale your brand.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button className="flex items-center gap-2 px-8 py-4 text-lg font-bold text-white transition-all rounded-full bg-gradient-to-r from-blush to-lavender hover:scale-105 shadow-xl shadow-blush/20">
            Book Demo <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 text-lg font-bold transition-all border glass rounded-full hover:bg-white/50">
            Explore AI
          </button>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="relative max-w-5xl mx-auto mt-20 group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blush/20 via-lavender/20 to-sage/20 rounded-3xl blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="overflow-hidden glass rounded-3xl shadow-2xl border-white/50">
            <div className="flex items-center gap-2 px-6 py-3 border-b bg-white/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                <div className="w-3 h-3 rounded-full bg-green-400/50" />
              </div>
              <div className="w-full mx-10 h-6 rounded-full bg-white/50 flex items-center px-3 text-[10px] text-foreground/30">
                neurostrom.app/dashboard/analytics
              </div>
            </div>
            <div className="grid grid-cols-12 p-8 gap-6 bg-white/20 h-[500px]">
              <div className="col-span-3 space-y-4">
                <div className="h-32 p-4 glass-dark rounded-2xl animate-pulse" />
                <div className="h-48 p-4 glass-dark rounded-2xl flex flex-col gap-3">
                  <div className="w-full h-3 rounded-full bg-lavender/40" />
                  <div className="w-2/3 h-3 rounded-full bg-lavender/40" />
                  <div className="w-full h-3 rounded-full bg-lavender/40" />
                </div>
              </div>
              <div className="col-span-6">
                <div className="h-full p-6 glass-dark rounded-3xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-foreground/40 uppercase">Revenue Growth</div>
                      <div className="text-2xl font-bold">+24.8%</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-sage" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-40 flex items-end gap-2 px-6 pb-6">
                    {[40, 60, 45, 80, 55, 90, 70, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: 1 + i * 0.1 }}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-blush to-lavender/60 opacity-60"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-3 space-y-4">
                <div className="h-full p-4 glass-dark rounded-2xl flex flex-col gap-4">
                  <div className="text-xs font-bold text-foreground/40">CUSTOMER EMOTIONS</div>
                  {[
                    { label: "Relaxed", val: 85, color: "bg-sage" },
                    { label: "Excited", val: 62, color: "bg-peach" },
                    { label: "Satisfied", val: 94, color: "bg-blush" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.val}%` }}
                          transition={{ duration: 1, delay: 1.5 + i * 0.2 }}
                          className={cn("h-full rounded-full", item.color)}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-auto p-4 rounded-xl bg-white/40 border border-white/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-blush fill-blush" />
                      <span className="text-[10px] font-bold">AI TIP</span>
                    </div>
                    <p className="text-[10px] text-foreground/60 leading-tight">
                      Stylist Assistant suggests adding Lavender Aroma for Room 3.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
