import { LinkMapping, Post, PostMetrics } from './schema';

export interface FunnelView {
  mappingId: string;
  creatorId: string;
  campaignId?: string;
  instagramPostId?: string;
  ltkPostId?: string;
  amazonTrackingId?: string;
  funnel: {
    impressions: number;
    clicks: number;
    detailPageViews: number;
    addToCarts: number;
    conversions: number;
    revenue: number;
  };
}

export function buildFunnelViews(
  posts: Post[],
  metrics: PostMetrics[],
  mappings: LinkMapping[]
): FunnelView[] {
  const metricsByPostId = new Map<string, PostMetrics[]>();
  for (const m of metrics) {
    const list = metricsByPostId.get(m.postId) ?? [];
    list.push(m);
    metricsByPostId.set(m.postId, list);
  }

  const views: FunnelView[] = [];

  for (const mapping of mappings) {
    const igMetrics = mapping.instagramPostId
      ? metricsByPostId.get(mapping.instagramPostId) ?? []
      : [];
    const ltkMetrics = mapping.ltkPostId
      ? metricsByPostId.get(mapping.ltkPostId) ?? []
      : [];
    const amazonPostId = mapping.amazonTrackingId
      ? `amazon_track_${mapping.amazonTrackingId}`
      : undefined;
    const amzMetrics = amazonPostId ? metricsByPostId.get(amazonPostId) ?? [] : [];

    const all = [...igMetrics, ...ltkMetrics, ...amzMetrics];

    const funnel = all.reduce(
      (acc, m) => {
        acc.impressions += m.impressions;
        acc.clicks += m.clicks;
        acc.detailPageViews += m.detailPageViews;
        acc.addToCarts += m.addToCarts;
        acc.conversions += m.conversions;
        acc.revenue += m.revenue;
        return acc;
      },
      {
        impressions: 0,
        clicks: 0,
        detailPageViews: 0,
        addToCarts: 0,
        conversions: 0,
        revenue: 0,
      }
    );

    views.push({
      mappingId: mapping.id,
      creatorId: mapping.creatorId,
      campaignId: mapping.campaignId,
      instagramPostId: mapping.instagramPostId,
      ltkPostId: mapping.ltkPostId,
      amazonTrackingId: mapping.amazonTrackingId,
      funnel,
    });
  }

  return views;
}
