import { NextRequest, NextResponse } from "next/server";
import { createShare } from "@/lib/shares";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const creatorId = (body.creatorId as string | undefined)?.trim();
  if (!creatorId) {
    return NextResponse.json({ error: "creatorId is required" }, { status: 400 });
  }
  const share = createShare(creatorId);
  return NextResponse.json(share);
}
