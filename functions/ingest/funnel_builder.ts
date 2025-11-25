import {
  CreatorFunnel,
  FunnelStage,
  RevenueByPlatform,
  getCreatorById,
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

const trackingIdToCreatorId: Record<string, string> = {
  "nicki-metads-20": "nicki",
  "nicki-fb-20": "nicki",
  "nicki-igreel-20": "nicki",
  "nickientenman-20": "nicki",
};

function resolveCreatorIdFromBundle(bundle: RawBundle): string {
  for (const item of bundle.amazonItems) {
    const tid = item.trackingId?.toLowerCase();
    if (tid && trackingIdToCreatorId[tid]) {
      return trackingIdToCreatorId[tid];
    }
  }

  return "nicki";
}

export function buildCreatorFunnelFromRaw(bundle: RawBundle): CreatorFunnel[] {
  const { igPosts, ltkProducts, ltkEarnings, amazonItems } = bundle;

  const creatorId = resolveCreatorIdFromBundle(bundle);
  const creatorName = getCreatorById(creatorId)?.name ?? "Unknown Creator";

  const impressions =
    igPosts.reduce((sum, p) => sum + (p.impressions ?? 0), 0) || 0;
  const clicks =
    igPosts.reduce((sum, p) => sum + (p.linkClicks ?? 0), 0) || 0;

  const ltkClicks =
    ltkProducts.reduce((sum, p) => sum + (p.clicks ?? 0), 0) || 0;
  const ltkItems =
    ltkProducts.reduce((sum, p) => sum + (p.itemsSold ?? 0), 0) || 0;
  const ltkRevenueFromProducts =
    ltkProducts.reduce((sum, p) => sum + (p.revenue ?? 0), 0) || 0;
  const ltkRevenueFromEarnings =
    ltkEarnings.reduce((sum, r) => sum + (r.commission ?? 0), 0) || 0;
  const ltkRevenue = ltkRevenueFromProducts || ltkRevenueFromEarnings;

  const amazonRevenue =
    amazonItems.reduce((sum, i) => sum + (i.revenue || i.adFees || 0), 0) || 0;
  const amazonOrders =
    amazonItems.reduce((sum, i) => sum + (i.itemsShipped ?? 0), 0) || 0;
  const amazonClicksEstimate = Math.round(amazonOrders * 15);

  const funnel: FunnelStage[] = [
    { stage: "impressions", value: impressions },
    {
      stage: "clicks",
      value: clicks || ltkClicks || amazonClicksEstimate,
    },
    {
      stage: "dpv",
      value: ltkClicks || clicks || amazonClicksEstimate,
    },
    {
      stage: "atc",
      value: Math.round((ltkItems || amazonOrders) * 1.5),
    },
    {
      stage: "orders",
      value: amazonOrders || ltkItems,
    },
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

  const creatorFunnel: CreatorFunnel = {
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
  };

  return [creatorFunnel];
}
