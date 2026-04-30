import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { query, dealers } = await req.json();

    if (!query || !dealers) {
      return NextResponse.json({ error: "Missing query or dealers array" }, { status: 400 });
    }

    // Prepare a simplified dealer list to save tokens
    const simplifiedDealers = dealers.map((d: any) => ({
      id: d.id,
      name: d.name,
      city: d.city,
      state: d.state,
      type: d.dealer_type,
      specializations: d.specializations,
      rating: d.average_rating,
      experience: d.years_experience,
    }));

    const systemPrompt = `You are JSK AutoAdvisor, an expert in Indian automobile dealers. 
    Given a list of dealers with their ratings, specializations, location, and years of experience, 
    recommend the TOP 3 best dealers for the user's specific need. 
    Return ONLY a JSON object with a 'recommendations' array. Each item should have:
    - dealer_id (string)
    - rank (number 1-3)
    - confidence_score (number 0-100)
    - reason (string, 2 sentences max in simple English)
    - match_tags (array of strings, e.g., ["honda", "pune", "ac repair"])`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `User query: "${query}"\n\nAvailable Dealers:\n${JSON.stringify(simplifiedDealers, null, 2)}`
        }
      ]
    });

    // Extract JSON block from response
    const aiText = (response.content[0] as any).text;
    
    // Find the JSON block in the AI output
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    } else {
      throw new Error("Failed to parse JSON from AI response");
    }

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return NextResponse.json({ error: "AI service failed" }, { status: 500 });
  }
}
