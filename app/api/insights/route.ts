import { NextRequest, NextResponse } from "next/server";
import {
  getActiveFunnels,
  getPrimaryFunnel,
  getMode,
  hasRealFunnels,
} from "@/lib/funnelStore";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const question = (body.question as string | undefined)?.trim() ?? "";

  const funnels = getActiveFunnels();
  const primary = getPrimaryFunnel();
  const mode = getMode();
  const hasReal = hasRealFunnels();

  if (!primary) {
    return NextResponse.json(
      { error: "No funnel data available yet." },
      { status: 400 }
    );
  }

  const totalRevenue = primary.revenueByPlatform.reduce(
    (s, r) => s + (r.revenue ?? 0),
    0
  );
  const totalOrders = primary.revenueByPlatform.reduce(
    (s, r) => s + (r.orders ?? 0),
    0
  );
  const totalClicks = primary.revenueByPlatform.reduce(
    (s, r) => s + (r.clicks ?? 0),
    0
  );

  const bestPlatform = [...primary.revenueByPlatform].sort(
    (a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)
  )[0];

  let worstStage: string | null = null;
  let worstDropPct = 0;

  for (let i = 1; i < primary.funnel.length; i++) {
    const prev = primary.funnel[i - 1];
    const curr = primary.funnel[i];
    if (!prev?.value) continue;
    const drop = (prev.value - curr.value) / prev.value;
    if (drop > worstDropPct) {
      worstDropPct = drop;
      worstStage = curr.stage;
    }
  }

  const creatorRankings =
    funnels.length > 1
      ? funnels
          .map((f) => ({
            creatorId: f.creatorId,
            creatorName: f.creatorName,
            revenue: f.revenueByPlatform.reduce(
              (s, r) => s + (r.revenue ?? 0),
              0
            ),
            orders: f.revenueByPlatform.reduce(
              (s, r) => s + (r.orders ?? 0),
              0
            ),
            clicks: f.revenueByPlatform.reduce(
              (s, r) => s + (r.clicks ?? 0),
              0
            ),
          }))
          .sort((a, b) => b.revenue - a.revenue)
      : [];

  const lines: string[] = [];

  lines.push(
    `Creator: ${primary.creatorName} (${mode === "real" && hasReal ? "Live data" : "Demo data"})`
  );
  lines.push(
    `Total revenue this period: $${totalRevenue.toLocaleString()} · Orders: ${totalOrders.toLocaleString()} · Clicks: ${totalClicks.toLocaleString()}`
  );

  if (bestPlatform) {
    lines.push(
      `Top platform: ${bestPlatform.platform.toUpperCase()} with $${bestPlatform.revenue.toLocaleString()} in revenue and ${bestPlatform.orders.toLocaleString()} orders.`
    );
  }

  if (worstStage && worstDropPct > 0) {
    lines.push(
      `Biggest drop in the funnel is at stage: ${worstStage.toUpperCase()} (approx. ${(worstDropPct * 100).toFixed(
        1
      )}% drop from previous stage).`
    );
  }

  lines.push("");
  lines.push("What to focus on next:");

  if (worstStage === "clicks" || worstStage === "dpv") {
    lines.push(
      "- Improve hooks and thumbnails on IG/LTK posts to drive more clicks and detail page views."
    );
  } else if (worstStage === "atc") {
    lines.push(
      "- Focus on on-page persuasion (social proof, urgency, clearer benefits) to turn views into add-to-cart."
    );
  } else if (worstStage === "orders") {
    lines.push(
      "- Test better offers and bundles at checkout to convert carts into orders."
    );
  } else {
    lines.push(
      "- Overall funnel is relatively balanced; focus on increasing top-of-funnel reach while preserving current conversion rates."
    );
  }

  if (bestPlatform?.platform === "amazon") {
    lines.push(
      "- Amazon is carrying most of the revenue. Consider sending more traffic to high converting Amazon products and doubling down on that content format."
    );
  } else if (bestPlatform?.platform === "ltk") {
    lines.push(
      "- LTK is performing best. Test more LTK-first content and deepen relationships with your top LTK brands."
    );
  }

  if (creatorRankings.length > 1) {
    lines.push("");
    lines.push("Multi-creator view (ranked by revenue):");
    creatorRankings.forEach((c, idx) => {
      lines.push(
        `${idx + 1}. ${c.creatorName} – $${c.revenue.toLocaleString()} · ${
          c.orders
        } orders · ${c.clicks} clicks`
      );
    });
  }

  if (question) {
    lines.push("");
    lines.push(`Question: ${question}`);
    lines.push(
      "(This answer is computed directly from your normalized funnel data.)"
    );
  }

  return NextResponse.json({
    text: lines.join("\n"),
    stats: {
      mode,
      hasReal,
      primaryCreatorId: primary.creatorId,
      totalRevenue,
      totalOrders,
      totalClicks,
      bestPlatform,
      worstStage,
      worstDropPct,
      creatorRankings,
    },
  });
}
