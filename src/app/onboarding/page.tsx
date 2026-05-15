"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Camera, 
  Users, 
  Zap, 
  Check, 
  Scissors, 
  Heart,
  Upload,
  Brain,
  MapPin,
  Phone as PhoneIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- Validation Schema ---
const salonSchema = z.object({
  salonName: z.string().min(2, "Salon name is required"),
  salonType: z.string().min(1, "Please select a salon type"),
  branchCount: z.string().min(1, "Branch count is required"),
  location: z.string().min(2, "Location is required"),
  phone: z.string().min(10, "Valid phone number required"),
});

type SalonFormValues = z.infer<typeof salonSchema>;

const steps = [
  { id: 1, title: "Welcome", icon: Heart },
  { id: 2, title: "Salon Setup", icon: Scissors },
  { id: 3, title: "Branding", icon: Camera },
  { id: 4, title: "Team", icon: Users },
  { id: 5, title: "AI Setup", icon: Brain },
  { id: 6, title: "Ready", icon: Sparkles },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const { user, loading: authLoading, checkOnboardingStatus } = useAuth();
  const router = useRouter();

  // Redirect if not logged in - relying on middleware but keeping as a safety check
  useEffect(() => {
    if (!authLoading && !user) {
      // Small delay to ensure we're truly not authenticated
      const timeout = setTimeout(() => {
        if (!user) router.push("/auth/login");
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [user, authLoading, router]);

  // --- Step 2: Salon Form ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid: isSalonValid },
  } = useForm<SalonFormValues>({
    resolver: zodResolver(salonSchema),
    mode: "onChange",
    defaultValues: {
      salonType: "",
      branchCount: "1",
    }
  });

  const selectedSalonType = watch("salonType");

  // --- Step 4: Staff State ---
  const [staff, setStaff] = useState([{ name: "", role: "", specialty: "" }]);

  // --- Step 5: AI State ---
  const [aiPersonality, setAiPersonality] = useState("Calm & Elegant");
  const [aiEnabled, setAiEnabled] = useState(true);

  // --- Navigation Helpers ---
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // --- Action Handlers ---

  const handleBeginSetup = async () => {
    if (!user) {
      toast.error("Session not found. Please log in again.");
      return;
    }
    
    setIsSaving(true);
    try {
      // Ensure profile exists
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        email: user.email,
        updated_at: new Date(),
      });
      
      if (error) {
        console.error("Profile save error:", error);
        toast.error("Unable to initialize setup. Please try again.");
        setIsSaving(false);
        return;
      }
      nextStep();
    } catch (error) {
      console.error("Profile save error:", error);
      toast.error("Unable to initialize setup. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSalon = async (data: SalonFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { data: salon, error } = await supabase.from('salons').upsert({
        owner_id: user.id,
        salon_name: data.salonName,
        salon_type: data.salonType,
        branch_count: data.branchCount,
        location: data.location,
        phone: data.phone,
      }, { onConflict: 'owner_id' }).select().single();

      if (error) {
        console.error("Salon save error:", error);
        toast.error("Failed to save salon details.");
        setIsSaving(false);
        return;
      }
      if (salon) localStorage.setItem('current_salon_id', salon.id);
      nextStep();
    } catch (err) {
      toast.error("Failed to save salon details.");
    } finally {
      setIsSaving(false);
    }
  };

  const [brandingAnalyzed, setBrandingAnalyzed] = useState(false);
  const handleBranding = () => {
    setIsSaving(true);
    // Simulate aesthetic analysis
    setTimeout(() => {
      setBrandingAnalyzed(true);
      setIsSaving(false);
      nextStep();
    }, 1500);
  };

  const handleSaveStaff = async () => {
    let salonId = localStorage.getItem('current_salon_id');
    
    // If not in localStorage, try to fetch it from DB
    if (!salonId && user) {
      try {
        const { data: salon } = await supabase
          .from('salons')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();
        if (salon) {
          salonId = salon.id;
          localStorage.setItem('current_salon_id', salon.id);
        }
      } catch (e) {
        console.warn("Failed to fetch salon ID:", e);
      }
    }

    setIsSaving(true);
    try {
      if (salonId) {
        const staffToInsert = staff
          .filter(s => s.name.trim() !== "")
          .map(s => ({
            salon_id: salonId,
            staff_name: s.name,
            role: s.role || "Stylist",
            specialty: s.specialty || "General",
          }));

        if (staffToInsert.length > 0) {
          // First clear old staff to avoid duplicates on "Back" and "Next"
          await supabase.from('staff').delete().eq('salon_id', salonId);
          const { error } = await supabase.from('staff').insert(staffToInsert);
          if (error) {
            console.error("Staff save error:", error);
            toast.error("Failed to save team members.");
            setIsSaving(false);
            return;
          }
        }
      }
      nextStep();
    } catch (err) {
      toast.error("Failed to save team members.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateAI = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('onboarding_preferences').upsert({
        user_id: user.id,
        ai_enabled: aiEnabled,
        ai_personality: aiPersonality,
        notifications_enabled: true,
      }, { onConflict: 'user_id' });
      
      if (error) {
        console.error("Onboarding preferences error:", error);
        toast.error("Failed to finalize onboarding. Please try again.");
        setIsSaving(false);
        return;
      }
      
      // Update global auth state
      await checkOnboardingStatus();
      
      triggerConfetti();
      nextStep();
    } catch (err) {
      toast.error("Failed to configure AI preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F7D6E0", "#DCCCF5", "#FFD8BE", "#CFE8D5"],
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-soft-gradient flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-lavender" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-soft-gradient flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Progress Indicator */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 glass px-6 py-3 rounded-full shadow-lg border-white/50 z-50">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              animate={{
                scale: currentStep === step.id ? 1.2 : 1,
                backgroundColor: currentStep >= step.id ? "#DCCCF5" : "rgba(255,255,255,0.3)",
              }}
              className={cn(
                "w-3 h-3 rounded-full transition-colors duration-500",
                currentStep >= step.id ? "bg-lavender shadow-[0_0_10px_rgba(220,204,245,0.8)]" : "bg-white/30"
              )}
            />
            {step.id !== 6 && (
              <div className="w-8 h-[2px] mx-1 bg-white/20 relative overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: currentStep > step.id ? "100%" : "0%" }}
                  className="absolute inset-0 bg-lavender"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl glass p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border-white/80 relative z-10"
        >
          {/* Back Button */}
          {currentStep > 1 && currentStep < 6 && (
            <button 
              onClick={prevStep}
              className="absolute left-8 top-8 p-2 rounded-full hover:bg-white/40 transition-colors text-foreground/40 hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center pt-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blush to-lavender flex items-center justify-center mx-auto mb-8 shadow-xl"
              >
                <Heart className="text-white w-10 h-10 fill-white/20" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Welcome to NeuroStrom</h2>
              <p className="text-base md:text-lg text-foreground/50 mb-10 leading-relaxed max-w-md mx-auto">
                We&apos;re excited to help you automate your beauty empire. Let&apos;s set up your luxury AI workspace in just a few steps.
              </p>
              <button 
                onClick={handleBeginSetup}
                disabled={isSaving}
                className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blush to-lavender text-white rounded-full font-bold text-lg shadow-xl shadow-blush/20 hover:scale-105 transition-all disabled:opacity-50 mx-auto"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Begin Setup"} 
                {!isSaving && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          )}

          {/* Step 2: Salon Setup */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit(handleSaveSalon)} className="pt-4">
              <h2 className="text-3xl font-extrabold mb-2 text-center tracking-tight">Your Salon Identity</h2>
              <p className="text-foreground/50 text-center mb-8">What kind of beauty experience do you offer?</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { name: "Hair Studio", icon: Scissors },
                  { name: "Med Spa", icon: Zap },
                  { name: "Nails", icon: Sparkles },
                  { name: "Wellness", icon: Heart },
                ].map((type) => (
                  <button
                    key={type.name}
                    type="button"
                    onClick={() => setValue("salonType", type.name, { shouldValidate: true })}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                      selectedSalonType === type.name 
                        ? "border-lavender bg-lavender/5 shadow-md" 
                        : "border-white/40 hover:bg-white/40"
                    )}
                  >
                    <type.icon className={cn("w-5 h-5", selectedSalonType === type.name ? "text-lavender" : "text-foreground/30")} />
                    <span className="text-[10px] font-bold">{type.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/40 ml-2 uppercase tracking-widest">Salon Name</label>
                  <input {...register("salonName")} placeholder="Glow Studio" className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/20 text-sm focus:ring-2 focus:ring-lavender/20 outline-none" />
                  {errors.salonName && <p className="text-[8px] text-red-500 ml-2 font-bold uppercase">{errors.salonName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/40 ml-2 uppercase tracking-widest">Branch Count</label>
                  <input {...register("branchCount")} type="number" placeholder="1" className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/20 text-sm focus:ring-2 focus:ring-lavender/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/40 ml-2 uppercase tracking-widest">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                    <input {...register("location")} placeholder="New York, NY" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/20 text-sm focus:ring-2 focus:ring-lavender/20 outline-none" />
                  </div>
                  {errors.location && <p className="text-[8px] text-red-500 ml-2 font-bold uppercase">{errors.location.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/40 ml-2 uppercase tracking-widest">Phone</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                    <input {...register("phone")} placeholder="+1 (555) 000-0000" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-white/20 text-sm focus:ring-2 focus:ring-lavender/20 outline-none" />
                  </div>
                  {errors.phone && <p className="text-[8px] text-red-500 ml-2 font-bold uppercase">{errors.phone.message}</p>}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving || !selectedSalonType || !isSalonValid}
                className="w-full py-4 mt-8 bg-lavender text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Branding"}
              </button>
            </form>
          )}

          {/* Step 3: Branding */}
          {currentStep === 3 && (
            <div className="text-center pt-4">
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Salon Branding</h2>
              <p className="text-foreground/50 mb-10">Our AI uses your visuals to understand your brand&apos;s aesthetic.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square glass-dark rounded-3xl border-dashed border-2 border-white/30 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-lavender/50 transition-all">
                    <Upload className="w-6 h-6 text-white/30 group-hover:text-lavender transition-colors" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Image {i}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white/20 rounded-3xl border border-white/40 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-white/50 flex items-center justify-center border border-dashed border-white shrink-0">
                  <Camera className="w-8 h-8 text-foreground/20" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">Salon Logo</div>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-tighter">SVG, PNG, or AI formats preferred.</p>
                </div>
                <button className="px-4 py-2 bg-white rounded-full text-xs font-bold hover:bg-lavender hover:text-white transition-colors">Upload</button>
              </div>

              <button 
                onClick={handleBranding}
                disabled={isSaving}
                className="w-full py-5 mt-10 bg-lavender text-white rounded-2xl font-bold shadow-xl shadow-lavender/10 hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Aesthetics"}
              </button>
            </div>
          )}

          {/* Step 4: Staff Setup */}
          {currentStep === 4 && (
            <div className="pt-4">
              <h2 className="text-3xl font-extrabold mb-2 text-center tracking-tight">Staff Setup</h2>
              <p className="text-foreground/50 text-center mb-10">Invite your stylists to their new digital home.</p>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {staff.map((member, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 glass border-white/50 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-foreground/30" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        value={member.name}
                        onChange={(e) => {
                          const newStaff = [...staff];
                          newStaff[i].name = e.target.value;
                          setStaff(newStaff);
                        }}
                        placeholder="Stylist Name" 
                        className="bg-transparent border-none outline-none font-bold w-full text-sm placeholder:text-foreground/20" 
                      />
                      <select 
                        value={member.role}
                        onChange={(e) => {
                          const newStaff = [...staff];
                          newStaff[i].role = e.target.value;
                          setStaff(newStaff);
                        }}
                        className="bg-transparent border-none outline-none text-[10px] font-bold text-lavender uppercase tracking-widest cursor-pointer"
                      >
                        <option value="">Select Role</option>
                        <option value="Senior Stylist">Senior Stylist</option>
                        <option value="Junior Stylist">Junior Stylist</option>
                        <option value="Assistant">Assistant</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setStaff([...staff, { name: "", role: "", specialty: "" }])}
                  className="w-full py-4 border-2 border-dashed border-white/40 rounded-2xl text-foreground/30 font-bold text-sm hover:border-lavender/50 hover:text-lavender transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" /> Add Another Member
                </button>
              </div>

              <button 
                onClick={handleSaveStaff}
                disabled={isSaving}
                className="w-full py-5 mt-10 bg-lavender text-white rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save & Continue"}
              </button>
            </div>
          )}

          {/* Step 5: AI Preferences */}
          {currentStep === 5 && (
            <div className="pt-4">
              <h2 className="text-3xl font-extrabold mb-2 text-center tracking-tight">AI Preferences</h2>
              <p className="text-foreground/50 text-center mb-10">Configure your salon&apos;s digital consciousness.</p>
              
              <div className="space-y-8">
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-lavender/20 to-blush/20 border border-white relative overflow-hidden group">
                  <Brain className="absolute -right-4 -top-4 w-32 h-32 text-lavender/10 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 tracking-tight">
                    <Zap className="w-5 h-5 text-lavender" /> Assistant Persona
                  </h3>
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    {["Calm & Elegant", "Pro & Efficient", "Warm & Friendly", "Bold & Creative"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setAiPersonality(p)}
                        className={cn(
                          "py-3 px-4 rounded-xl text-xs font-bold transition-all uppercase tracking-tighter",
                          aiPersonality === p ? "bg-white shadow-md text-lavender" : "bg-white/30 text-foreground/50 hover:bg-white/50"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-sage" />
                    </div>
                    <span className="text-sm font-bold text-foreground/70 uppercase tracking-widest">Enable AI Assistant Engine</span>
                    <button 
                      onClick={() => setAiEnabled(!aiEnabled)}
                      className={cn(
                        "ml-auto w-10 h-5 rounded-full relative p-0.5 transition-colors duration-300",
                        aiEnabled ? "bg-sage" : "bg-foreground/10"
                      )}
                    >
                      <motion.div 
                        animate={{ x: aiEnabled ? 20 : 0 }}
                        className="w-4 h-4 rounded-full bg-white shadow-sm" 
                      />
                    </button>
                  </div>
                  {[
                    "Auto-track customer emotions",
                    "Predict inventory needs",
                    "Real-time quality scoring"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 opacity-60">
                      <div className="w-6 h-6 rounded-full bg-sage/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-sage" />
                      </div>
                      <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleActivateAI}
                disabled={isSaving}
                className="w-full py-5 mt-10 bg-gradient-to-r from-blush to-lavender text-white rounded-2xl font-bold shadow-2xl shadow-lavender/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activate NeuroStrom AI"}
              </button>
            </div>
          )}

          {/* Step 6: Completion Screen */}
          {currentStep === 6 && (
            <div className="text-center pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                className="w-24 h-24 rounded-full bg-sage flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <Check className="text-white w-12 h-12" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Your Empire is Ready</h2>
              <p className="text-base md:text-lg text-foreground/50 mb-10 leading-relaxed max-w-md mx-auto">
                NeuroStrom has successfully integrated with your brand. Your dashboard is personalized and waiting.
              </p>
              
              <div className="glass p-6 rounded-3xl border-white mb-10 text-left space-y-4">
                <div className="flex justify-between items-center text-[10px] font-extrabold opacity-40 uppercase tracking-[0.2em]">
                  <span>Configuration Status</span>
                  <span>100%</span>
                </div>
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="h-full bg-sage"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">BRANCHES: <span className="text-foreground">Configured</span></div>
                  <div className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">AI: <span className="text-foreground">{aiPersonality}</span></div>
                </div>
              </div>

              <button 
                onClick={() => router.push("/dashboard")}
                className="w-full py-5 bg-foreground text-background rounded-2xl font-bold text-lg hover:scale-[1.03] transition-all shadow-xl"
              >
                Enter Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Decorations */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-32 h-32 glass rounded-full blur-2xl opacity-30 bg-blush"
        />
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-[10%] w-48 h-48 glass rounded-full blur-3xl opacity-30 bg-lavender"
        />
      </div>
    </main>
  );
}
