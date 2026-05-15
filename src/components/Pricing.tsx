"use client";

import { motion } from "framer-motion";
import { Star, Check, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "Elena Rossi",
    role: "Founder, Glow Studio",
    content: "NeuroStrom transformed our operations. The AI stylist assistant alone has increased our retail sales by 35%. It's luxury and tech in perfect harmony.",
    avatar: "ER"
  },
  {
    name: "Julian Chen",
    role: "COO, Zen Collective",
    content: "Managing 12 branches was a nightmare until we integrated NeuroStrom. The real-time emotion tracking gives us insights we never thought possible.",
    avatar: "JC"
  },
  {
    name: "Sarah Miller",
    role: "Art Director, Muse Salon",
    content: "Finally, a software that understands the aesthetic of beauty. It feels like it was designed by stylists, for stylists, with the brain of a scientist.",
    avatar: "SM"
  }
];

const plans = [
  {
    name: "Boutique",
    price: "199",
    features: ["Up to 3 Branches", "Basic AI Assistant", "Customer Passport", "SOP Guidance"],
    accent: "border-sage/20"
  },
  {
    name: "Empire",
    price: "499",
    popular: true,
    features: ["Unlimited Branches", "Full AI Stylist Suite", "Emotion Analytics", "Quality Score Engine", "Priority Support"],
    accent: "border-lavender/40"
  },
  {
    name: "Custom",
    price: "Talk",
    features: ["White-label App", "On-site Training", "Dedicated AI Model", "Full API Access"],
    accent: "border-blush/20"
  }
];

export default function Pricing() {
  return (
    <>
      {/* Testimonials */}
      <section className="py-24 bg-soft-gradient overflow-hidden">
        <div className="container px-6 mx-auto">
          <div className="flex flex-wrap justify-center gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-2rem)] glass p-8 rounded-3xl border-white/50"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-lavender text-lavender" />)}
                </div>
                <p className="text-foreground/70 mb-6 italic">&quot;{t.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender to-blush flex items-center justify-center text-white font-bold text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-[10px] text-foreground/40 uppercase font-bold">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Luxury <span className="text-gradient">Pricing</span></h2>
            <p className="text-foreground/60">Choose the plan that fits your vision.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-10 rounded-[3rem] border-2 glass transition-all hover:scale-[1.05] ${plan.popular ? 'border-lavender shadow-2xl shadow-lavender/10' : plan.accent}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-lavender text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> MOST POPULAR
                  </div>
                )}
                <div className="text-xl font-bold mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  {plan.price !== "Talk" && <span className="text-foreground/40">/month</span>}
                </div>
                <div className="space-y-4 mb-10">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-sage" />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
                <button className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular ? 'bg-gradient-to-r from-lavender to-blush text-white shadow-xl shadow-lavender/20' : 'bg-cream text-foreground/80 border border-white'}`}>
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
