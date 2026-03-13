import { NextRequest, NextResponse } from "next/server";
import { searchGrants } from "@/lib/grants-api";

export async function POST(req: NextRequest) {
  try {
    const { keywords } = await req.json();
    if (!keywords?.trim()) {
      return NextResponse.json({ error: "keywords required" }, { status: 400 });
    }
    const grants = await searchGrants(keywords);
    return NextResponse.json({ grants });
  } catch (error) {
    console.error("Grant search error:", error);
    return NextResponse.json(
      { error: "Failed to search grants" },
      { status: 500 }
    );
  }
}
