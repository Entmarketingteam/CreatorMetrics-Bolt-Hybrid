import { NormalizedRow } from "./columnMapper";
import { getActiveFunnels, setFunnels } from "./funnelStore";

export type FunnelStage = { stage: string; value: number };

export type CreatorFunnel = {
  creatorId: string;
  creatorName: string;
  funnel: FunnelStage[];
  revenueByPlatform: {
    platform: string;
    revenue?: number;
    orders?: number;
    clicks?: number;
  }[];
};

export function buildFunnelsFromRows(rows: NormalizedRow[]): CreatorFunnel[] {
  const byCreator: Record<string, NormalizedRow[]> = {};

  for (const row of rows) {
    const creatorKey = row.creator ?? "unknown_creator";
    if (!byCreator[creatorKey]) byCreator[creatorKey] = [];
    byCreator[creatorKey].push(row);
  }

  const result: CreatorFunnel[] = [];

  for (const [creator, cRows] of Object.entries(byCreator)) {
    let impressions = 0;
    let clicks = 0;
    let dpv = 0;
    let atc = 0;
    let orders = 0;

    const revByPlatform: Record<
      string,
      { revenue: number; orders: number; clicks: number }
    > = {};

    for (const r of cRows) {
      clicks += r.clicks;
      dpv += r.dpv;
      atc += r.atc;
      orders += r.orders;

      const key = r.platform ?? "unknown";
      if (!revByPlatform[key]) {
        revByPlatform[key] = { revenue: 0, orders: 0, clicks: 0 };
      }
      revByPlatform[key].revenue += r.revenue;
      revByPlatform[key].orders += r.orders;
      revByPlatform[key].clicks += r.clicks;
    }

    impressions = clicks * 10;

    const funnel: FunnelStage[] = [
      { stage: "impressions", value: impressions },
      { stage: "clicks", value: clicks },
      { stage: "dpv", value: dpv },
      { stage: "atc", value: atc },
      { stage: "orders", value: orders },
    ];

    result.push({
      creatorId: creator,
      creatorName: creator,
      funnel,
      revenueByPlatform: Object.entries(revByPlatform).map(
        ([platform, agg]) => ({
          platform,
          revenue: agg.revenue,
          orders: agg.orders,
          clicks: agg.clicks,
        })
      ),
    });
  }

  return result;
}

export function mergeNewFunnels(newFunnels: CreatorFunnel[]) {
  const existing = getActiveFunnels() as any[];
  const byId: Record<string, any> = {};

  for (const f of existing) {
    byId[f.creatorId] = f;
  }
  for (const nf of newFunnels) {
    byId[nf.creatorId] = nf;
  }

  const merged = Object.values(byId);
  setFunnels(merged);
}
