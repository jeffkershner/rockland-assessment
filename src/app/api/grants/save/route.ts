import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const grant = await prisma.savedGrant.upsert({
      where: { grantId: body.grantId },
      create: {
        grantId: body.grantId,
        title: body.title,
        agency: body.agency,
        description: body.description ?? "",
        deadline: body.deadline,
        awardFloor: body.awardFloor,
        awardCeiling: body.awardCeiling,
        opportunityNumber: body.opportunityNumber,
        status: "RESEARCHING",
      },
      update: {},
    });
    return NextResponse.json({ grant });
  } catch (error) {
    console.error("Grant save error:", error);
    return NextResponse.json(
      { error: "Failed to save grant" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const grants = await prisma.savedGrant.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ grants });
  } catch (error) {
    console.error("Grant list error:", error);
    return NextResponse.json(
      { error: "Failed to list grants" },
      { status: 500 }
    );
  }
}
