import { NextRequest, NextResponse } from "next/server";
import { getActiveFunnels } from "@/lib/funnelStore";

export const runtime = "nodejs";

type StageRates = {
  impToClick: number;
  clickToDpv: number;
  dpvToAtc: number;
  atcToOrder: number;
};

type CoachAction = {
  stage: "top" | "mid" | "detail" | "checkout" | "global";
  severity: "high" | "medium" | "low";
  summary: string;
};

type CreatorCoachReport = {
  creatorId: string;
  creatorName: string;
  healthScore: number;
  stageRates: StageRates;
  biggestDropStage: string | null;
  actions: CoachAction[];
};

function getStageValue(
  funnel: { stage: string; value: number }[] | undefined,
  key: string
): number {
  if (!funnel) return 0;
  const found = funnel.find(
    (s) => s.stage.toLowerCase() === key.toLowerCase()
  );
  return found?.value ?? 0;
}

function computeStageRates(funnel: { stage: string; value: number }[] | undefined): StageRates {
  const impressions = getStageValue(funnel, "impressions");
  const clicks = getStageValue(funnel, "clicks");
  const dpv = getStageValue(funnel, "dpv");
  const atc = getStageValue(funnel, "atc");
  const orders = getStageValue(funnel, "orders");

  const impToClick = impressions > 0 ? clicks / impressions : 0;
  const clickToDpv = clicks > 0 ? dpv / clicks : 0;
  const dpvToAtc = dpv > 0 ? atc / dpv : 0;
  const atcToOrder = atc > 0 ? orders / atc : 0;

  return { impToClick, clickToDpv, dpvToAtc, atcToOrder };
}

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

const TARGETS: StageRates = {
  impToClick: 0.02,
  clickToDpv: 0.5,
  dpvToAtc: 0.1,
  atcToOrder: 0.4,
};

function computeHealthScore(rates: StageRates): number {
  const scoreImpToClick = clamp01(rates.impToClick / TARGETS.impToClick);
  const scoreClickToDpv = clamp01(rates.clickToDpv / TARGETS.clickToDpv);
  const scoreDpvToAtc = clamp01(rates.dpvToAtc / TARGETS.dpvToAtc);
  const scoreAtcToOrder = clamp01(rates.atcToOrder / TARGETS.atcToOrder);

  const rawHealth =
    (scoreImpToClick * 0.2 +
      scoreClickToDpv * 0.2 +
      scoreDpvToAtc * 0.3 +
      scoreAtcToOrder * 0.3) /
    (0.2 + 0.2 + 0.3 + 0.3);

  return Math.round(clamp01(rawHealth) * 100);
}

function findBiggestDrop(funnel: { stage: string; value: number }[] | undefined): string | null {
  if (!funnel || funnel.length < 2) return null;

  let biggest: { stage: string; dropPct: number } | null = null;

  for (let i = 1; i < funnel.length; i++) {
    const prev = funnel[i - 1];
    const curr = funnel[i];
    if (!prev || !curr || prev.value <= 0) continue;
    const dropPct = (prev.value - curr.value) / prev.value;
    if (!biggest || dropPct > biggest.dropPct) {
      biggest = { stage: curr.stage, dropPct };
    }
  }

  return biggest?.stage ?? null;
}

function averageRates(ratesArr: StageRates[]): StageRates {
  const n = ratesArr.length || 1;
  const sum = ratesArr.reduce(
    (acc, r) => {
      acc.impToClick += r.impToClick;
      acc.clickToDpv += r.clickToDpv;
      acc.dpvToAtc += r.dpvToAtc;
      acc.atcToOrder += r.atcToOrder;
      return acc;
    },
    { impToClick: 0, clickToDpv: 0, dpvToAtc: 0, atcToOrder: 0 }
  );

  return {
    impToClick: sum.impToClick / n,
    clickToDpv: sum.clickToDpv / n,
    dpvToAtc: sum.dpvToAtc / n,
    atcToOrder: sum.atcToOrder / n,
  };
}

function ratioToBenchmark(value: number, benchmark: number): number {
  if (!Number.isFinite(benchmark) || benchmark <= 0) return 1;
  return value / benchmark;
}

