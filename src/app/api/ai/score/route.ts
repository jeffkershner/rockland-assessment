import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { grantId, grantTitle, grantDescription, grantAgency, awardCeiling } =
      await req.json();

    const profile = await prisma.orgProfile.findFirst();
    const orgContext = profile
      ? `Organization: ${profile.name}. Clinical focus: ${profile.clinicalFocus}. Population served: ${profile.populationServed}. Annual budget: ${profile.annualBudget}. State: ${profile.state}. Current funders: ${profile.existingGrants}.`
      : "A Federally Qualified Health Center (FQHC) serving low-income and Medicaid patients with primary care, behavioral health, and dental services.";

    const prompt = `You are an expert grant consultant for Federally Qualified Health Centers (FQHCs).

Organization context:
${orgContext}

Grant opportunity:
Title: ${grantTitle}
Agency: ${grantAgency}
Max Award: ${awardCeiling ? `$${Number(awardCeiling).toLocaleString()}` : "Not specified"}
Description: ${grantDescription?.slice(0, 2000) ?? "No description available"}

Analyze this grant opportunity for this FQHC and respond with ONLY valid JSON in this exact format:
{
  "score": <integer 0-100>,
  "verdict": "<one of: Strong Fit | Possible Fit | Poor Fit>",
  "why": "<2-3 sentences explaining the score>",
  "keyRequirements": ["<requirement 1>", "<requirement 2>", "<requirement 3>"],
  "redFlags": ["<red flag 1 if any>"],
  "nextStep": "<single most important next action for the grants manager>"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    let result;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      result = JSON.parse(clean);
    } catch {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { error: "AI returned malformed response", raw: text },
        { status: 502 }
      );
    }

    // Persist score to saved grant if it exists
    await prisma.savedGrant.updateMany({
      where: { grantId },
      data: {
        aiScore: result.score,
        aiSummary: result.why,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI scoring error:", error);
    return NextResponse.json(
      { error: "Failed to score grant" },
      { status: 500 }
    );
  }
}
