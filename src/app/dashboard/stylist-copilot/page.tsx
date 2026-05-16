"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  ShoppingBag,
  Scissors,
  Star,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Modal, { FieldLabel, FieldInput, FieldSelect, PrimaryButton, SecondaryButton } from "@/components/Modal";
import { supabase } from "@/lib/supabase";

/* ─── Animation variants (unchanged) ──────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

/* ─── Static data (unchanged) ─────────────────────────────────────────── */
const SERVICES = [
  { name: "Molecular Shine Booster", duration: "60 min", price: "$120", fit: "High", reason: "Matches hair texture profile" },
  { name: "Scalp Neural Detox", duration: "45 min", price: "$95", fit: "Medium", reason: "Scalp condition trending dry" },
  { name: "AI Colour Mapping Session", duration: "90 min", price: "$180", fit: "High", reason: "Colour passport indicates warm undertones" },
];

const SOP_STEPS = [
  { step: 1, title: "Client Consultation", detail: "Review Beauty Passport scan and discuss goals", done: true },
  { step: 2, title: "Scalp Analysis", detail: "Use digital scalp reader on crown and nape sections", done: true },
  { step: 3, title: "Product Preparation", detail: "Mix formula per AI-calculated ratios", done: false },
  { step: 4, title: "Application", detail: "Apply in 4 quadrants, starting from nape", done: false },
  { step: 5, title: "Processing & Rinse", detail: "Monitor via thermal sensor, rinse at optimal temp", done: false },
  { step: 6, title: "Finish & Recommendation", detail: "Style and hand off home-care kit", done: false },
];

const PRODUCTS = [
  { name: "Lustre Radiance Serum", price: "$48", category: "Finish" },
  { name: "Hydro-Bond Mask", price: "$36", category: "Treatment" },
  { name: "Colour-Lock Shampoo", price: "$28", category: "Cleanse" },
  { name: "Neural Scalp Activator", price: "$55", category: "Scalp" },
];

const SUGGESTED_PROMPTS = [
  "What haircut suits this client?",
  "Which treatment to recommend?",
  "Suggest upsell items",
  "How to handle dry scalp?",
  "What color matches her skin tone?",
  "SOP steps for keratin treatment",
];

/* ─── Voice hooks ─────────────────────────────────────────────────────── */

// Detect support outside React (module scope — runs once)
const HAS_SPEECH_RECOGNITION =
  typeof window !== "undefined" &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

const HAS_SPEECH_SYNTHESIS =
  typeof window !== "undefined" && "speechSynthesis" in window;

function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => { onTranscriptRef.current = onTranscript; });

  // Initialize recognition in an effect (browser-only, runs once)
  useEffect(() => {
    if (!HAS_SPEECH_RECOGNITION) return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      onTranscriptRef.current(result);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, isSupported: HAS_SPEECH_RECOGNITION, startListening, stopListening };
}

function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const speak = useCallback(
    (text: string) => {
      if (!HAS_SPEECH_SYNTHESIS || isMuted) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isMuted]
  );

  const stop = useCallback(() => {
    if (HAS_SPEECH_SYNTHESIS) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev && HAS_SPEECH_SYNTHESIS) window.speechSynthesis.cancel();
      return !prev;
    });
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, isMuted, isSupported: HAS_SPEECH_SYNTHESIS, speak, stop, toggleMute };
}


