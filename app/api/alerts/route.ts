import { NextRequest, NextResponse } from "next/server";
import {
  getAlerts,
  recomputeAlertsFromFunnels,
  CreatorFunnel,
} from "@/lib/alerts";
import { getActiveFunnels } from "@/lib/funnelStore";

export const runtime = "nodejs";

export async function GET() {
  const alerts = getAlerts();
  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  void req;

  const funnels = getActiveFunnels() as unknown as CreatorFunnel[];
  const alerts = recomputeAlertsFromFunnels(funnels);
  return NextResponse.json({ alerts });
}
