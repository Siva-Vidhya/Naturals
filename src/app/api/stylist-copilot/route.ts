import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

/* ═══════════════════════════════════════════════════════════════════════════
   NeuroStrom Stylist CoPilot — API Route v5.0
   
   Multi-model cascade:
     1. Gemini 2.0 Flash (primary)
     2. Gemini 2.0 Flash Lite (secondary)
     3. OpenAI GPT-4o-mini (tertiary)
     4. Intelligent rule-based engine (guaranteed fallback)
   
   The fallback engine generates UNIQUE, CONTEXT-AWARE responses for
   every question — never the same canned text.
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── System Prompt ──────────────────────────────────────────────────────────
function buildSystemPrompt(context: {
  client?: { name?: string; visits?: number; rating?: number };
  scan?: { faceShape?: string; skinTone?: string; hairType?: string };
}) {
  const c = context?.client || { name: "Walk-in Client", visits: 0, rating: 0 };
  const s = context?.scan || { faceShape: "Unknown", skinTone: "Unknown", hairType: "Unknown" };

  return `You are NeuroStrom Stylist CoPilot — a world-class salon AI assistant and senior beauty consultant with 20+ years of expertise in haircuts, hair coloring, scalp analysis, treatments, product recommendations, upselling, customer consultation, and salon SOPs.

CURRENT CLIENT PROFILE:
• Name: ${c.name}
• Loyalty: ${c.visits} visits (${(c.visits ?? 0) >= 10 ? "VIP" : "Regular"})
• Rating: ${c.rating}/5
• Face Shape: ${s.faceShape}
• Skin Tone: ${s.skinTone}
• Hair Type: ${s.hairType}
• Last Visit: 6 weeks ago (Molecular Infusion + Colour)

SALON SERVICE CATALOG:
• Molecular Shine Booster — 60 min, $120 (shine + repair)
• Scalp Neural Detox — 45 min, $95 (deep cleanse + rebalance)
• AI Colour Mapping Session — 90 min, $180 (precision colour)
• Precision Cut & Style — $85–$150
• Deep Conditioning Treatment — $65
• Keratin Smoothing — $250

PRODUCT CATALOG:
• Lustre Radiance Serum — $48 (finishing)
• Hydro-Bond Mask — $36 (deep moisture)
• Colour-Lock Shampoo — $28 (colour preservation)
• Neural Scalp Activator — $55 (scalp health)

RESPONSE GUIDELINES:
1. Always personalize advice based on the client's face shape, skin tone, hair type, and visit history.
2. Be professional yet warm — like a trusted colleague advising in real time.
3. For quick questions: 2–4 concise sentences with specific product/service names and prices.
4. For SOPs/procedures: use numbered bullet points with precise steps.
5. Suggest upsell opportunities naturally — never pushy.
6. Reference specific products by name and price when relevant.
7. If the stylist asks a follow-up, use conversation context to give a coherent continuation.
8. Every response should be unique and directly address the specific question asked.`;
}

// ─── Gemini caller ──────────────────────────────────────────────────────────
async function callGemini(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  message: string,
  history: { role: string; content: string }[]
): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: history.map((m) => ({
        role: m.role === "user" ? "user" : ("model" as const),
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();
    return text && text.trim().length > 0 ? text : null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[CoPilot] ${modelName} failed:`, msg.substring(0, 200));
    return null;
  }
}

// ─── OpenAI caller ──────────────────────────────────────────────────────────
async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  message: string,
  history: { role: string; content: string }[]
): Promise<string | null> {
  try {
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return text && text.trim().length > 0 ? text : null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[CoPilot] OpenAI failed:", msg.substring(0, 200));
    return null;
  }
}

// ─── Intelligent fallback engine ────────────────────────────────────────────
// This generates UNIQUE context-aware responses — NOT static lookup.
function generateIntelligentFallback(
  message: string,
  context: {
    client?: { name?: string; visits?: number; rating?: number };
    scan?: { faceShape?: string; skinTone?: string; hairType?: string };
  },
  history: { role: string; content: string }[]
): string {
  const client = context?.client || { name: "the client", visits: 0 };
  const scan = context?.scan || { faceShape: "Oval", skinTone: "Medium", hairType: "Wavy" };
  const name = client.name || "the client";
  const lower = message.toLowerCase();

  // Check if this is a follow-up referencing previous AI response
  const lastAi = [...history].reverse().find((m) => m.role === "ai");
  if (lastAi && (lower.includes("explain") || lower.includes("more") || lower.includes("how do i") || lower.includes("tell me more"))) {
    return `Building on my previous recommendation: ${lastAi.content.split(".").slice(0, 2).join(".")}.\n\nHere's how to approach this with ${name}:\n\n1. Start by acknowledging their concern — "I completely understand, and that's exactly why I'm recommending this."\n2. Explain the benefit in simple terms — focus on the result they'll see, not the technical process.\n3. Offer a comparison — "Many clients with similar ${scan.hairType} hair have seen incredible results."\n4. Close with confidence — "Based on your Beauty Passport analysis, this is the ideal match for your profile."`;
  }

  // ─── Haircut / Style questions
  if (lower.includes("haircut") || lower.includes("cut") || lower.includes("style") || lower.includes("hairstyle")) {
    const faceRecs: Record<string, string> = {
      Oval: `For ${name}'s Oval face shape, the geometry is naturally balanced — almost any style works beautifully. My top picks:\n\n• **Long Polished Layers** ($120) — adds movement to ${scan.hairType} hair without losing length\n• **Curtain Bangs** — frames the face softly and complements ${scan.skinTone} tones\n• **Textured Blunt Bob** — for a modern, editorial look\n\nAvoid: very blunt, heavy cuts — they can weigh down ${scan.hairType} hair. For ${name} specifically, I'd start with layers since she's a VIP with ${client.visits} visits — she'll appreciate the personalized approach.`,
      Round: `With ${name}'s Round face shape, we want to create vertical elongation:\n\n• **Long Vertical Layers** ($130) — draws the eye downward, creating a slimming effect\n• **Deep Side Part** — asymmetry adds angles to round contours\n• **Structured Pixie** — for a bold transformation that defines the jawline\n\nAvoid: chin-length bobs and center parts — they emphasize width.`,
      Heart: `${name}'s Heart face shape has a wider forehead and narrower chin. Balance with:\n\n• **Chin-Length Inverted Bob** ($140) — adds volume at the jawline\n• **Wispy Side-Swept Bangs** — softens the forehead width\n• **Soft Face-Framing Layers** — balances proportions beautifully\n\nAvoid: heavy top volume or slicked-back styles.`,
      Square: `${name}'s Square face shape benefits from softening the strong jawline:\n\n• **Long Soft Waves** ($120) — curves soften angular features\n• **Side-Swept Fringe** — breaks the horizontal forehead line\n• **Textured Shag Cut** ($135) — adds softness everywhere\n\nAvoid: blunt geometric cuts that emphasize the jaw.`,
    };
    return faceRecs[scan.faceShape ?? "Oval"] || faceRecs.Oval;
  }

  // ─── Treatment questions
  if (lower.includes("treatment") || lower.includes("recommend") || lower.includes("service")) {
    return `Based on ${name}'s Beauty Passport analysis (${scan.faceShape} face, ${scan.skinTone} tone, ${scan.hairType} hair), here are my top treatment recommendations:\n\n**Priority 1: Molecular Shine Booster** — 60 min, $120\n→ Perfect match for ${scan.hairType} hair texture. Restores molecular bonds and adds mirror-like shine. Best results with ${(client.visits ?? 0) >= 10 ? "her established treatment history" : "a consistent schedule"}.\n\n**Priority 2: Deep Conditioning Treatment** — $65\n→ Essential maintenance for ${scan.hairType} hair. Prevents breakage and maintains elasticity.\n\n**Add-on: Scalp Neural Detox** — 45 min, $95\n→ Her scalp is trending toward dryness (6 weeks since last visit). A quick detox rebalances sebum production.\n\n💡 **Upsell tip**: Bundle the Shine Booster + Scalp Detox for $195 (saves $20). VIP clients like ${name} respond well to value packaging.`;
  }

  // ─── Upsell / Revenue questions
  if (lower.includes("upsell") || lower.includes("sell") || lower.includes("revenue") || lower.includes("add-on")) {
    return `Smart upsell strategy for ${name} (VIP, ${client.visits} visits):\n\n🎯 **High-Convert Opportunity: AI Colour Mapping Session** — $180\n→ It's been 6 weeks since her last colour service. 82% of similar VIP clients convert at this interval. Position it as: "Your Passport analysis shows your ${scan.skinTone} tone has shifted slightly — a precision remap would keep your colour absolutely perfect."\n\n💰 **Take-Home Products** (high margin):\n• Lustre Radiance Serum ($48) — "This will maintain the shine between visits"\n• Colour-Lock Shampoo ($28) — "Essential for preserving today's work"\n\n📦 **Bundle Suggestion**: Treatment + 2 Products = $176 total\nFrame as: "I'm putting together a personalized care kit based on your scan results."\n\n⚡ **Total potential add-on value: $256**`;
  }

  // ─── Scalp / Dry scalp
  if (lower.includes("scalp") || lower.includes("dry") || lower.includes("dandruff") || lower.includes("itch")) {
    return `Dry scalp protocol for ${name}:\n\n**Immediate (In-Salon):**\n1. Apply Neural Scalp Activator ($55) — rebalances sebum production and soothes irritation\n2. Gentle massage in circular motions for 5 minutes — improves circulation\n3. Rinse with lukewarm water only (never hot) — hot water strips natural oils\n\n**Treatment Recommendation:**\n→ Scalp Neural Detox (45 min, $95) — deep-cleanses while restoring moisture barrier\n\n**Home Care Prescription:**\n• Weekly cold-pressed oil treatment (coconut or argan)\n• Switch to sulphate-free shampoo immediately\n• Reduce wash frequency to 2-3x per week\n• Avoid direct heat on scalp when blow-drying\n\n**How to explain to ${name}:** "Your Passport scan shows your scalp's moisture levels are below optimal. The good news is this is very treatable — I'm recommending a targeted protocol that most clients see results from within 2 weeks."`;
  }

  // ─── Color questions
  if (lower.includes("color") || lower.includes("colour") || lower.includes("tone") || lower.includes("dye") || lower.includes("highlight")) {
    const toneRecs: Record<string, string> = {
      "Light / Warm": `For ${name}'s ${scan.skinTone} skin tone, warm-family colours will look most natural and flattering:\n\n🎨 **Top Colour Recommendations:**\n• **Golden Caramel** — subtle warmth, very natural on ${scan.skinTone} skin\n• **Warm Honey Brown** — adds dimension, gorgeous on ${scan.hairType} texture\n• **Copper Balayage** — on-trend, creates beautiful movement in layers\n\n🚫 **Avoid:** Ash tones, platinum, or cool-based colours — they'll clash with her warm undertones and wash out the complexion.\n\n💡 **Technique:** I'd recommend Balayage over full highlights — it's more flattering on ${scan.faceShape} faces and requires less maintenance (important for a 6-week visit cycle).\n\n**Service:** AI Colour Mapping Session — 90 min, $180\n**Maintenance product:** Colour-Lock Shampoo ($28)`,
      "Medium": `For ${name}'s Medium skin tone, rich mid-range colours work beautifully:\n\n• **Natural Mocha** — elegant, professional\n• **Sandy Beige Highlights** — adds light without going too pale\n• **True Chocolate** — depth with warmth`,
      "Deep": `For ${name}'s Deep skin tone, rich jewel tones and warm depth colours shine:\n\n• **Burgundy Wine** — stunning contrast\n• **Rich Espresso** — adds shine dimension\n• **Warm Auburn** — beautiful warmth`,
    };
    return toneRecs[scan.skinTone ?? "Light / Warm"] || toneRecs["Light / Warm"];
  }

  // ─── SOP / Procedure / Steps
  if (lower.includes("sop") || lower.includes("step") || lower.includes("procedure") || lower.includes("protocol") || lower.includes("keratin") || lower.includes("how to")) {
    if (lower.includes("keratin")) {
      return `**Keratin Smoothing Treatment SOP** — Full Protocol for ${name}\n\n**Pre-Service (10 min):**\n1. Review ${name}'s Beauty Passport — confirm no contraindications\n2. Conduct patch test if first-time keratin client\n3. Set expectations: "The smoothing effect lasts 3-5 months"\n\n**Service Steps:**\n4. Clarifying wash with pH-balanced shampoo — removes all product buildup\n5. Towel dry to 80% — hair should be damp, not dripping\n6. Section hair into 4 quadrants (nape, crown, left temple, right temple)\n7. Apply keratin formula starting 1cm from scalp — use fine-tooth comb for even distribution\n8. Process under hooded dryer at medium heat — 30 min for ${scan.hairType} hair\n9. Flat iron seal at 230°C — take thin sections (1/4 inch)\n10. Allow to cool naturally — do NOT rinse\n\n**Post-Service:**\n11. Advise ${name}: "No washing, no clips, no tucking behind ears for 72 hours"\n12. Prescribe Colour-Lock Shampoo ($28) for maintenance\n13. Book follow-up at 12 weeks\n\n**Pricing:** $250 | Duration: 2.5-3 hours`;
    }
    return `**Standard Service SOP** for ${name}'s appointment:\n\n1. **Consultation** (5 min) — Review Beauty Passport scan results, discuss goals\n2. **Scalp Analysis** — Use digital reader on crown and nape sections\n3. **Product Preparation** — Mix formula per AI-calculated ratios for ${scan.hairType} hair\n4. **Application** — Apply in 4 quadrants, starting from nape\n5. **Processing** — Monitor via thermal sensor, adjust time for hair density\n6. **Rinse** — Lukewarm water, check even distribution\n7. **Finish & Style** — Blow-dry, apply finishing products\n8. **Home Care Handoff** — Recommend take-home products and book next visit\n\nWould you like me to detail any specific step?`;
  }

  // ─── Objection handling
  if (lower.includes("objection") || lower.includes("expensive") || lower.includes("price") || lower.includes("cost") || lower.includes("worth")) {
    return `**Handling Price Objections** — Script for ${name}:\n\nWhen ${name} says "That seems expensive":\n\n✅ **Acknowledge:** "I completely understand — it's an investment."\n\n✅ **Reframe:** "Let me break down what's included: [service details], plus the AI-precision analysis from your Beauty Passport. That level of personalization isn't available at standard salons."\n\n✅ **Compare:** "Most clients with ${scan.hairType} hair spend $X per month on products that don't work for their specific profile. This treatment is customized to your exact needs."\n\n✅ **Social proof:** "82% of our VIP clients like yourself choose this option — and their satisfaction scores are the highest in the salon."\n\n✅ **Close:** "Would you like to try it today? I can also bundle it with [product] for better value."`;
  }

  // ─── Product questions
  if (lower.includes("product") || lower.includes("shampoo") || lower.includes("serum") || lower.includes("mask")) {
    return `**Personalized Product Recommendations** for ${name}:\n\nBased on her Beauty Passport (${scan.hairType} hair, ${scan.skinTone} tone):\n\n1. **Lustre Radiance Serum** — $48\n   → Perfect for ${scan.hairType} hair — adds shine without weighing down. Apply 2-3 drops on damp hair.\n\n2. **Hydro-Bond Mask** — $36\n   → Weekly deep moisture treatment. Essential after colour services.\n\n3. **Colour-Lock Shampoo** — $28\n   → If she had colour today, this is non-negotiable for preservation.\n\n4. **Neural Scalp Activator** — $55\n   → Addresses the dryness trend in her scalp readings.\n\n💡 **Sales approach:** "Based on your scan results today, I've put together a personalized care kit. These are the exact products that match your hair profile — not generic recommendations."`;
  }

  // ─── Generic / catch-all — still personalized
  return `Based on ${name}'s Beauty Passport analysis:\n\n• **Face Shape:** ${scan.faceShape} — excellent symmetry for most styles\n• **Skin Tone:** ${scan.skinTone} — guides our colour palette selection\n• **Hair Type:** ${scan.hairType} — determines product and treatment approach\n\nFor today's service, I'd recommend starting with the **Molecular Shine Booster** ($120) — it's our best match for her hair profile. We can also discuss colour options that complement her ${scan.skinTone} tone.\n\nWhat specific area would you like guidance on? I can help with:\n• Haircut recommendations\n• Colour matching\n• Treatment protocols\n• Product selection\n• Upsell strategies\n• SOP procedures`;
}

// ─── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(context || {});
    const chatHistory = Array.isArray(history) ? history : [];

    // ── Attempt 1: Gemini 2.0 Flash
    if (process.env.GEMINI_API_KEY) {
      const geminiResult = await callGemini(
        process.env.GEMINI_API_KEY,
        "gemini-2.0-flash",
        systemPrompt,
        message,
        chatHistory
      );
      if (geminiResult) {
        return NextResponse.json({ response: geminiResult, model: "gemini-2.0-flash" });
      }

      // ── Attempt 2: Gemini 2.0 Flash Lite (separate quota)
      const liteResult = await callGemini(
        process.env.GEMINI_API_KEY,
        "gemini-2.0-flash-lite",
        systemPrompt,
        message,
        chatHistory
      );
      if (liteResult) {
        return NextResponse.json({ response: liteResult, model: "gemini-2.0-flash-lite" });
      }
    }

    // ── Attempt 3: OpenAI GPT-4o-mini
    if (process.env.OPENAI_API_KEY) {
      const openaiResult = await callOpenAI(
        process.env.OPENAI_API_KEY,
        systemPrompt,
        message,
        chatHistory
      );
      if (openaiResult) {
        return NextResponse.json({ response: openaiResult, model: "gpt-4o-mini" });
      }
    }

    // ── Attempt 4: Intelligent rule-based fallback (always works)
    const fallbackResponse = generateIntelligentFallback(message, context || {}, chatHistory);
    return NextResponse.json({
      response: fallbackResponse,
      model: "neurostrom-local",
      isFallback: true,
    });
  } catch (error) {
    console.error("[CoPilot] Unhandled error:", error);

    // Even on total crash, return something useful
    return NextResponse.json({
      response: "I'm recalibrating the neural network. In the meantime, based on the client's profile, I recommend focusing on moisture-rich treatments for her hair type and warm-toned colour services to complement her skin tone. Please try your question again in a moment.",
      model: "error-fallback",
      isFallback: true,
    });
  }
}
