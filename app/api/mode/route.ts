import { NextRequest, NextResponse } from "next/server";
import { getMode, setMode, hasRealFunnels } from "@/lib/funnelStore";

export async function GET() {
  return NextResponse.json({
    mode: getMode(),
    hasReal: hasRealFunnels(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const requestedMode =
    body.mode === "real" || body.mode === "demo" ? body.mode : "demo";

  if (requestedMode === "real" && !hasRealFunnels()) {
    return NextResponse.json(
      {
        mode: getMode(),
        hasReal: hasRealFunnels(),
        error: "No real funnels available yet. Upload data first.",
      },
      { status: 400 }
    );
  }

  setMode(requestedMode);

  return NextResponse.json({
    mode: getMode(),
    hasReal: hasRealFunnels(),
  });
}
