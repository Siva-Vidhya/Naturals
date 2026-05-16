"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Calendar, UserCircle, FileText, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { BeautyPassportResult } from '@/lib/beauty-analysis';

interface SaveBeautyPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BeautyPassportResult;
  onSuccess?: () => void;
}

export default function SaveBeautyPassportModal({ isOpen, onClose, data, onSuccess }: SaveBeautyPassportModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      toast.error("Full Name and Phone Number are required.");
      return;
    }

    setLoading(true);
    try {
      // 1. Check for existing client by phone
      let { data: existingClient, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', form.phone)
        .single();

      let clientId;

      if (existingClient) {
        clientId = existingClient.id;
        // Optionally update existing client details if they were empty
        await supabase.from('clients').update({
          full_name: form.full_name,
          email: form.email || undefined,
          date_of_birth: form.date_of_birth || undefined,
          gender: form.gender || undefined,
          notes: form.notes || undefined
        }).eq('id', clientId);
      } else {
        // 2. Create new client
        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert({
            full_name: form.full_name,
            phone: form.phone,
            email: form.email || null,
            date_of_birth: form.date_of_birth || null,
            gender: form.gender || null,
            notes: form.notes || null
          })
          .select()
          .single();

        if (insertError) throw insertError;
        clientId = newClient.id;
      }

      // 3. Save Beauty Passport record
      const { error: passportError } = await supabase
        .from('beauty_passports')
        .insert({
          client_id: clientId,
          face_shape: data.faceShape,
          skin_tone: data.skinTone,
          undertone: data.undertone,
          skin_analysis: data,
          hair_analysis: null,
          scalp_analysis: null,
          recommendations: data.recommendations,
          confidence: data.confidence,
          image_url: null,
          neural_id: data.neuralId
        });

      if (passportError) throw passportError;

      toast.success("Beauty Passport saved successfully.");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Save Error:", error);
      toast.error(error.message || "Failed to save record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Save Beauty Passport</h2>
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Customer Profile Integration</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                  <X className="w-5 h-5 text-foreground/40" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                      <User className="w-3 h-3" /> Full Name *
                    </label>
                    <input
                      required
                      value={form.full_name}
                      onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-transparent focus:bg-white focus:border-lavender/40 outline-none transition-all text-sm font-bold"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Phone Number *
                    </label>
                    <input
                      required
                      value={form.phone}
                      onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-transparent focus:bg-white focus:border-lavender/40 outline-none transition-all text-sm font-bold"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-transparent focus:bg-white focus:border-lavender/40 outline-none transition-all text-sm font-bold"
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.date_of_birth}
                      onChange={e => setForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-transparent focus:bg-white focus:border-lavender/40 outline-none transition-all text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                      <UserCircle className="w-3 h-3" /> Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={e => setForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-transparent focus:bg-white focus:border-lavender/40 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Consultation Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-5 py-4 rounded-2xl bg-black/5 border border-transparent focus:bg-white focus:border-lavender/40 outline-none transition-all text-sm font-bold h-24 resize-none"
                    placeholder="Add any specific observations or client preferences..."
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-5 rounded-[2rem] bg-foreground text-background font-black tracking-tight flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Save Profile & Result
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
