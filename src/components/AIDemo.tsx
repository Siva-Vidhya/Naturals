"use client";

import { motion } from "framer-motion";
import { Camera, Scan, Sliders, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function AIDemo() {
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (scanning) {
      const timer1 = setTimeout(() => setStep(1), 2000);
      const timer2 = setTimeout(() => setStep(2), 4000);
      const timer3 = setTimeout(() => {
        setStep(3);
        setScanning(false);
      }, 6000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [scanning]);

  const startDemo = () => {
    setScanning(true);
    setStep(0);
  };

  return (
    <section id="demo" className="py-24 overflow-hidden bg-cream/30">
      <div className="container px-6 mx-auto">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">
              Experience the <br /><span className="text-gradient">AI Stylist Assistant</span>
            </h2>
            <p className="mb-8 text-lg text-foreground/60 leading-relaxed">
              Our advanced computer vision analyzes facial structure, skin tone, and hair texture in milliseconds to provide hyper-personalized beauty recommendations.
            </p>
            
            <div className="space-y-6">
              {[
                { title: "Precision Face Mapping", desc: "68-point facial landmark detection." },
                { title: "Color Harmony Analysis", desc: "Matching hair color to skin undertones." },
                { title: "Virtual Consultation", desc: "Instant visual style projections." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-1 rounded-full bg-sage/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  </div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm text-foreground/50">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={startDemo}
              disabled={scanning}
              className="mt-10 flex items-center gap-2 px-8 py-4 text-lg font-bold text-white transition-all rounded-full bg-gradient-to-r from-lavender to-blush hover:scale-105 shadow-xl shadow-lavender/20 disabled:opacity-50"
            >
              <Camera className="w-5 h-5" /> {scanning ? "Analyzing..." : "Start Virtual Scan"}
            </button>
          </motion.div>

          <div className="relative">
            {/* Mock Face Scan UI */}
            <div className="relative aspect-[4/5] max-w-md mx-auto overflow-hidden glass rounded-[3rem] border-white/60 shadow-2xl">
              {/* "Camera" view - placeholder image or just a styled background */}
              <div className="absolute inset-0 bg-gradient-to-br from-peach/10 to-lavender/10 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <motion.div 
                    animate={scanning ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-48 h-48 rounded-full border-2 border-dashed border-lavender/50 flex items-center justify-center"
                  >
                    <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-blush/20 to-lavender/20 blur-xl" />
                  </motion.div>
                  <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">
                    Place face within circle
                  </p>
                </div>
              </div>

              {/* Scan Overlay */}
              {scanning && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 2, repeat: 3, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lavender to-transparent z-10 shadow-[0_0_20px_rgba(220,204,245,1)]"
                />
              )}

              {/* Analysis Steps */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between">
                  <div className="glass-dark px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> REC 00:12:45
                  </div>
                  <div className="glass-dark p-2 rounded-xl">
                    <Scan className="w-5 h-5 text-white/70" />
                  </div>
                </div>

                <div className="space-y-4">
                  {step >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-dark p-4 rounded-2xl border-white/20"
                    >
                      <div className="text-[10px] font-bold text-lavender mb-1 uppercase">Facial Landmarks</div>
                      <div className="grid grid-cols-4 gap-2">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1 }}
                              className="h-full bg-lavender" 
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-dark p-4 rounded-2xl border-white/20"
                    >
                      <div className="text-[10px] font-bold text-sage mb-1 uppercase">Skin Analysis</div>
                      <div className="flex gap-4 items-center">
                        <div className="text-xl font-bold text-white">98% <span className="text-[10px] font-normal text-white/50">Luminescence</span></div>
                        <div className="flex-1 h-2 bg-white/10 rounded-full">
                          <div className="w-3/4 h-full bg-sage rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass p-6 rounded-3xl border-white shadow-2xl"
                    >
                      <div className="text-center">
                        <div className="text-xs font-bold text-blush mb-2 uppercase">Recommended Look</div>
                        <div className="text-xl font-bold mb-4">Pastel Lavender Balayage</div>
                        <div className="flex gap-2 justify-center">
                          <button className="px-4 py-2 text-[10px] font-bold text-white bg-lavender rounded-full">Book This Style</button>
                          <button className="px-4 py-2 text-[10px] font-bold border border-lavender/30 rounded-full">Try Virtual</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Floating Element */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-8 top-1/4 glass p-4 rounded-2xl shadow-xl border-white/80 hidden xl:block"
            >
              <Sliders className="w-6 h-6 text-lavender mb-2" />
              <div className="text-[10px] font-bold opacity-40">ADJUSTMENT</div>
              <div className="w-24 h-1.5 bg-lavender/20 rounded-full mt-1" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
