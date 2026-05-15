import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    // Context contains customer data, scan results, etc.
    const lastMessage = messages[messages.length - 1].text;

    // Simulate AI response based on context
    const response = generateAIResponse(lastMessage, context);

    return NextResponse.json({ text: response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

function generateAIResponse(message: string, context: any) {
  const msg = message.toLowerCase();
  const customer = context?.customer || { name: "the customer" };

  if (msg.includes("haircut") || msg.includes("style")) {
    return `Based on ${customer.name}'s Oval face shape and high facial symmetry, I recommend a Textured Pixie or a Layered Bob to emphasize her cheekbones.`;
  }
  if (msg.includes("color") || msg.includes("tone")) {
    return `Her light neutral skin tone matches perfectly with Cool Ash Blonde or Soft Rose Gold. Avoid warm copper tones as they might clash with her undertone.`;
  }
  if (msg.includes("treatment") || msg.includes("fall")) {
    return `I see some minor scalp irritation in the latest scan. A Scalp Detox Serum followed by a Deep Hydration Mask would be ideal today.`;
  }
  if (msg.includes("product")) {
    return `For home care, she should use the SilkProtein Shampoo and ScalpRevive Tonic. These will maintain the molecular seal we're applying today.`;
  }

  return `I've analyzed ${customer.name}'s profile. Her last visit was excellent. Today we should focus on ${context?.focus || "moisture recovery"}. How can I assist you with the SOP?`;
}
