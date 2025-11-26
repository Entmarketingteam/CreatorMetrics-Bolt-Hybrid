import { NextResponse } from "next/server";
import { getActiveFunnels } from "@/lib/funnelStore";

export const runtime = "nodejs";

export async function GET() {
  const funnels = getActiveFunnels();

  const data = funnels.map((f) => {
    const orders = (f as any).orderEvents ?? [];
    const cohortMap: Record<string, number> = {};

    for (const o of orders) {
      const month = o.date.slice(0, 7);
      cohortMap[month] = (cohortMap[month] ?? 0) + 1;
    }

    return {
      creatorId: f.creatorId,
      creatorName: f.creatorName,
      cohorts: cohortMap,
    };
  });

  return NextResponse.json({ cohorts: data });
}