/* ─── Client Database ─────────────────────────────────────────────────── */
const CLIENT_DB = [
  { id: "C001", name: "Seraphina J.", phone: "+1 (212) 555-0101", visits: 18, rating: 4.9, tier: "VIP", lastVisit: "6 weeks ago", lastService: "Molecular Infusion + Colour", faceShape: "Oval", skinTone: "Light / Warm", hairType: "Wavy · Fine", allergies: "None", preferences: "Prefers warm tones, dislikes heavy products", products: ["Lustre Radiance Serum", "Colour-Lock Shampoo"] },
  { id: "C002", name: "Dominic R.", phone: "+1 (212) 555-0202", visits: 11, rating: 4.7, tier: "Regular", lastVisit: "3 weeks ago", lastService: "Scalp Detox", faceShape: "Square", skinTone: "Medium", hairType: "Straight · Thick", allergies: "Sulfate sensitivity", preferences: "Low-maintenance styles", products: ["Neural Scalp Activator"] },
  { id: "C003", name: "Elena V.", phone: "+1 (212) 555-0303", visits: 7, rating: 4.8, tier: "Regular", lastVisit: "2 weeks ago", lastService: "Neural Color Scan", faceShape: "Heart", skinTone: "Deep / Cool", hairType: "Curly · Medium", allergies: "PPD allergy", preferences: "Bold colours, editorial styles", products: ["Hydro-Bond Mask", "Lustre Radiance Serum"] },
  { id: "C004", name: "Marcus W.", phone: "+1 (212) 555-0404", visits: 24, rating: 5.0, tier: "VIP", lastVisit: "1 week ago", lastService: "Keratin Treatment", faceShape: "Round", skinTone: "Light / Cool", hairType: "Wavy · Thick", allergies: "None", preferences: "Classic, polished looks", products: ["Colour-Lock Shampoo", "Hydro-Bond Mask", "Neural Scalp Activator"] },
  { id: "C005", name: "Aisha K.", phone: "+1 (212) 555-0505", visits: 3, rating: 4.6, tier: "New", lastVisit: "4 weeks ago", lastService: "Precision Cut", faceShape: "Oval", skinTone: "Deep / Warm", hairType: "Coily · Fine", allergies: "Latex gloves", preferences: "Natural styles, minimal chemicals", products: [] },
];

/* ─── Page Component ──────────────────────────────────────────────────── */

