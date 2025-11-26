import { NextResponse } from "next/server";
import { getActiveFunnels } from "@/lib/funnelStore";
import { buildCreatorForecast, OrderEvent } from "@/lib/forecast";

export const runtime = "nodejs";

export async function GET() {
  const funnels = getActiveFunnels();

  const forecasts = funnels.map((f) => {
    const orderEvents = ((f as any).orderEvents ?? []) as OrderEvent[];
    return buildCreatorForecast(f.creatorId, f.creatorName, orderEvents);
  });

  return NextResponse.json({ forecasts });
}
