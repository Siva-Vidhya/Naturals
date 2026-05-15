import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { analysisData } = await req.json();

    // In a real production app, you would call Gemini or OpenAI here.
    // Example with Gemini:
    // const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const result = await model.generateContent(prompt);
    
    // For now, we will use a sophisticated prompt-based mock that simulates AI logic
    // based on the provided analysis data.
    
    const recommendations = generateAIRecommendations(analysisData);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

function generateAIRecommendations(data: any) {
  const { faceShape, skinTone } = data;
  
  let hairstyles: string[] = [];
  let colors: string[] = [];
  
  if (faceShape === "Oval") {
    hairstyles = ["Blunt Bob", "Long Waves", "Shoulder Length Shag"];
  } else if (faceShape === "Round") {
    hairstyles = ["Pixie Cut", "Long Layers", "Side-Swept Bangs"];
  } else {
    hairstyles = ["A-Line Bob", "Textured Crop", "Curtain Bangs"];
  }

  if (skinTone === "Fair") {
    colors = ["Strawberry Blonde", "Platinum Ash", "Soft Rose"];
  } else if (skinTone === "Medium") {
    colors = ["Caramel Balayage", "Golden Brown", "Honey Highlights"];
  } else {
    colors = ["Chestnut", "Deep Burgundy", "Icy Espresso"];
  }

  return {
    hairstyles,
    colors,
    treatments: ["Deep Hydration Mask", "Scalp Detox Serum", "Keratin Protection"],
    products: ["NeuroGlow Peptide Serum", "SilkProtein Shampoo", "ScalpRevive Tonic"],
    insights: [
      `Your ${faceShape} face shape is perfectly balanced for ${hairstyles[0]}.`,
      `The ${colors[0]} tone will beautifully complement your ${skinTone} skin.`,
      "Scalp health is optimal, maintaining current hydration is key."
    ]
  };
}
