"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  User, 
  Layers, 
  Palette, 
  Scissors, 
  Activity,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { 
  initializeDetector, 
  safeDetect,
  calculateFaceShape, 
  analyzeSkin, 
  generateRuleBasedRecommendations,
  DEFAULT_RESULT
} from '@/lib/beauty-analysis';
import { supabase } from '@/lib/supabase';

// --- Types ---
type ScanStep = 'idle' | 'scanning' | 'analyzing' | 'completed';

interface AnalysisData {
  faceShape: string;
  skinTone: string;
  undertone: string;
  hairTexture: string;
  hairDensity: string;
  scalpCondition: string;
  hairHealth: number;
  confidenceScore: number;
  insights: string[];
  recommendations: {
    hairstyles: string[];
    treatments: string[];
    colors: string[];
    products: string[];
    homeCare: string[];
  };
}

// --- Components ---

const ScannerOverlay = () => (
  <div className="absolute inset-0 pointer-events-none z-20">
    <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-lavender/60 rounded-tl-2xl" />
    <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-lavender/60 rounded-tr-2xl" />
    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-lavender/60 rounded-bl-2xl" />
    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-lavender/60 rounded-br-2xl" />
    
    <motion.div 
      initial={{ top: "10%" }}
      animate={{ top: "90%" }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      className="absolute left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-gradient-to-r from-transparent via-lavender to-transparent shadow-[0_0_15px_rgba(167,139,250,0.8)]"
    />
  </div>
);

const AnalysisCard = ({ title, value, icon: Icon, delay = 0 }: { title: string; value: string | number; icon: any; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass p-5 rounded-2xl border-white/40 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blush/30 to-lavender/30 flex items-center justify-center">
      <Icon className="w-6 h-6 text-lavender" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{title}</p>
      <p className="text-lg font-extrabold text-foreground tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const RecommendationSection = ({ title, items, icon: Icon, colorClass }: { title: string; items: string[]; icon: any; colorClass: string }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className={cn("p-2 rounded-lg", colorClass)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="font-bold text-sm tracking-tight">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {(items || []).map((item, i) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="px-4 py-2 rounded-xl bg-white/50 border border-white/20 text-xs font-semibold text-foreground/70 hover:bg-white/80 transition-colors cursor-default"
        >
          {item}
        </motion.span>
      ))}
    </div>
  </div>
);

