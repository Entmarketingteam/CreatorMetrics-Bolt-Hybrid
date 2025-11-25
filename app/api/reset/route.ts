import { NextResponse } from "next/server";
import { resetToDemo } from "@/lib/funnelStore";

export async function POST() {
  resetToDemo();
  return NextResponse.json({ ok: true });
}
