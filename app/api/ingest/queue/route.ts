import { NextRequest, NextResponse } from "next/server";
import { enqueueJob, getQueue } from "@/lib/ingestQueue";

export const runtime = "nodejs";

export async function GET() {
  const queue = getQueue();
  return NextResponse.json({ queue });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const files = (body.files as string[]) ?? [];
  if (!files.length) {
    return NextResponse.json(
      { error: "files array required" },
      { status: 400 }
    );
  }

  const job = enqueueJob(files);
  return NextResponse.json(job);
}
