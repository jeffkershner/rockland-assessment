import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const grant = await prisma.savedGrant.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ grant });
  } catch (error) {
    console.error("Grant update error:", error);
    return NextResponse.json(
      { error: "Failed to update grant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.savedGrant.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Grant delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete grant" },
      { status: 500 }
    );
  }
}
