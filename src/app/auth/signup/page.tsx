"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, User, Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, "Min 8 chars with uppercase, lowercase, number, and special character."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type SignupFormValues = z.infer<typeof signupSchema>;

const getFriendlyErrorMessage = (error: unknown): string => {
  if (!error) return "Something went wrong. Please try again.";
  const rawMsg = typeof error === 'string' ? error : (error as { message?: string })?.message || "";
  const msg = rawMsg.toLowerCase();
  if (msg.includes("already registered") || msg.includes("already exists")) return "An account with this email already exists.";
  if (msg.includes("invalid login credentials")) return "Incorrect email or password.";
  if (msg.includes("rate limit") || msg.includes("too many requests")) return "Too many attempts. Please wait and try again.";
  if (msg.includes("password should be at least")) return "Password is too short.";
  return rawMsg || "Something went wrong. Please try again.";
};

const showToast = (message: string, type: "success" | "error") => {
  toast.custom(() => (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-md min-w-[320px]",
        type === "success" ? "bg-white/80 border-sage/30 text-sage-dark" : "bg-white/80 border-red-200/50 text-red-500")}>
      {type === "success" ? <CheckCircle2 className="w-5 h-5 text-sage" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
      <p className="text-sm font-semibold">{message}</p>
    </motion.div>
  ), { duration: 4000 });
};

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema), mode: "onChange",
  });

  const password = watch("password", "");

  const strengthMetrics = useMemo(() => {
    if (!password) return { score: 0, color: "bg-white/30", label: "Empty" };
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    if (score <= 25) return { score, color: "bg-red-400", label: "Weak" };
    if (score <= 50) return { score, color: "bg-peach", label: "Fair" };
    if (score <= 75) return { score, color: "bg-lavender", label: "Good" };
    return { score, color: "bg-sage", label: "Strong" };
  }, [password]);

  const onSubmit = async (values: SignupFormValues) => {
    if (isLoading) return;
    setIsLoading(true);
    const normalizedEmail = values.email.trim().toLowerCase();
    const fullName = values.fullName.trim();
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail, 
        password: values.password,
        options: { 
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) { showToast(getFriendlyErrorMessage(authError), "error"); return; }

      // Detect "fake signup" — Supabase returns a user with no identities
      // when the email already exists (to prevent email enumeration)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        showToast("An account with this email already exists. Please sign in instead.", "error");
        return;
      }

      let session = data.session;
      
      if (session) {
        // Email confirmation is DISABLED — we got a session immediately
        try {
          await supabase.from('profiles').upsert({
            id: session.user.id, full_name: fullName, email: normalizedEmail,
            role: 'owner', updated_at: new Date().toISOString(),
          });
        } catch {}
        showToast("Welcome to NeuroStrom!", "success");
        router.push("/onboarding");
      } else {
        // Email confirmation is ENABLED — no session returned
        // Try auto-login (works if Supabase auto-confirms the email)
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail, password: values.password,
        });
        
        if (!loginError && loginData.session) {
          // Auto-login succeeded (email was auto-confirmed)
          try {
            await supabase.from('profiles').upsert({
              id: loginData.session.user.id, full_name: fullName, email: normalizedEmail,
              role: 'owner', updated_at: new Date().toISOString(),
            });
          } catch {}
          showToast("Welcome to NeuroStrom!", "success");
          router.push("/onboarding");
        } else {
          // Email confirmation is truly required — show a helpful message
          showToast("Account created! Check your email for a confirmation link, then sign in.", "success");
          router.push("/auth/login");
        }
      }
    } catch (error: unknown) { showToast(getFriendlyErrorMessage(error), "error"); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignUp = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) { showToast(getFriendlyErrorMessage(error), "error"); setIsGoogleLoading(false); }
    } catch (error: unknown) { showToast(getFriendlyErrorMessage(error), "error"); setIsGoogleLoading(false); }
  };

  return (
    <main className="min-h-screen bg-soft-gradient flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-peach/20 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, 40, 0], y: [0, -60, 0] }} transition={{ duration: 18, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sage/20 rounded-full blur-[100px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg glass p-10 rounded-[2.5rem] shadow-2xl border-white/60 relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-peach to-blush flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="text-white w-7 h-7" />
          </motion.div>
          <h1 className="text-3xl font-extrabold mb-2 text-foreground tracking-tight">Join NeuroStrom</h1>
          <p className="text-foreground/50 text-sm">Create your luxury AI-powered workspace</p>
        </div>
        <div className="flex bg-white/30 p-1 rounded-2xl mb-8">
          <Link href="/auth/login" className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center text-foreground/40 hover:text-foreground/60">Log In</Link>
          <div className="flex-1 py-2 rounded-xl text-xs font-bold bg-white shadow-sm text-foreground text-center">Sign Up</div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground/40 ml-4 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input {...register("fullName")} type="text" placeholder="Elena Rossi" className={cn("w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-peach/20 transition-all text-sm", errors.fullName && "border-red-300 ring-red-100 focus:ring-red-200")} />
              <AnimatePresence>{errors.fullName && (<motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-red-500 mt-1 ml-4 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.fullName.message}</motion.p>)}</AnimatePresence>
            </div>
          </div>
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground/40 ml-4 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input {...register("email")} type="email" placeholder="elena@glowstudio.com" className={cn("w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-peach/20 transition-all text-sm", errors.email && "border-red-300 ring-red-100 focus:ring-red-200")} />
              <AnimatePresence>{errors.email && (<motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-red-500 mt-1 ml-4 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email.message}</motion.p>)}</AnimatePresence>
            </div>
          </div>
          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground/40 ml-4 uppercase tracking-widest">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={cn("w-full pl-12 pr-12 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-peach/20 transition-all text-sm", errors.password && "border-red-300 ring-red-100 focus:ring-red-200")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/50 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-4 space-y-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1 mt-2">
                    <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-tighter">Strength: {strengthMetrics.label}</span>
                    <span className="text-[9px] font-bold text-foreground/40">{strengthMetrics.score}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${strengthMetrics.score}%` }} className={cn("h-full transition-all duration-500", strengthMetrics.color)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>{errors.password && (<motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-red-500 mt-1 ml-4 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password.message}</motion.p>)}</AnimatePresence>
          </div>
          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground/40 ml-4 uppercase tracking-widest">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input {...register("confirmPassword")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={cn("w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-peach/20 transition-all text-sm", errors.confirmPassword && "border-red-300 ring-red-100 focus:ring-red-200")} />
              <AnimatePresence>{errors.confirmPassword && (<motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-red-500 mt-1 ml-4 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword.message}</motion.p>)}</AnimatePresence>
            </div>
          </div>
          <button disabled={isLoading || !isValid} type="submit" className={cn("w-full py-4 rounded-2xl bg-gradient-to-r from-peach to-blush text-white font-bold shadow-xl shadow-peach/20 transition-all flex items-center justify-center gap-2 mt-6", (isLoading || !isValid) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]")}>
            {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Account...</span></>) : (<><span>Create Account</span><ArrowRight className="w-4 h-4" /></>)}
          </button>
        </form>
        {/* Google OAuth Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-foreground/10"></div></div>
          <div className="relative flex justify-center text-[10px] font-bold text-foreground/30 uppercase bg-transparent px-2"><span className="bg-[#FFF7F1] px-2">Or continue with</span></div>
        </div>
        <button onClick={handleGoogleSignUp} disabled={isGoogleLoading} className={cn("w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-white bg-white/40 hover:bg-white/60 transition-all text-sm font-bold shadow-sm", isGoogleLoading && "opacity-50 cursor-not-allowed")}>
          {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Sign up with Google
        </button>
        <p className="text-center mt-8 text-xs text-foreground/40 font-medium">
          Already have an account? <Link href="/auth/login" className="text-peach font-bold underline underline-offset-4">Sign In</Link>
        </p>
      </motion.div>
    </main>
  );
}
