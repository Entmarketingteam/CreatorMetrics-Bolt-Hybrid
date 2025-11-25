import { NextRequest, NextResponse } from "next/server";
import { getBilling, updatePlan } from "@/lib/billing";

export async function GET() {
  return NextResponse.json({
    billing: getBilling()
  });
}

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();

    if (!["free", "pro", "agency"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    const updated = updatePlan(plan);
    return NextResponse.json({ billing: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Failed to update plan." },
      { status: 400 }
    );
  }
}
