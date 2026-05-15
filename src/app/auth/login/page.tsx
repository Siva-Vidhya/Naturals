"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const getFriendlyErrorMessage = (error: unknown): string => {
  if (!error) return "Something went wrong. Please try again.";
  const rawMsg = typeof error === 'string' ? error : (error as { message?: string })?.message || "";
  const msg = rawMsg.toLowerCase();
  if (msg.includes("invalid login credentials")) return "Incorrect email or password.";
  if (msg.includes("email not confirmed")) return "Please confirm your email before logging in.";
  if (msg.includes("rate limit") || msg.includes("too many requests")) return "Too many attempts. Please wait and try again.";
  if (msg.includes("user not found")) return "No account found with this email.";
  if (msg.includes("auth_callback_failed")) return "Google sign-in was cancelled or failed.";
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

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) showToast(getFriendlyErrorMessage(error), "error");
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), mode: "onChange",
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(), password: values.password,
      });
      if (error) { showToast(getFriendlyErrorMessage(error), "error"); return; }
      if (data.user) {
        if (!values.rememberMe) sessionStorage.setItem('neurostrom_session_only', 'true');
        else sessionStorage.removeItem('neurostrom_session_only');
        showToast("Welcome back!", "success");
        let onboardingComplete = false;
        try {
          const { data: ob } = await supabase.from('onboarding_preferences').select('id').eq('user_id', data.user.id).maybeSingle();
          onboardingComplete = !!ob;
        } catch {}
        router.push(onboardingComplete ? "/dashboard" : "/onboarding");
      }
    } catch (error: unknown) { showToast(getFriendlyErrorMessage(error), "error"); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
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
        <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -top-20 -left-20 w-96 h-96 bg-blush/20 rounded-full blur-[100px]" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 50, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute -bottom-20 -right-20 w-96 h-96 bg-lavender/20 rounded-full blur-[100px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass p-10 rounded-[2.5rem] shadow-2xl border-white/60 relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="text-white w-7 h-7" />
          </motion.div>
          <h1 className="text-3xl font-extrabold mb-2 text-foreground tracking-tight">Welcome Back</h1>
          <p className="text-foreground/50 text-sm">Enter your luxury workspace</p>
        </div>
        <div className="flex bg-white/30 p-1 rounded-2xl mb-8 relative">
          <div className="flex-1 py-2 rounded-xl text-xs font-bold bg-white shadow-sm text-foreground text-center">Log In</div>
          <Link href="/auth/signup" className="flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center text-foreground/40 hover:text-foreground/60">Sign Up</Link>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground/40 ml-4 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input {...register("email")} type="email" placeholder="name@salon.com" className={cn("w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-lavender/20 transition-all text-sm", errors.email && "border-red-300 ring-red-100 focus:ring-red-200")} />
              <AnimatePresence>{errors.email && (<motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-red-500 mt-1 ml-4 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email.message}</motion.p>)}</AnimatePresence>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-4 mr-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Password</label>
              <button type="button" className="text-[10px] font-bold text-lavender hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className={cn("w-full pl-12 pr-12 py-4 rounded-2xl bg-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-lavender/20 transition-all text-sm", errors.password && "border-red-300 ring-red-100 focus:ring-red-200")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/50 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <AnimatePresence>{errors.password && (<motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-red-500 mt-1 ml-4 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password.message}</motion.p>)}</AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2">
            <input {...register("rememberMe")} type="checkbox" id="rememberMe" className="w-4 h-4 rounded border-white/20 text-lavender focus:ring-lavender/20 bg-white/50" />
            <label htmlFor="rememberMe" className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest cursor-pointer">Remember me</label>
          </div>
          <button disabled={isLoading || !isValid} className={cn("w-full py-4 rounded-2xl bg-gradient-to-r from-blush to-lavender text-white font-bold shadow-xl shadow-blush/20 transition-all flex items-center justify-center gap-2 mt-6", (isLoading || !isValid) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]")}>
            {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Authenticating...</span></>) : (<><span>Sign In</span><ArrowRight className="w-4 h-4" /></>)}
          </button>
        </form>
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-foreground/10"></div></div>
          <div className="relative flex justify-center text-[10px] font-bold text-foreground/30 uppercase bg-transparent px-2"><span className="bg-[#FFF7F1] px-2">Or continue with</span></div>
        </div>
        <button onClick={handleGoogleSignIn} disabled={isGoogleLoading} className={cn("w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-white bg-white/40 hover:bg-white/60 transition-all text-sm font-bold shadow-sm", isGoogleLoading && "opacity-50 cursor-not-allowed")}>
          {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Sign in with Google
        </button>
        <p className="text-center mt-8 text-xs text-foreground/40 font-medium">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-lavender font-bold underline underline-offset-4">Create Account</Link>
        </p>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-soft-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lavender" />
      </main>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
