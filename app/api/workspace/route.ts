import { NextRequest, NextResponse } from "next/server";
import { loadWorkspace, saveWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET() {
  const ws = loadWorkspace();
  return NextResponse.json(ws);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const { name, managesMultipleCreators, connectedPlatforms } = body ?? {};

  const ws = saveWorkspace({
    name: typeof name === "string" && name.trim() ? name.trim() : undefined,
    managesMultipleCreators:
      typeof managesMultipleCreators === "boolean"
        ? managesMultipleCreators
        : undefined,
    connectedPlatforms:
      connectedPlatforms && typeof connectedPlatforms === "object"
        ? connectedPlatforms
        : undefined,
  });

  return NextResponse.json(ws);
}