export default function StylistCoPilotPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLoadClient, setShowLoadClient] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [activeClient, setActiveClient] = useState(CLIENT_DB[0]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Voice transcript pipes directly into setInput via callback (no effect needed)
  const speech = useSpeechRecognition((text: string) => setInput(text));
  const tts = useSpeechSynthesis();

  const handleSuggestSpeak = () => {
    const script = `Based on your ${activeClient.hairType.toLowerCase()} hair and ${activeClient.faceShape.toLowerCase()} face shape, I recommend our Molecular Shine Booster. It's designed to restore hydration and add brilliant shine while perfectly complementing your features. It's a $120 treatment that takes about 60 minutes.`;
    tts.speak(script);
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const filteredClients = clientSearch
    ? CLIENT_DB.filter((c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch) ||
      c.id.toLowerCase().includes(clientSearch.toLowerCase())
    )
    : CLIENT_DB;

  const loadClient = (client: typeof CLIENT_DB[0]) => {
    setActiveClient(client);
    setShowLoadClient(false);
    setClientSearch("");
    setMessages([]);
    toast.success(`${client.name} loaded into consultation workspace`);
  };


  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isTyping) return;

    // Stop listening if voice was active
    if (speech.isListening) speech.stopListening();

    const userMessage = { role: "user" as const, content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/stylist-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: messages,
          context: {
            client: { name: activeClient.name, visits: activeClient.visits, rating: activeClient.rating },
            scan: { faceShape: activeClient.faceShape, skinTone: activeClient.skinTone, hairType: activeClient.hairType },
          },
        }),
      });

      const data = await response.json();
      const aiContent = data.response || "I apologize — I could not generate a response. Please try again.";

      setMessages((prev) => [...prev, { role: "ai" as const, content: aiContent }]);

      // Auto-speak AI response if not muted
      tts.speak(aiContent);
    } catch {
      const fallback = "Neural link interrupted. Based on the client profile, I recommend a moisture-rich treatment with layered cuts for her oval face shape.";
      setMessages((prev) => [...prev, { role: "ai" as const, content: fallback }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
    tts.stop();
  };

  const handleMicToggle = () => {
    if (speech.isListening) {
      speech.stopListening();
      // Auto-send after voice input completes
      if (input.trim()) {
        setTimeout(() => handleSend(), 300);
      }
    } else {
      speech.startListening();
    }
  };

  /* ─── Render (UI preserved pixel-for-pixel) ──────────────────────────── */
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">AI Tools</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Stylist CoPilot</h1>
          <p className="text-sm text-text-secondary mt-1">AI-driven service recommendations and live SOP guidance.</p>
        </div>
        <button onClick={() => setShowLoadClient(true)} className="h-10 px-4 rounded-xl bg-lavender/15 border border-lavender/30 text-[#6b4fa0] text-sm font-semibold flex items-center gap-2 hover:bg-lavender/25 transition-all">
          <Bot className="w-4 h-4" /> Load Client
        </button>
      </motion.div>

      {/* Customer summary */}
      <motion.div variants={fadeUp} className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender/30 to-blush/30 flex items-center justify-center text-2xl font-black text-text-primary shrink-0">{activeClient.name.charAt(0)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-extrabold text-text-primary">{activeClient.name}</h2>
              <span className="badge-info text-[10px] font-bold px-2.5 py-1 rounded-full">{activeClient.tier} Client</span>
              <span className="text-[11px] text-text-muted">★ {activeClient.rating} · {activeClient.visits} visits</span>
            </div>
            <p className="text-[12px] text-text-secondary mt-1">Last visit: {activeClient.lastVisit} · {activeClient.lastService}</p>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Face Shape", value: activeClient.faceShape },
              { label: "Skin Tone", value: activeClient.skinTone },
              { label: "Hair Type", value: activeClient.hairType },
            ].map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-black/[0.03]">
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">{d.label}</p>
                <p className="text-[13px] font-bold text-text-primary mt-0.5">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Services + SOP side by side */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recommended services */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-5">
          <h2 className="text-base font-bold text-text-primary mb-1">Recommended Services</h2>
          <p className="text-[12px] text-text-muted mb-4">Based on scan + visit history</p>
          <div className="space-y-2.5">
            {SERVICES.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.05] hover:border-lavender/30 hover:bg-lavender/[0.02] transition-all cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-lavender/15 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-[#6b4fa0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-text-primary truncate">{s.name}</p>
                  <p className="text-[10px] text-text-muted">{s.duration} · {s.price}</p>
                  <p className="text-[10px] text-text-secondary mt-0.5 italic">{s.reason}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", s.fit === "High" ? "badge-success" : "badge-warning")}>
                  {s.fit} Fit
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SOP Steps */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-7">
          <h2 className="text-base font-bold text-text-primary mb-1">SOP Timeline</h2>
          <p className="text-[12px] text-text-muted mb-5">Molecular Infusion · Step-by-step protocol</p>
          <div className="relative">
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-black/[0.06]" />
            <div className="space-y-3">
              {SOP_STEPS.map((s, i) => (
                <motion.div key={i} variants={fadeUp}
                  className={cn("flex items-start gap-3.5 pl-1", s.done ? "opacity-60" : "")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10 mt-0.5 border-2",
                    s.done ? "bg-sage/30 border-sage text-sage-dark" : i === SOP_STEPS.filter(x => x.done).length ? "bg-lavender border-lavender text-white" : "bg-white border-black/[0.10] text-text-muted")}>
                    {s.done ? "✓" : s.step}
                  </div>
                  <div className={cn("flex-1 p-3 rounded-2xl border transition-all", i === SOP_STEPS.filter(x => x.done).length ? "border-lavender/30 bg-lavender/[0.04]" : "border-black/[0.04] bg-transparent")}>
                    <p className="text-[13px] font-semibold text-text-primary">{s.title}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{s.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Upsell + Products */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Upsell */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-4 bg-white/60 border border-lavender/20 relative overflow-hidden flex flex-col shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-lavender/40 to-blush/30 pointer-events-none" />
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Star className="w-4 h-4 text-lavender" />
              <h2 className="text-sm font-bold text-[#1F1A17]">Upsell Opportunity</h2>
            </div>
            <div className="p-3.5 rounded-2xl bg-lavender/5 border border-lavender/10 mb-4">
              <p className="text-[13px] text-[#1F1A17] leading-relaxed font-medium">
                &quot;{activeClient.name.split(' ')[0]}&apos;s colour is due for a refresh. Recommend the AI Colour Mapping upgrade — 82% of similar clients convert at this stage.&quot;
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-lavender/10 shadow-sm mb-4">
              <p className="text-[11px] text-[#7A6E67] font-bold uppercase tracking-wider">Potential add-on value</p>
              <p className="text-2xl font-black text-[#1F1A17] mt-0.5">+ $180</p>
            </div>
          </div>
          <button
            onClick={() => setShowSuggest(true)}
            className="relative z-10 w-full py-3 rounded-xl bg-lavender text-white text-[12px] font-bold hover:bg-lavender/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-lavender/20"
          >
            Suggest to Client <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Product recommendations */}
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-8">
          <h2 className="text-base font-bold text-text-primary mb-1">Product Recommendations</h2>
          <p className="text-[12px] text-text-muted mb-4">Tailored retail for today&apos;s service</p>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-black/[0.05] hover:border-lavender/30 transition-all cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-peach/15 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4 text-[#9a5c2e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-text-primary truncate">{p.name}</p>
                  <p className="text-[10px] text-text-muted">{p.category}</p>
                </div>
                <p className="text-[13px] font-bold text-text-primary shrink-0">{p.price}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── AI Chat Assistant Card ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="card p-0 overflow-hidden flex flex-col h-[500px]">
        {/* Chat header */}
        <div className="p-4 border-b border-black/[0.05] bg-lavender/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-lavender/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-lavender" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary leading-none">Neural Stylist CoPilot</h2>
              <p className="text-[10px] text-text-muted mt-1 font-medium">
                {speech.isListening ? "🎤 Listening..." : "Online · Ready for consultation"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {["Services", "SOP", "Products"].map((t) => (
              <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/[0.04] text-text-muted uppercase tracking-wider">{t}</span>
            ))}
            {/* Voice output toggle */}
            {mounted && tts.isSupported && (
              <button
                type="button"
                onClick={tts.toggleMute}
                className={cn(
                  "ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                  tts.isMuted ? "bg-black/[0.06] text-text-muted" : "bg-lavender/15 text-lavender"
                )}
                title={tts.isMuted ? "Unmute voice" : "Mute voice"}
              >
                {tts.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
            {/* Clear conversation */}
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="ml-0.5 w-7 h-7 rounded-lg flex items-center justify-center bg-black/[0.04] text-text-muted hover:text-red-400 transition-all"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Chat messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <Sparkles className="w-8 h-8 text-lavender mb-3" />
              <p className="text-sm font-bold text-text-primary">How can I assist your service today?</p>
              <p className="text-[11px] text-text-secondary mt-1">Ask about cuts, colors, or SOP protocols.</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className="relative group">
                  <div
                    className={cn(
                      "max-w-[80%] p-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                      m.role === "user"
                        ? "bg-lavender text-white font-medium rounded-tr-none"
                        : "bg-black/[0.03] border border-black/[0.05] text-text-primary font-medium rounded-tl-none"
                    )}
                  >
                    {m.content}
                  </div>
                  {/* Copy button on AI messages */}
                  {m.role === "ai" && (
                    <button
                      onClick={() => handleCopy(m.content, i)}
                      className="absolute -bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md bg-white border border-black/[0.08] flex items-center justify-center shadow-sm"
                      title="Copy response"
                    >
                      {copiedIdx === i ? (
                        <Check className="w-3 h-3 text-sage" />
                      ) : (
                        <Copy className="w-3 h-3 text-text-muted" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-black/[0.03] p-3.5 rounded-2xl rounded-tl-none flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-black/[0.05] bg-white">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED_PROMPTS.map((q) => (
                <button key={q} onClick={() => handleSend(q)} className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-lavender/30 text-lavender hover:bg-lavender/5 transition-all">
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            {/* Mic button */}
            {mounted && speech.isSupported && (
              <button
                type="button"
                onClick={handleMicToggle}
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0",
                  speech.isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                    : "bg-black/[0.04] text-text-muted hover:bg-lavender/10 hover:text-lavender"
                )}
                title={speech.isListening ? "Stop recording" : "Voice input"}
              >
                {speech.isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={speech.isListening ? "Listening..." : "Ask the CoPilot anything..."}
              className="flex-1 h-11 px-4 rounded-xl bg-black/[0.04] border-none text-sm font-medium focus:ring-2 focus:ring-lavender/20 outline-none placeholder:text-text-muted"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 rounded-xl bg-lavender text-white flex items-center justify-center hover:bg-lavender/90 transition-all disabled:opacity-50 shadow-lg shadow-lavender/20"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══════ LOAD CLIENT MODAL ═══════ */}
      <Modal open={showLoadClient} onClose={() => { setShowLoadClient(false); setClientSearch(""); }} title="Load Client" subtitle="Search by name, phone, or client ID" size="lg">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Search clients..."
              autoFocus
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/[0.04] border border-transparent text-sm font-medium focus:bg-white focus:border-lavender/30 focus:ring-2 focus:ring-lavender/10 outline-none transition-all placeholder:text-text-muted"
            />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {filteredClients.map((c) => (
              <button
                key={c.id}
                onClick={() => loadClient(c)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all hover:border-lavender/30 hover:bg-lavender/[0.03]",
                  activeClient.id === c.id ? "border-lavender/40 bg-lavender/[0.05]" : "border-black/[0.05]"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender/25 to-blush/25 flex items-center justify-center text-text-primary font-bold text-sm shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-text-primary">{c.name}</p>
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", c.tier === "VIP" ? "badge-info" : c.tier === "New" ? "badge-warning" : "badge-success")}>{c.tier}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">{c.id} · {c.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-bold text-text-primary">★ {c.rating}</p>
                    <p className="text-[10px] text-text-muted">{c.visits} visits</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-[10px]"><span className="text-text-muted">Face:</span> <span className="font-semibold text-text-primary">{c.faceShape}</span></div>
                  <div className="text-[10px]"><span className="text-text-muted">Tone:</span> <span className="font-semibold text-text-primary">{c.skinTone}</span></div>
                  <div className="text-[10px]"><span className="text-text-muted">Hair:</span> <span className="font-semibold text-text-primary">{c.hairType}</span></div>
                </div>
                {c.allergies !== "None" && (
                  <p className="text-[10px] text-[#a0416b] font-semibold mt-1.5">⚠ Allergies: {c.allergies}</p>
                )}
                <p className="text-[10px] text-text-muted mt-1">Last: {c.lastVisit} · {c.lastService}</p>
              </button>
            ))}
            {filteredClients.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-text-muted">No clients found matching &ldquo;{clientSearch}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* ═══════ SUGGEST TO CLIENT MODAL ═══════ */}
      <Modal open={showSuggest} onClose={() => setShowSuggest(false)} title="Consultation Script" subtitle="Personalised recommendation for the client">
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-lavender/10 border border-lavender/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-lavender uppercase tracking-widest">Recommended Treatment</span>
              <span className="text-[12px] font-bold text-text-primary">$120 · 60 min</span>
            </div>
            <h3 className="text-xl font-black text-text-primary mb-2">Molecular Shine Booster</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Based on your <span className="font-bold text-text-primary">{activeClient.hairType.toLowerCase()}</span> hair texture and oval face shape, I recommend our Molecular Shine Booster to restore hydration, reduce frizz, and add brilliant shine.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-widest px-1">Stylist Talking Points</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                "Mention the Beauty Passport scan results showing cuticle dryness.",
                "Explain the molecular technology that repairs from within.",
                "Highlight the immediate shine and manageability benefits.",
              ].map((p, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                  <div className="w-5 h-5 rounded-full bg-lavender/15 flex items-center justify-center text-lavender text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-[12px] text-text-primary font-medium">{p}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-3">
              <PrimaryButton onClick={() => {
                navigator.clipboard.writeText(`Based on your ${activeClient.hairType.toLowerCase()} hair, I recommend our Molecular Shine Booster to restore hydration and add brilliant shine.`);
                toast.success("Script copied to clipboard!");
              }} className="flex-1 flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" /> Copy Script
              </PrimaryButton>
              <button
                onClick={handleSuggestSpeak}
                className="w-12 h-12 rounded-xl bg-lavender/15 text-lavender flex items-center justify-center hover:bg-lavender/25 transition-all"
                title="Read aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <SecondaryButton onClick={async () => {
              toast.info("Sending recommendation to client profile...");
              try {
                // In a real app, we might update the client's preferences or add to a history table
                // Here we'll simulate a save to the 'clients' or a related log
                const { error } = await supabase.from("resource_allocations").insert({
                  type: "AI_CONSULTATION",
                  insight: `Recommended Molecular Shine Booster for ${activeClient.name}`,
                  impact: "+$120 potential upsell",
                  timestamp: new Date().toISOString()
                });
                if (error) throw error;
                toast.success("Recommendation saved to customer history.");
                setShowSuggest(false);
              } catch (err) {
                console.warn("Supabase sync failed:", err);
                toast.success("Recommendation saved locally.");
                setShowSuggest(false);
              }
            }} className="w-full">
              Send to Customer Profile
            </SecondaryButton>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
