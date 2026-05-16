"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ open, onClose, title, subtitle, children, size = "md" }: ModalProps) {
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  const widthClass = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
              "relative w-full rounded-[28px] bg-white border border-black/[0.06] shadow-2xl overflow-hidden",
              widthClass
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/[0.05]">
              <div>
                <h2 className="text-lg font-bold text-text-primary tracking-tight">{title}</h2>
                {subtitle && <p className="text-[12px] text-text-muted mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-black/[0.04] flex items-center justify-center hover:bg-black/[0.08] transition-all"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Shared form field styles ────────────────────────────────────────── */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">{children}</label>;
}

export function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-11 px-4 rounded-xl bg-black/[0.04] border border-transparent text-sm font-medium",
        "focus:bg-white focus:border-lavender/30 focus:ring-2 focus:ring-lavender/10 outline-none transition-all",
        "placeholder:text-text-muted",
        props.className
      )}
    />
  );
}

export function FieldSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          "w-full h-11 pl-4 pr-10 rounded-xl bg-black/[0.04] border border-transparent text-sm font-medium",
          "focus:bg-white focus:border-lavender/30 focus:ring-2 focus:ring-lavender/10 outline-none transition-all",
          "text-text-primary appearance-none cursor-pointer",
          props.className
        )}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
    </div>
  );
}

export function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-xl bg-black/[0.04] border border-transparent text-sm font-medium resize-none",
        "focus:bg-white focus:border-lavender/30 focus:ring-2 focus:ring-lavender/10 outline-none transition-all",
        "placeholder:text-text-muted",
        props.className
      )}
    />
  );
}

export function PrimaryButton({ children, loading, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "h-11 px-6 rounded-xl bg-text-primary text-white text-sm font-semibold",
        "shadow-md shadow-black/10 hover:bg-text-primary/90 transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        props.className
      )}
    >
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "h-11 px-6 rounded-xl bg-white border border-black/[0.07] text-sm font-semibold text-text-secondary",
        "hover:border-black/[0.12] transition-all",
        props.className
      )}
    >
      {children}
    </button>
  );
}
