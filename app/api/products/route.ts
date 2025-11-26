import { NextResponse } from "next/server";
import { getActiveFunnels } from "@/lib/funnelStore";

export const runtime = "nodejs";

export async function GET() {
  const funnels = getActiveFunnels();

  const out = [];

  for (const f of funnels) {
    const items = (f as any).products ?? [];

    const top = items
      .map((i: any) => ({
        creatorId: f.creatorId,
        creatorName: f.creatorName,
        asin: i.asin,
        title: i.title,
        clicks: i.clicks,
        orders: i.orders,
        revenue: i.revenue,
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    out.push(...top);
  }

  return NextResponse.json({ products: out });
}
