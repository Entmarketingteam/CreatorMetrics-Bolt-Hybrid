import {
  CreatorFunnel,
  FunnelStage,
  RevenueByPlatform,
  getCreatorById,
  demoCreators
} from "@/lib/demoData";

import { InstagramPostMetric } from "./instagram";
import { LtkProductMetric, LtkEarningRow } from "./ltk";
import { AmazonItemMetric } from "./amazon";

type RawBundle = {
  igPosts: InstagramPostMetric[];
  ltkProducts: LtkProductMetric[];
  ltkEarnings: LtkEarningRow[];
  amazonItems: AmazonItemMetric[];
};

const trackingIdMap: Record<string, string> = {
  "nicki-metads-20": "nicki",
  "nicki-fb-20": "nicki",
  "nicki-igreel-20": "nicki",
  "nickientenman-20": "nicki",

  "emilyogan-20": "emily",
  "ogan-em-20": "emily",

  "annschulte-20": "ann",
  "schulte-ann-20": "ann",
};

function detectCreatorIds(bundle: RawBundle): Set<string> {
  const ids = new Set<string>();

  for (const a of bundle.amazonItems) {
    const tid = a.trackingId?.toLowerCase();
    if (tid && trackingIdMap[tid]) ids.add(trackingIdMap[tid]);
  }

  for (const p of bundle.ltkProducts) {
    const brand = p.brand?.toLowerCase();
    if (!brand) continue;

    for (const creator of demoCreators) {
      if (brand.includes(creator.handle.toLowerCase().replace("@", ""))) {
        ids.add(creator.id);
      }
    }
  }

  for (const p of bundle.igPosts) {
    const caption = p.caption?.toLowerCase() ?? "";
    for (const creator of demoCreators) {
      if (caption.includes(creator.handle.toLowerCase())) {
        ids.add(creator.id);
      }
    }
  }

  if (ids.size === 0) ids.add("nicki");

  return ids;
}

export function buildCreatorFunnelFromRaw(bundle: RawBundle): CreatorFunnel[] {
  const creators = Array.from(detectCreatorIds(bundle));
  const funnels: CreatorFunnel[] = [];

  for (const creatorId of creators) {
    const creator = getCreatorById(creatorId);
    const creatorName = creator?.name ?? "Unknown Creator";

    const igPosts = bundle.igPosts;
    const ltkProducts = bundle.ltkProducts;
    const ltkEarnings = bundle.ltkEarnings;
    const amazonItems = bundle.amazonItems;

    const impressions = igPosts.reduce((s, p) => s + (p.impressions ?? 0), 0);
    const clicks = igPosts.reduce((s, p) => s + (p.linkClicks ?? 0), 0);

    const ltkClicks = ltkProducts.reduce((s, p) => s + (p.clicks ?? 0), 0);
    const ltkItems = ltkProducts.reduce((s, p) => s + (p.itemsSold ?? 0), 0);
    const ltkRevenueProducts = ltkProducts.reduce((s, p) => s + (p.revenue ?? 0), 0);
    const ltkRevenueEarnings = ltkEarnings.reduce((s, r) => s + (r.commission ?? 0), 0);
    const ltkRevenue = ltkRevenueProducts || ltkRevenueEarnings;

    const amazonOrders = amazonItems.reduce((s, i) => s + (i.itemsShipped ?? 0), 0);
    const amazonRevenue = amazonItems.reduce(
      (s, i) => s + (i.revenue || i.adFees || 0),
      0
    );
    const amazonClicksEstimate = Math.round(amazonOrders * 15);

    const funnel: FunnelStage[] = [
      { stage: "impressions", value: impressions },
      { stage: "clicks", value: clicks || ltkClicks || amazonClicksEstimate },
      { stage: "dpv", value: ltkClicks || clicks || amazonClicksEstimate },
      { stage: "atc", value: Math.round((ltkItems || amazonOrders) * 1.5) },
      { stage: "orders", value: amazonOrders || ltkItems },
    ];

    const revenueByPlatform: RevenueByPlatform[] = [
      {
        platform: "instagram",
        revenue: 0,
        clicks,
        orders: 0,
        newCustomers: 0,
        returningCustomers: 0,
      },
      {
        platform: "ltk",
        revenue: ltkRevenue,
        clicks: ltkClicks,
        orders: ltkItems,
        newCustomers: Math.round(ltkItems * 0.6),
        returningCustomers: Math.round(ltkItems * 0.4),
      },
      {
        platform: "amazon",
        revenue: amazonRevenue,
        clicks: amazonClicksEstimate,
        orders: amazonOrders,
        newCustomers: Math.round(amazonOrders * 0.7),
        returningCustomers: Math.round(amazonOrders * 0.3),
      },
    ];

    funnels.push({
      creatorId,
      creatorName,
      funnel,
      revenueByPlatform,
      topPosts: [],
      comparedToLastPeriod: {
        revenueDeltaPct: 0,
        clickDeltaPct: 0,
        ordersDeltaPct: 0,
      },
    });
  }

  return funnels;
}
