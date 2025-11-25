import { NextRequest, NextResponse } from "next/server";
import {
  getActiveFunnels,
  getPrimaryFunnel,
  getSelectedCreatorId,
  getMode,
  hasRealFunnels,
} from "@/lib/funnelStore";

export const runtime = "nodejs";

type PlatformSummary = {
  platform: string;
  revenue: number;
  orders: number;
  clicks: number;
  revenueShare: number;
};

type FunnelAnalysis = {
  creatorId: string;
  creatorName: string;
  totalRevenue: number;
  totalOrders: number;
  totalClicks: number;
  bestPlatform?: PlatformSummary;
  worstPlatform?: PlatformSummary;
  biggestDropStage?: {
    stage: string;
    fromValue: number;
    toValue: number;
    dropPct: number;
  };
};

function humanStageLabel(stage: string): string {
  switch (stage.toLowerCase()) {
    case "impressions":
      return "Impressions";
    case "clicks":
      return "Clicks";
    case "dpv":
      return "Detail page views";
    case "atc":
      return "Add to cart";
    case "orders":
      return "Orders";
    default:
      return stage;
  }
}

function analyzeSingleFunnel(funnel: any): FunnelAnalysis {
  const creatorId = funnel.creatorId;
  const creatorName = funnel.creatorName;

  const totalRevenue = funnel.revenueByPlatform.reduce(
    (sum: number, r: any) => sum + (r.revenue ?? 0),
    0
  );
  const totalOrders = funnel.revenueByPlatform.reduce(
    (sum: number, r: any) => sum + (r.orders ?? 0),
    0
  );
  const totalClicks = funnel.revenueByPlatform.reduce(
    (sum: number, r: any) => sum + (r.clicks ?? 0),
    0
  );

  const platforms: PlatformSummary[] = funnel.revenueByPlatform.map(
    (r: any) => ({
      platform: r.platform,
      revenue: r.revenue ?? 0,
      orders: r.orders ?? 0,
      clicks: r.clicks ?? 0,
      revenueShare: 0,
    })
  );

  const totalRevForShare =
    platforms.reduce((sum, p) => sum + p.revenue, 0) || 1;

  for (const p of platforms) {
    p.revenueShare = p.revenue / totalRevForShare;
  }

  const bestPlatform =
    platforms.length > 0
      ? [...platforms].sort((a, b) => b.revenue - a.revenue)[0]
      : undefined;

  const worstPlatform =
    platforms.length > 0
      ? [...platforms].sort((a, b) => a.revenue - b.revenue)[0]
      : undefined;

  let biggestDropStage: FunnelAnalysis["biggestDropStage"] | undefined;
  const stages = funnel.funnel ?? [];

  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1];
    const curr = stages[i];
    const prevVal = prev?.value ?? 0;
    const currVal = curr?.value ?? 0;

    if (prevVal <= 0) continue;

    const dropPct = (prevVal - currVal) / prevVal;

    if (
      !biggestDropStage ||
      dropPct > (biggestDropStage.dropPct ?? -Infinity)
    ) {
      biggestDropStage = {
        stage: curr.stage,
        fromValue: prevVal,
        toValue: currVal,
        dropPct,
      };
    }
  }

  return {
    creatorId,
    creatorName,
    totalRevenue,
    totalOrders,
    totalClicks,
    bestPlatform,
    worstPlatform,
    biggestDropStage,
  };
}

