import { NextResponse } from "next/server";
import { getActiveFunnels } from "@/lib/funnelStore";

export const runtime = "nodejs";

export async function GET() {
  const funnels = getActiveFunnels();

  const out = funnels.map((f) => {
    const revenue = f.revenueByPlatform.reduce(
      (a, p) => a + (p.revenue ?? 0),
      0
    );
    const orders = f.funnel.find((s) => s.stage === "orders")?.value ?? 0;

    const ltv = orders > 0 ? revenue / orders : 0;

    return {
      creatorId: f.creatorId,
      creatorName: f.creatorName,
      ltv,
      revenue,
      orders,
    };
  });

  return NextResponse.json({ ltv: out });
}
