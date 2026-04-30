import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { dealers } = await req.json();

    if (!dealers || dealers.length === 0) {
      return NextResponse.json({ error: "Missing dealers array" }, { status: 400 });
    }

    // Limit to 10 for safety in prototype (can batch in production)
    const dealersToScore = dealers.slice(0, 10);

    const systemPrompt = `You are JSK AutoAdvisor. Score each dealer from 0-100 based on: average rating (40%), number of reviews (20%), years of experience (20%), and specializations value (20%).
    Return a JSON array of objects, with EXACTLY these keys:
    [
      { "dealer_id": "uuid", "ai_score": 95, "recommendation_reason": "2 sentences max." }
    ]
    Do not return anything outside the JSON array.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: JSON.stringify(dealersToScore.map((d: any) => ({
            id: d.id,
            rating: d.average_rating,
            reviews: d.total_reviews,
            experience: d.years_experience,
            specializations: d.specializations,
          })))
        }
      ]
    });

    const aiText = (response.content[0] as any).text;
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON array from AI response");
    }

    const scores = JSON.parse(jsonMatch[0]);

    // Batch update Supabase
    const updates = scores.map((scoreObj: any) => 
      supabase.from('dealers').update({
        ai_score: scoreObj.ai_score,
        ai_recommendation_reason: scoreObj.recommendation_reason
      }).eq('id', scoreObj.dealer_id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true, updatedCount: scores.length });

  } catch (error) {
    console.error("AI Scoring Error:", error);
    return NextResponse.json({ error: "AI scoring failed" }, { status: 500 });
  }
}
