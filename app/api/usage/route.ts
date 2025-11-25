import { NextResponse } from "next/server";
import { getUsage } from "@/lib/usage";
import { getBilling } from "@/lib/billing";

export async function GET() {
  const usage = getUsage();
  const billing = getBilling();

  return NextResponse.json({
    usage,
    limits: billing.limits,
    plan: billing.plan
  });
}
