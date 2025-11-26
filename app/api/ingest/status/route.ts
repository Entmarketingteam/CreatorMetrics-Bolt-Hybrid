import { NextResponse } from "next/server";
import { getQueue } from "@/lib/ingestQueue";

export const runtime = "nodejs";

export async function GET() {
  const queue = getQueue();
  return NextResponse.json({ queue });
}
