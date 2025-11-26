import { NextRequest, NextResponse } from "next/server";
import { createShare } from "@/lib/shares";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { creatorId } = await req.json().catch(() => ({}));

  if (!creatorId) {
    return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
  }

  const record = createShare(creatorId);
  return NextResponse.json(record);
}