function actionsForCreator(
  creatorName: string,
  rates: StageRates,
  healthScore: number,
  biggestDropStage: string | null,
  workspaceAvg: StageRates
): CoachAction[] {
  const actions: CoachAction[] = [];

  const ratios = {
    top: ratioToBenchmark(rates.impToClick, workspaceAvg.impToClick),
    mid: ratioToBenchmark(rates.clickToDpv, workspaceAvg.clickToDpv),
    detail: ratioToBenchmark(rates.dpvToAtc, workspaceAvg.dpvToAtc),
    checkout: ratioToBenchmark(rates.atcToOrder, workspaceAvg.atcToOrder),
  };

  type StageKey = "top" | "mid" | "detail" | "checkout";

  const sortedStages = (Object.keys(ratios) as StageKey[])
    .map((key) => ({ key, ratio: ratios[key] }))
    .sort((a, b) => a.ratio - b.ratio);

  const worst = sortedStages.slice(0, 2);

  for (const item of worst) {
    const severity: "high" | "medium" | "low" =
      item.ratio < 0.6 ? "high" : item.ratio < 0.9 ? "medium" : "low";

    if (item.key === "top") {
      actions.push({
        stage: "top",
        severity,
        summary:
          "Top-of-funnel is underperforming. Test 3–5 new hooks and thumbnails on IG/Stories, and tighten the CTA around tapping through to LTK or Amazon.",
      });
    } else if (item.key === "mid") {
      actions.push({
        stage: "mid",
        severity,
        summary:
          "Clicks → detail page views are weak. Check that links land on shoppable LTK lists or Amazon Idea Lists, not generic profiles. Add 'shop this exact list' language in captions.",
      });
    } else if (item.key === "detail") {
      actions.push({
        stage: "detail",
        severity,
        summary:
          "Detail page → add-to-cart is low. Improve product page content: lead with 1–2 hero benefits, add a short 'why I actually use this' blurb, and pin 2–3 best social proof reviews.",
      });
    } else if (item.key === "checkout") {
      actions.push({
        stage: "checkout",
        severity,
        summary:
          "Add-to-cart → order is the weakest link. Look at price anchoring and objection handling: bundles, limited-time offers, or clearer risk reversal (easy returns, guarantees).",
      });
    }
  }

  if (biggestDropStage) {
    const stageLower = biggestDropStage.toLowerCase();
    if (stageLower.includes("impression") || stageLower.includes("click")) {
      actions.push({
        stage: "top",
        severity: "high",
        summary:
          "The largest drop is at the very top of the funnel. Prioritize creative testing: new hooks, formats, and first 3 seconds on Reels before tweaking deeper stages.",
      });
    } else if (stageLower.includes("dpv")) {
      actions.push({
        stage: "mid",
        severity: "medium",
        summary:
          "The biggest drop is between click and detail page views. Audit routing: remove extra redirects, fix broken LTK links, and keep the path from story → list → product as short as possible.",
      });
    } else if (stageLower.includes("atc")) {
      actions.push({
        stage: "detail",
        severity: "medium",
        summary:
          "The biggest drop is at add-to-cart. Clarify sizing, shipping, and key benefits above the fold so shoppers feel confident adding to cart.",
      });
    } else if (stageLower.includes("order")) {
      actions.push({
        stage: "checkout",
        severity: "high",
        summary:
          "The largest drop is at checkout. Test different offers (bundles, threshold perks) and make sure taxes/shipping aren't surprising users at the last step.",
      });
    }
  }

  if (healthScore >= 80) {
    actions.push({
      stage: "global",
      severity: "low",
      summary:
        "Funnel health is strong. Double down on winners: scale posting frequency around proven formats and consider paid amplification to this creator's best-performing content.",
    });
  } else if (healthScore <= 50) {
    actions.push({
      stage: "global",
      severity: "high",
      summary:
        "Overall funnel health is under 50/100. Focus on fixing the weakest stage first instead of just adding more traffic—otherwise you're paying to send people into a leaky funnel.",
    });
  } else {
    actions.push({
      stage: "global",
      severity: "medium",
      summary:
        "Funnel health is mid-range. Pick one weak stage, run 2–3 structured experiments over the next 2 weeks, and only then move to the next bottleneck.",
    });
  }

  return actions;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");

  const funnels = getActiveFunnels();
  if (!funnels.length) {
    return NextResponse.json({
      scope: creatorId ? "creator" : "workspace",
      workspace: null,
      reports: [],
    });
  }

  const ratesList = funnels.map((f) =>
    computeStageRates((f as any).funnel ?? [])
  );
  const workspaceAvg = averageRates(ratesList);

  const allReports: CreatorCoachReport[] = funnels.map((f, idx) => {
    const funnelStages = (f as any).funnel ?? [];
    const rates = ratesList[idx];
    const healthScore = computeHealthScore(rates);
    const biggestDropStage = findBiggestDrop(funnelStages);
    const actions = actionsForCreator(
      f.creatorName,
      rates,
      healthScore,
      biggestDropStage,
      workspaceAvg
    );

    return {
      creatorId: f.creatorId,
      creatorName: f.creatorName,
      healthScore,
      stageRates: rates,
      biggestDropStage,
      actions,
    };
  });

  const scope = creatorId ? "creator" : "workspace";

  if (creatorId) {
    const report = allReports.find((r) => r.creatorId === creatorId) ?? null;
    return NextResponse.json({
      scope,
      workspace: {
        averages: workspaceAvg,
        totalCreators: funnels.length,
      },
      reports: report ? [report] : [],
    });
  }

  const sorted = [...allReports].sort(
    (a, b) => a.healthScore - b.healthScore
  );

  return NextResponse.json({
    scope,
    workspace: {
      averages: workspaceAvg,
      totalCreators: funnels.length,
    },
    reports: sorted,
  });
}
