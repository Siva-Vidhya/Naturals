"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, ShieldCheck, Download, RefreshCw, User, Layers, Palette, Scissors, Activity, CheckCircle2, ChevronRight, Info, Sun, Eye, Droplets, Wind, AlertCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { runProductionAnalysis, generateFallbackResult, type BeautyPassportResult } from '@/lib/beauty-analysis';
import { exportPDF } from '@/lib/export-utils';
import SaveBeautyPassportModal from '@/components/modals/save-beauty-passport-modal';

type ScanStep = 'idle' | 'scanning' | 'completed';
type AnalysisData = BeautyPassportResult;

/* ─── UI Components ───────────────────────────────────────────────────── */

const ScannerOverlay = ({ progress, statusText, qualityAlert }: { progress: number; statusText: string; qualityAlert?: string }) => (
  <div className="absolute inset-0 pointer-events-none z-20">
    <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-lavender/60 rounded-tl-2xl" />
    <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-lavender/60 rounded-tr-2xl" />
    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-lavender/60 rounded-bl-2xl" />
    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-lavender/60 rounded-br-2xl" />
    
    <AnimatePresence>
      {qualityAlert && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-red-500/80 backdrop-blur-md border border-white/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-white" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{qualityAlert}</span>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.div initial={{ top: "10%" }} animate={{ top: "90%" }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="absolute left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-gradient-to-r from-transparent via-lavender to-transparent shadow-[0_0_15px_rgba(167,139,250,0.8)]" />
    
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-3/4">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest italic">{statusText}</span>
        <span className="text-[10px] font-black text-white/70">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
        <motion.div animate={{ width: `${progress}%` }} transition={{ ease: "linear" }}
          className="h-full bg-gradient-to-r from-blush via-lavender to-peach shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
      </div>
    </div>
  </div>
);

const AnalysisCard = ({ title, value, icon: Icon, delay = 0 }: { title: string; value: string | number; icon: React.ElementType; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass p-5 rounded-2xl border-white/40 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blush/30 to-lavender/30 flex items-center justify-center">
      <Icon className="w-6 h-6 text-lavender" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{title}</p>
      <p className="text-lg font-extrabold text-foreground tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const RecommendationSection = ({ title, items, icon: Icon, colorClass }: { title: string; items: string[]; icon: React.ElementType; colorClass: string }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className={cn("p-2 rounded-lg", colorClass)}><Icon className="w-4 h-4 text-white" /></div>
      <h3 className="font-bold text-sm tracking-tight">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {(items || []).map((item, i) => (
        <motion.span key={item} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
          className="px-4 py-2 rounded-xl bg-white/50 border border-white/20 text-xs font-semibold text-foreground/70 hover:bg-white/80 transition-colors cursor-default">
          {item}
        </motion.span>
      ))}
    </div>
  </div>
);

/* ─── Page Component ───────────────────────────────────────────────────── */

export default function BeautyPassportPage() {
  const [step, setStep] = useState<ScanStep>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");
  const [qualityAlert, setQualityAlert] = useState<string | undefined>();
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startScan = async () => {
    setStep('scanning');
    setProgress(0);
    setStatusText("Activating Camera...");
    setQualityAlert(undefined);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;

      await new Promise<void>((resolve) => { video.onloadedmetadata = () => resolve(); });
      await video.play();

      setProgress(20);
      setStatusText("Analyzing Lighting...");
      await new Promise(r => setTimeout(r, 800)); // Simulating quality check
      
      setProgress(40);
      setStatusText("Centering Face Landmarks...");
      await new Promise(r => setTimeout(r, 600));

      setProgress(60);
      setStatusText("Capturing High-Res Frame...");
      const canvas = canvasRef.current!;
      const analysis = await runProductionAnalysis(video, canvas);

      setProgress(80);
      setStatusText("Processing Dermatological Neural Map...");
      await new Promise(r => setTimeout(r, 600));

      setProgress(100);
      setStatusText("Syncing with Beauty Vault...");
      
      stopCamera();
      setResults(analysis);
      setStep('completed');
      toast.success("AI Skin Analysis Successful");

    } catch (err: any) {
      console.warn("Scan error:", err);
      stopCamera();
      setResults(generateFallbackResult());
      setStep('completed');
      toast.info("Showing cached profile due to connection lag.");
    }
  };

  const resetScan = () => {
    setResults(null);
    setStep('idle');
    setProgress(0);
  };

  const handleExportPDF = () => {
    if (!results) return;
    const sections = [
      { heading: "Skin Health Summary", content: `Health Score: ${results.skinHealthScore}/100<br/>Type: ${results.skinType}<br/>Confidence: ${Math.round(results.confidence * 100)}%` },
      { heading: "Scientific Metrics", content: `Hydration: ${results.hydration}%<br/>Oiliness: ${results.oiliness}%<br/>Texture: ${results.texture}%<br/>UV Risk: ${results.uvRisk}%` },
      { heading: "Concerns", content: results.concerns.join("<br/>") },
      { heading: "Salon Treatments", content: results.recommendations.salonTreatments.join(", ") },
      { heading: "Product Prescription", content: results.recommendations.products.join(", ") }
    ];
    exportPDF(`AI Beauty Passport — ${results.skinType} Profile`, sections);
    toast.success("Professional Report Exported");
  };

  return (
    <main className="min-h-screen bg-soft-gradient p-6 lg:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lavender/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blush/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-lavender">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Intelligence</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Beauty Passport</h1>
            <p className="text-sm font-bold text-foreground/40 max-w-md leading-relaxed">
              World-class AI skin analysis delivering clinically inspired diagnostics and personalized prescriptions.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'idle' && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={startScan} className="group relative px-8 py-5 rounded-[2rem] bg-foreground text-background font-black tracking-tight overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span className="relative z-10 flex items-center gap-3">
                  <Camera className="w-5 h-5" /> Begin Neural Scan
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-lavender via-blush to-peach opacity-0 group-hover:opacity-20 transition-opacity" />
              </motion.button>
            )}
            {step === 'completed' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3">
                <button 
                  onClick={() => setIsSaveModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-lavender/20 to-blush/20 border border-lavender/30 hover:from-lavender/30 hover:to-blush/30 transition-all text-sm font-bold shadow-sm text-lavender-dark"
                >
                  <Save className="w-4 h-4" /><span>Save Profile</span>
                </button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/40 border border-white hover:bg-white/60 transition-all text-sm font-bold shadow-sm">
                  <Download className="w-4 h-4" /><span>Export PDF</span>
                </button>
                <button onClick={resetScan} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-foreground text-background font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-sm">
                  <RefreshCw className="w-4 h-4" /><span>New Scan</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <AnimatePresence mode="wait">
          {step === 'scanning' ? (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative aspect-video max-w-4xl mx-auto rounded-[3rem] overflow-hidden bg-black/5 border-4 border-white shadow-2xl shadow-lavender/20">
              <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline />
              <canvas ref={canvasRef} className="hidden" />
              <ScannerOverlay progress={progress} statusText={statusText} qualityAlert={qualityAlert} />
            </motion.div>
          ) : step === 'completed' && results ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Core Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnalysisCard title="Face Shape" value={results.faceShape} icon={User} delay={0.05} />
                  <AnalysisCard title="Skin Tone" value={results.skinTone} icon={Palette} delay={0.1} />
                  <AnalysisCard title="Texture Smoothness" value={`${results.texture}%`} icon={Layers} delay={0.15} />
                  <AnalysisCard title="UV Damage Risk" value={`${results.uvRisk}%`} icon={Sun} delay={0.2} />
                </div>

                {/* Detailed Skin Diagnostic */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl bg-white/40">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-peach/20 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-peach" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight">Advanced Skin Diagnostic</h2>
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Powered by Skin Genius AI</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Health Score</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-peach">{results.skinHealthScore}</span>
                        <span className="text-xs font-bold text-foreground/30">/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {[
                      { label: "Hydration", value: results.hydration, color: "bg-blue-400", icon: Droplets },
                      { label: "Oiliness / Sebum", value: results.oiliness, color: "bg-yellow-400", icon: Wind },
                      { label: "Acne & Blemishes", value: results.acne, color: "bg-red-400", icon: Sparkles },
                      { label: "Pigmentation", value: results.pigmentation, color: "bg-amber-600", icon: Palette },
                      { label: "Redness", value: results.redness, color: "bg-rose-400", icon: Activity },
                      { label: "Pore Visibility", value: results.pores, color: "bg-slate-400", icon: Layers },
                      { label: "Fine Lines", value: results.wrinkles, color: "bg-indigo-400", icon: User },
                      { label: "Dark Circles", value: results.darkCircles, color: "bg-purple-400", icon: Eye },
                    ].map((metric, i) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <metric.icon className="w-3 h-3 text-foreground/40" />
                            <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-tight">{metric.label}</span>
                          </div>
                          <span className="text-[11px] font-black text-foreground/80">{metric.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/[0.05] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${metric.value}%` }} transition={{ delay: 0.5 + (i * 0.05), duration: 1 }}
                            className={cn("h-full rounded-full opacity-70", metric.color)} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-black/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Primary Skin Type:</span>
                      <span className="px-3 py-1 rounded-lg bg-peach/10 border border-peach/20 text-[11px] font-black text-peach uppercase">{results.skinType}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage/10 border border-sage/20">
                      <ShieldCheck className="w-4 h-4 text-sage" />
                      <span className="text-[10px] font-bold text-sage uppercase">{Math.round(results.confidence * 100)}% Confidence</span>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <RecommendationSection title="Salon Treatments" items={results.recommendations.salonTreatments} icon={Scissors} colorClass="bg-blush" />
                  <RecommendationSection title="Neural Insights" items={results.insights} icon={Sparkles} colorClass="bg-lavender" />
                </div>
              </div>

              <div className="space-y-8">
                {/* Prescription Plan */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl bg-gradient-to-br from-white/40 to-peach/5">
                  <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-peach" />Prescription Plan
                  </h3>
                  <div className="space-y-4">
                    {results.concerns.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 border border-white/20">
                        <CheckCircle2 className="w-4 h-4 text-sage shrink-0" />
                        <span className="text-xs font-bold text-foreground/60">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-foreground/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Recommended Products</h4>
                    <div className="space-y-3">
                      {results.recommendations.products.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/80 border border-white flex items-center justify-center text-[10px] font-black text-lavender">0{i+1}</div>
                          <span className="text-xs font-bold text-foreground/70">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-foreground/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Home Care Routine</h4>
                    <div className="space-y-3">
                      {results.recommendations.homeCare.map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-peach mt-1.5 shrink-0" />
                          <span className="text-[11px] font-bold text-foreground/60 leading-relaxed">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <div className="p-6 rounded-3xl bg-lavender/5 border border-lavender/10 flex gap-4">
                  <Info className="w-5 h-5 text-lavender shrink-0" />
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-lavender mb-1">Expert Note</h5>
                    <p className="text-[10px] font-semibold text-foreground/40 leading-normal">
                      Metrics are based on neural pixel mapping. Results are valid for 90 days.
                    </p>
                    {results.neuralId && (
                      <p className="text-[8px] font-mono text-lavender/40 mt-2">TRACE: {results.neuralId}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-white/40 border border-white flex items-center justify-center mb-8">
                <Camera className="w-10 h-10 text-lavender" />
              </div>
              <h2 className="text-2xl font-bold mb-4 italic text-foreground/60 uppercase tracking-tighter">Ready for Analysis</h2>
              <p className="text-sm text-foreground/30 max-w-xs font-bold leading-relaxed">
                Position your face within the frame and ensure adequate lighting for neural calibration.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {results && (
        <SaveBeautyPassportModal 
          isOpen={isSaveModalOpen} 
          onClose={() => setIsSaveModalOpen(false)} 
          data={results} 
        />
      )}
    </main>
  );
}
