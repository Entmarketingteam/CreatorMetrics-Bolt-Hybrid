import { NextRequest, NextResponse } from "next/server";
import { getUploads, logUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ uploads: getUploads() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const files = (body.files as string[]) ?? [];
  const creatorsDetected = Number(body.creatorsDetected ?? 0);
  const status =
    body.status === "failed" ? ("failed" as const) : ("processed" as const);

  const rec = logUpload(files, creatorsDetected, status);
  return NextResponse.json(rec);
}
