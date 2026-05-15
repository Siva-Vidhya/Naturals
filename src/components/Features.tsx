"use client";

import { motion } from "framer-motion";
import { 
  Fingerprint, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  BarChart3, 
  Smile 
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Beauty Passport",
    description: "Personalized digital identity for every client, tracking their preferences, history, and style evolution.",
    icon: Fingerprint,
    color: "bg-blush",
  },
  {
    title: "AI Stylist Assistant",
    description: "Real-time AI recommendations for hair, makeup, and skin based on facial analysis and trends.",
    icon: Sparkles,
    color: "bg-lavender",
  },
  {
    title: "Quality Score Engine",
    description: "Measure service quality with AI-driven visual audits and customer feedback loops.",
    icon: ShieldCheck,
    color: "bg-sage",
  },
  {
    title: "Smart SOP Guidance",
    description: "Dynamic operational guides that adapt to your salon's daily needs and team performance.",
    icon: BookOpen,
    color: "bg-peach",
  },
  {
    title: "Multi-Branch Analytics",
    description: "Birds-eye view of your entire empire with real-time performance tracking across all locations.",
    icon: BarChart3,
    color: "bg-cream",
  },
  {
    title: "Customer Emotion Tracking",
    description: "Understand how your clients feel. Analyze sentiment and satisfaction through subtle AI signals.",
    icon: Smile,
    color: "bg-beige",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white/50">
      <div className="container px-6 mx-auto">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-4xl font-bold tracking-tight md:text-5xl"
          >
            Luxury Meets <span className="text-gradient">Intelligence</span>
          </motion.h2>
          <p className="text-lg text-foreground/60">
            NeuroStrom combines premium beauty aesthetics with state-of-the-art AI to transform how you run your salon.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-8 transition-all glass rounded-3xl group hover:shadow-2xl hover:shadow-lavender/10 border-white/40"
            >
              <div className={cn(
                "flex items-center justify-center w-14 h-14 mb-6 rounded-2xl shadow-inner",
                feature.color
              )}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">{feature.title}</h3>
              <p className="leading-relaxed text-foreground/60">
                {feature.description}
              </p>
              <div className="mt-6">
                <button className="flex items-center gap-1 text-sm font-bold text-lavender group-hover:gap-2 transition-all">
                  Learn more <span className="text-lg">→</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
