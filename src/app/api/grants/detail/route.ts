import { NextRequest, NextResponse } from "next/server";
import { fetchGrantDetail } from "@/lib/grants-api";

export async function GET(req: NextRequest) {
  try {
    const oppId = req.nextUrl.searchParams.get("oppId");
    if (!oppId) {
      return NextResponse.json({ error: "oppId required" }, { status: 400 });
    }
    const grant = await fetchGrantDetail(oppId);
    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }
    return NextResponse.json({ grant });
  } catch (error) {
    console.error("Grant detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch grant details" },
      { status: 500 }
    );
  }
}