function summarizeSingleFunnel(
  analysis: FunnelAnalysis,
  mode: "demo" | "real"
): string {
  const lines: string[] = [];

  const modeLine =
    mode === "real"
      ? "Using LIVE data from your latest upload."
      : "Using DEMO data. Upload IG / LTK / Amazon exports on the Upload tab to see your own numbers.";

  lines.push(
    `Creator: ${analysis.creatorName}`,
    modeLine,
    ""
  );

  lines.push(
    `Total revenue this period: $${analysis.totalRevenue.toLocaleString()} · ` +
      `Orders: ${analysis.totalOrders.toLocaleString()} · ` +
      `Clicks: ${analysis.totalClicks.toLocaleString()}`
  );

  if (analysis.bestPlatform) {
    const p = analysis.bestPlatform;
    lines.push(
      `Top platform: ${p.platform.toUpperCase()} with $${p.revenue.toLocaleString()} ` +
        `(${(p.revenueShare * 100).toFixed(1)}% of revenue) and ` +
        `${p.orders.toLocaleString()} orders.`
    );
  }

  if (analysis.biggestDropStage) {
    const d = analysis.biggestDropStage;
    const label = humanStageLabel(d.stage);
    lines.push(
      `Biggest funnel drop-off: ${label} – from ${d.fromValue.toLocaleString()} ` +
        `to ${d.toValue.toLocaleString()} (${(d.dropPct * 100).toFixed(
          1
        )}% drop).`
    );
  }

  lines.push("", "What to focus on next:");

  if (analysis.biggestDropStage) {
    const stage = analysis.biggestDropStage.stage.toLowerCase();
    const dropPct = analysis.biggestDropStage.dropPct;

    if (stage === "clicks" || stage === "dpv" || stage === "impressions") {
      lines.push(
        "- Top-of-funnel: hooks, thumbnails, and IG/Story CTAs. Test stronger headlines, curiosity, and clearer 'shop' language to drive more LTK/Amazon clicks."
      );
    } else if (stage === "atc") {
      lines.push(
        "- Mid-funnel: your product detail pages are being seen, but not enough people add to cart. Add clearer benefit bullets, creator quotes, social proof, and urgency (low stock, limited-time offers)."
      );
    } else if (stage === "orders") {
      lines.push(
        "- Bottom-of-funnel: people are adding to cart but dropping before purchase. Simplify checkout, reduce shipping/friction, or test better offers and bundles."
      );
    }

    if (dropPct > 0.5) {
      lines.push(
        "- This stage has an especially high drop (>50%). Make it your next experiment focus."
      );
    }
  }

  if (analysis.bestPlatform) {
    const p = analysis.bestPlatform;
    if (p.platform.toLowerCase() === "amazon") {
      lines.push(
        "- Amazon is carrying most of your revenue. Double down on high-converting Amazon links, storefront curation, and 'shop this list' content."
      );
    } else if (p.platform.toLowerCase() === "ltk") {
      lines.push(
        "- LTK is your main closer. Keep feeding it with fresh outfits, boards, and 'roundup' posts from IG and TikTok."
      );
    } else if (p.platform.toLowerCase() === "instagram") {
      lines.push(
        "- Instagram is driving the most revenue directly. Keep testing new Reels hooks, Story link formats, and pinning top performers."
      );
    }
  }

  if (!analysis.bestPlatform || analysis.totalRevenue === 0) {
    lines.push(
      "- Revenue is low or zero in this period. Start by ensuring tracking is set up correctly, then seed a few 'hero' posts to LTK/Amazon and re-run this insight after 7–14 days."
    );
  }

  return lines.join("\n");
}

function summarizeMultiCreator(
  analyses: FunnelAnalysis[],
  mode: "demo" | "real"
): string {
  if (!analyses.length) {
    return "No funnels found yet. Upload IG / LTK / Amazon exports on the Upload tab to generate creator funnels.";
  }

  const modeLine =
    mode === "real"
      ? "Using LIVE data for all detected creators."
      : "Using DEMO data for all creators.";

  const lines: string[] = [modeLine, ""];

  const sorted = [...analyses].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  lines.push("Creator ranking by revenue this period:");
  sorted.forEach((a, idx) => {
    lines.push(
      `${idx + 1}. ${a.creatorName} – $${a.totalRevenue.toLocaleString()} · ` +
        `${a.totalOrders.toLocaleString()} orders · ${a.totalClicks.toLocaleString()} clicks`
    );
  });

  const top = sorted[0];
  if (top?.bestPlatform) {
    lines.push(
      "",
      `Top revenue combo: ${top.creatorName} on ${top.bestPlatform.platform.toUpperCase()} – ` +
        `$${top.bestPlatform.revenue.toLocaleString()} (${(
          top.bestPlatform.revenueShare * 100
        ).toFixed(1)}% of their revenue).`
    );
  }

  lines.push(
    "",
    "Where to focus as an operator:",
    "- Start with your top revenue creator: double down on the content + platform combo already working.",
    "- Look for creators with high clicks but low orders: they likely need offer/landing page tweaks.",
    "- Use creators with strong Amazon performance as your testing ground for new products and bundles."
  );

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const scope: "primary" | "all" =
    body.scope === "all" ? "all" : "primary";
  const question = (body.question ?? body.query ?? "").toString();

  const mode = getMode();
  const hasReal = hasRealFunnels();
  const selectedCreatorId = getSelectedCreatorId();

  const funnels = getActiveFunnels();
  if (!funnels.length) {
    return NextResponse.json(
      {
        text:
          "No funnels available yet. Upload IG / LTK / Amazon exports on the Upload tab to generate data.",
        stats: {
          mode,
          hasReal,
          scope,
          creators: [],
        },
      },
      { status: 200 }
    );
  }

  let text: string;
  let analyses: FunnelAnalysis[] = [];

  if (scope === "all") {
    analyses = funnels.map(analyzeSingleFunnel);
    text = summarizeMultiCreator(analyses, mode);
  } else {
    const primary = getPrimaryFunnel();
    if (!primary) {
      return NextResponse.json(
        {
          text:
            "No primary funnel available. Try uploading data or switching back to demo mode.",
          stats: {
            mode,
            hasReal,
            scope,
            creators: [],
          },
        },
        { status: 200 }
      );
    }

    const analysis = analyzeSingleFunnel(primary);
    analyses = [analysis];
    text = summarizeSingleFunnel(analysis, mode);

    if (question && question.toLowerCase().includes("all creator")) {
      text +=
        "\n\nNote: You asked about all creators. Switch the Insights scope to 'All creators' to see a multi-creator ranking.";
    }
  }

  return NextResponse.json({
    text,
    stats: {
      mode,
      hasReal,
      scope,
      selectedCreatorId,
      creators: analyses,
    },
  });
}