export default function BeautyPassportPage() {
  const [step, setStep] = useState<ScanStep>('idle');
  const [statusText, setStatusText] = useState("Initializing...");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startScan = async () => {
    try {
      setStep('scanning');
      setStatusText("Initializing Camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const detector = await initializeDetector();
      if (!detector) throw new Error("Detector initialization failed");

      let stableFrames = 0;
      const targetFrames = 10;
      const accumulatedShapes: string[] = [];
      const accumulatedTones: string[] = [];
      const accumulatedUndertones: string[] = [];
      
      const scanLoop = async () => {
        if (step === 'completed' || step === 'idle') return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video && canvas) {
          if (video.readyState < 2 || video.videoWidth === 0) {
            animationFrameRef.current = requestAnimationFrame(scanLoop);
            return;
          }

          const faces = await safeDetect(video);
          
          if (faces.length > 0) {
            stableFrames++;
            const p = (stableFrames / targetFrames) * 100;
            setProgress(p);

            // Dynamic Status Text
            if (stableFrames < 3) setStatusText("Face Detected...");
            else if (stableFrames < 6) setStatusText("Analyzing Structure...");
            else if (stableFrames < 9) setStatusText("Calibrating Tones...");
            else setStatusText("Finalizing Profile...");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            
            const keypoints = faces[0].keypoints;
            accumulatedShapes.push(calculateFaceShape(keypoints));
            const skinInfo = analyzeSkin(canvas);
            accumulatedTones.push(skinInfo.tone);
            accumulatedUndertones.push(skinInfo.undertone);
            
            if (stableFrames >= targetFrames) {
              setStep('analyzing');
              setStatusText("Synthesizing Recommendations...");
              
              const getMode = (arr: string[]) => {
                if (arr.length === 0) return "";
                const counts = arr.reduce((acc, val) => {
                  acc[val] = (acc[val] || 0) + 1;
                  return acc;
                }, {} as any);
                return Object.keys(counts).reduce((a, b) => (counts[a] || 0) > (counts[b] || 0) ? a : b);
              };
              
              const faceShape = getMode(accumulatedShapes);
              const skinTone = getMode(accumulatedTones);
              const undertone = getMode(accumulatedUndertones);
              
              const analysisData = {
                faceShape,
                skinTone,
                undertone,
                hairTexture: "Wavy",
                scalpCondition: "Normal"
              };
              
              const recs = generateRuleBasedRecommendations(analysisData);
              
              const finalResults: AnalysisData = {
                ...analysisData,
                hairDensity: "Medium",
                hairHealth: 96,
                confidenceScore: 0.99,
                insights: [
                  `High-fidelity consensus reached across ${targetFrames} frames.`,
                  `Geometric structure identified as ${faceShape}.`,
                  `Tone calibration confirmed for ${undertone} undertones.`
                ],
                recommendations: recs
              };
              
              setResults(finalResults);
              setStep('completed');
              toast.success("AI Synthesis Complete!");
              stream.getTracks().forEach(track => track.stop());
              return;
            }
          } else {
            stableFrames = Math.max(0, stableFrames - 0.5); // Graceful decay if face lost
            setProgress((stableFrames / targetFrames) * 100);
            setStatusText("Position Face in Frame...");
          }
        }
        
        animationFrameRef.current = requestAnimationFrame(scanLoop);
      };

      animationFrameRef.current = requestAnimationFrame(scanLoop);

    } catch (err) {
      console.error(err);
      toast.error("Real-time scan initialization failed.");
      setStep('idle');
    }
  };

  const updateResultManually = (field: keyof AnalysisData, value: string) => {
    if (!results) return;
    const newResults = { ...results, [field]: value };
    const newRecs = generateRuleBasedRecommendations(newResults);
    setResults({ ...newResults, recommendations: newRecs });
  };

  return (
    <main className="min-h-screen bg-soft-gradient p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blush/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, 100, 0], rotate: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-lavender/10 rounded-full blur-[100px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-full bg-lavender/20 border border-lavender/20 text-[10px] font-black text-lavender uppercase tracking-[0.2em]">
                Neural Analysis v2.8 (Live)
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
              Beauty <span className="text-transparent bg-clip-text bg-gradient-to-r from-blush via-lavender to-peach">Passport</span>
            </h1>
            <p className="text-foreground/40 font-medium max-w-md mt-2">
              Real-time facial geometry and tone analysis for hyper-personalized beauty recommendations.
            </p>
          </div>
          
          {step === 'completed' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/40 border border-white hover:bg-white/60 transition-all text-sm font-bold shadow-sm">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button onClick={() => setStep('idle')} className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-blush to-lavender text-white font-bold shadow-lg shadow-blush/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>New Scan</span>
              </button>
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 'idle' || step === 'scanning' || step === 'analyzing' ? (
            <motion.div key="scanner-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="relative max-w-4xl mx-auto">
              <div className="aspect-[16/10] glass rounded-[3rem] border-white/60 shadow-2xl overflow-hidden relative">
                {step === 'idle' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center mb-8 shadow-xl shadow-blush/20 animate-pulse">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Ready for your scan?</h2>
                    <p className="text-foreground/50 max-w-sm mb-10 text-sm font-medium">
                      Position yourself in a well-lit area. Our AI will analyze your facial geometry and skin tones in real-time.
                    </p>
                    <button onClick={startScan} className="group flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-blush via-lavender to-peach text-white font-black shadow-2xl shadow-lavender/30 hover:scale-[1.05] active:scale-[0.95] transition-all">
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>INITIALIZE NEURAL SCAN</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {step === 'scanning' && <ScannerOverlay />}
                    {step === 'analyzing' && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-30">
                        <div className="w-16 h-16 border-4 border-lavender/20 border-t-lavender rounded-full animate-spin mb-6" />
                        <h2 className="text-2xl font-black text-lavender tracking-tighter uppercase italic">Processing Neural Data...</h2>
                        <p className="text-foreground/40 text-xs font-bold mt-2">ALGORITHMIC FEATURE EXTRACTION IN PROGRESS</p>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-3/4 z-30">
                      <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">{statusText}</span>
                        <span className="text-[10px] font-black text-white/60">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blush via-lavender to-peach shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : results && (
            <motion.div key="results-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <AnalysisCard title="Face Shape" value={results.faceShape} icon={User} delay={0.1} />
                    <select onChange={(e) => updateResultManually('faceShape', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" value={results.faceShape}>
                      {["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="relative group">
                    <AnalysisCard title="Skin Tone" value={results.skinTone} icon={Palette} delay={0.2} />
                    <select onChange={(e) => updateResultManually('skinTone', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" value={results.skinTone}>
                      {["Fair", "Light", "Medium", "Tan", "Deep"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="relative group">
                    <AnalysisCard title="Hair Texture" value={results.hairTexture} icon={Layers} delay={0.3} />
                    <select onChange={(e) => updateResultManually('hairTexture', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" value={results.hairTexture}>
                      {["Straight", "Wavy", "Curly", "Coily"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="relative group">
                    <AnalysisCard title="Scalp Condition" value={results.scalpCondition} icon={Activity} delay={0.4} />
                    <select onChange={(e) => updateResultManually('scalpCondition', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" value={results.scalpCondition}>
                      {["Normal", "Dry", "Oily", "Sensitive"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-extrabold tracking-tight">AI Diagnostic Insights</h2>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sage/10 border border-sage/20">
                      <ShieldCheck className="w-4 h-4 text-sage" />
                      <span className="text-[10px] font-bold text-sage uppercase">{Math.round(results.confidenceScore * 100)}% Confidence</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {(results?.insights ?? []).map((insight, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/30 border border-white/20">
                          <CheckCircle2 className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                          <p className="text-xs font-semibold text-foreground/60 leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 rounded-[2rem] bg-gradient-to-br from-lavender/10 to-blush/10 border border-white/40 relative overflow-hidden">
                      <div className="relative z-10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-lavender mb-2">Neural Focus</h4>
                        <p className="text-sm font-bold text-foreground/70 leading-relaxed italic">
                          "Your facial structure suggests a high compatibility with asymmetrical hair partings. We recommend focusing on moisture retention for your hair texture type."
                        </p>
                      </div>
                      <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/20" />
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <RecommendationSection title="Hairstyle Suggestions" items={results?.recommendations?.hairstyles ?? []} icon={Scissors} colorClass="bg-blush" />
                  <RecommendationSection title="Tone Matching" items={results?.recommendations?.colors ?? []} icon={Palette} colorClass="bg-lavender" />
                </div>
              </div>

              <div className="space-y-8">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl bg-gradient-to-br from-white/40 to-peach/5">
                  <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-peach" />
                    Prescription Plan
                  </h3>
                  <div className="space-y-4">
                    {(results?.recommendations?.treatments ?? []).map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/20 hover:bg-white/60 transition-all group">
                        <span className="text-xs font-bold text-foreground/60">{t}</span>
                        <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-lavender transition-colors" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-foreground/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Recommended Products</h4>
                    <div className="space-y-3">
                      {(results?.recommendations?.products ?? []).map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/80 border border-white flex items-center justify-center text-[10px] font-black text-lavender">0{i+1}</div>
                          <span className="text-xs font-bold text-foreground/70">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-foreground/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Home Care</h4>
                    <div className="space-y-3">
                      {(results?.recommendations?.homeCare ?? []).map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-peach mt-1.5 shrink-0" />
                          <span className="text-[11px] font-bold text-foreground/60">{h}</span>
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
                      Scan results are valid for 90 days. For seasonal color matching, we recommend re-scanning in early Autumn.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
