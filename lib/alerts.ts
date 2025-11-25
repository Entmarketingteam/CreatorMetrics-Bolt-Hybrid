import { getActiveFunnels, getMode, hasRealFunnels } from "@/lib/funnelStore";

export type AlertSeverity = "low" | "medium" | "high";

export type Alert = {
  id: string;
  creatorId: string;
  creatorName: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  stage?: string;
};

export type OpportunityImpact = "low" | "medium" | "high";

export type Opportunity = {
  id: string;
  creatorId: string;
  creatorName: string;
  impact: OpportunityImpact;
  title: string;
  description: string;
};

export type CreatorHealth = {
  creatorId: string;
  creatorName: string;
  score: number;
  label: "Healthy" | "Watch" | "At risk";
};

export type CreatorAlertSummary = {
  creatorId: string;
  creatorName: string;
  totalRevenue: number;
  totalOrders: number;
  totalClicks: number;
  health: CreatorHealth;
  alerts: Alert[];
  opportunities: Opportunity[];
};

export type AlertsSummary = {
  mode: "demo" | "real";
  hasReal: boolean;
  creators: CreatorAlertSummary[];
};

function safeStageLabel(stage: string): string {
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

function computeHealthScore(
  totalRevenue: number,
  totalClicks: number,
  biggestDropPct: number,
  platformShareMax: number
): CreatorHealth {
  let score = 100;

  if (totalRevenue === 0 && totalClicks > 0) {
    score -= 35;
  } else if (totalRevenue < 1000 && totalClicks > 0) {
    score -= 20;
  } else if (totalRevenue < 5000) {
    score -= 10;
  }

  if (biggestDropPct > 0.7) {
    score -= 35;
  } else if (biggestDropPct > 0.5) {
    score -= 25;
  } else if (biggestDropPct > 0.35) {
    score -= 15;
  }

  if (platformShareMax > 0.9) {
    score -= 15;
  } else if (platformShareMax > 0.75) {
    score -= 8;
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  let label: CreatorHealth["label"] = "Healthy";
  if (score < 50) label = "At risk";
  else if (score < 75) label = "Watch";

  return {
    creatorId: "",
    creatorName: "",
    score,
    label,
  };
}

function buildAlertsAndOpportunities(
  creatorId: string,
  creatorName: string,
  totalRevenue: number,
  totalClicks: number,
  funnel: any[],
  platformSummaries: {
    platform: string;
    revenue: number;
    orders: number;
    clicks: number;
    share: number;
  }[]
): { alerts: Alert[]; opportunities: Opportunity[]; health: CreatorHealth } {
  const alerts: Alert[] = [];
  const opportunities: Opportunity[] = [];

  let biggestDropStage: {
    stage: string;
    fromValue: number;
    toValue: number;
    dropPct: number;
  } | null = null;

  for (let i = 1; i < (funnel ?? []).length; i++) {
    const prev = funnel[i - 1];
    const curr = funnel[i];
    const prevVal = prev?.value ?? 0;
    const currVal = curr?.value ?? 0;
    if (prevVal <= 0) continue;
    const dropPct = (prevVal - currVal) / prevVal;

    if (!biggestDropStage || dropPct > biggestDropStage.dropPct) {
      biggestDropStage = {
        stage: curr.stage,
        fromValue: prevVal,
        toValue: currVal,
        dropPct,
      };
    }
  }

  const platformShareMax =
    platformSummaries.reduce((m, p) => Math.max(m, p.share), 0) || 0;

  const healthBase = computeHealthScore(
    totalRevenue,
    totalClicks,
    biggestDropStage?.dropPct ?? 0,
    platformShareMax
  );
  const health: CreatorHealth = {
    ...healthBase,
    creatorId,
    creatorName,
  };

  if (biggestDropStage) {
    const pct = biggestDropStage.dropPct;
    const pctLabel = (pct * 100).toFixed(1);
    const stageLabel = safeStageLabel(biggestDropStage.stage);

    if (pct > 0.7) {
      alerts.push({
        id: `${creatorId}-drop-${biggestDropStage.stage}-high`,
        creatorId,
        creatorName,
        severity: "high",
        title: `Severe drop at ${stageLabel}`,
        message: `Traffic drops ${pctLabel}% between stages before and ${stageLabel}. This is the #1 bottleneck in the funnel.`,
        stage: biggestDropStage.stage,
      });
    } else if (pct > 0.5) {
      alerts.push({
        id: `${creatorId}-drop-${biggestDropStage.stage}-med`,
        creatorId,
        creatorName,
        severity: "medium",
        title: `Large drop at ${stageLabel}`,
        message: `There is a ${pctLabel}% drop leading into ${stageLabel}. Worth prioritizing experiments here.`,
        stage: biggestDropStage.stage,
      });
    } else if (pct > 0.35) {
      alerts.push({
        id: `${creatorId}-drop-${biggestDropStage.stage}-low`,
        creatorId,
        creatorName,
        severity: "low",
        title: `Notable drop at ${stageLabel}`,
        message: `Drop into ${stageLabel} is ${pctLabel}%. Keep an eye on this step.`,
        stage: biggestDropStage.stage,
      });
    }

    if (pct > 0.5) {
      const impact: OpportunityImpact = pct > 0.7 ? "high" : "medium";
      const title =
        biggestDropStage.stage.toLowerCase() === "atc"
          ? "Tighten PDP → Add-to-Cart persuasion"
          : biggestDropStage.stage.toLowerCase() === "orders"
          ? "Fix cart → order conversion"
          : "Lift top-of-funnel conversion";

      const description =
        biggestDropStage.stage.toLowerCase() === "atc"
          ? "Biggest leak is between product views and add-to-cart. Test stronger social proof, clearer benefits, and urgency messaging on your top LTK/Amazon items."
          : biggestDropStage.stage.toLowerCase() === "orders"
          ? "Carts are filling but not converting. Simplify checkout, reduce friction, and test better offers or bundles for this creator."
          : "Top-of-funnel is shedding too much traffic. Refresh hooks, covers, and CTAs on IG and LTK content driving this funnel.";

      opportunities.push({
        id: `${creatorId}-opp-funnel-${biggestDropStage.stage}`,
        creatorId,
        creatorName,
        impact,
        title,
        description,
      });
    }
  }

  if (totalClicks > 0 && totalRevenue === 0) {
    alerts.push({
      id: `${creatorId}-traffic-no-revenue`,
      creatorId,
      creatorName,
      severity: "high",
      title: "Traffic but no revenue",
      message:
        "This creator is driving clicks but recorded revenue is $0 for the period. Check tracking, attribution, and product links.",
    });

    opportunities.push({
      id: `${creatorId}-opp-tracking`,
      creatorId,
      creatorName,
      impact: "high",
      title: "Verify tracking and product links",
      description:
        "Clicks with no revenue often indicates broken links, wrong tag IDs, or missed attribution from LTK/Amazon exports.",
    });
  } else if (totalClicks > 0) {
    const rpc = totalRevenue / totalClicks;
    if (rpc < 0.5) {
      alerts.push({
        id: `${creatorId}-low-rpc`,
        creatorId,
        creatorName,
        severity: "medium",
        title: "Low revenue per click",
        message: `Revenue per click is approximately $${rpc.toFixed(
          2
        )}. This is below typical creator benchmarks; consider testing higher AOV items or bundles.`,
      });
      opportunities.push({
        id: `${creatorId}-opp-rpc`,
        creatorId,
        creatorName,
        impact: "medium",
        title: "Upgrade item mix & bundles",
        description:
          "Swap in higher AOV hero products, bundles, or best-sellers to improve revenue per click for this creator.",
      });
    }
  }

  if (platformShareMax > 0.9) {
    const main = platformSummaries.find((p) => p.share === platformShareMax);
    alerts.push({
      id: `${creatorId}-platform-concentration-high`,
      creatorId,
      creatorName,
      severity: "medium",
      title: "All revenue concentrated on one platform",
      message: `~${(platformShareMax * 100).toFixed(
        1
      )}% of revenue is on ${main?.platform.toUpperCase()}. This is a concentration risk.`,
    });
    opportunities.push({
      id: `${creatorId}-opp-platform-diversify`,
      creatorId,
      creatorName,
      impact: "low",
      title: "Spread wins across platforms",
      description:
        "Use your winning content from the main platform as templates for others (e.g., repurposing Amazon winners into LTK boards or IG Stories).",
    });
  }

  return { alerts, opportunities, health };
}

export function generateAlertsSummary(): AlertsSummary {
  const funnels = getActiveFunnels();
  const mode = getMode();
  const hasReal = hasRealFunnels();

  const creators: CreatorAlertSummary[] = funnels.map((f) => {
    const totalRevenue = f.revenueByPlatform.reduce(
      (s: number, r: any) => s + (r.revenue ?? 0),
      0
    );
    const totalOrders = f.revenueByPlatform.reduce(
      (s: number, r: any) => s + (r.orders ?? 0),
      0
    );
    const totalClicks = f.revenueByPlatform.reduce(
      (s: number, r: any) => s + (r.clicks ?? 0),
      0
    );

    const platformSummaries = (f.revenueByPlatform ?? []).map((r: any) => {
      const revenue = r.revenue ?? 0;
      const share = totalRevenue > 0 ? revenue / totalRevenue : 0;
      return {
        platform: r.platform,
        revenue,
        orders: r.orders ?? 0,
        clicks: r.clicks ?? 0,
        share,
      };
    });

    const { alerts, opportunities, health } = buildAlertsAndOpportunities(
      f.creatorId,
      f.creatorName,
      totalRevenue,
      totalClicks,
      f.funnel ?? [],
      platformSummaries
    );

    return {
      creatorId: f.creatorId,
      creatorName: f.creatorName,
      totalRevenue,
      totalOrders,
      totalClicks,
      health,
      alerts,
      opportunities,
    };
  });

  return {
    mode,
    hasReal,
    creators,
  };
}
