import { ingestInstagramBusinessSuite } from './ingest_instagram';
import {
  ingestLTKPosts,
  ingestLTKAnalytics,
  ingestLTKBrands,
  ingestLTKEarnings,
} from './ingest_ltk';
import {
  ingestAmazonTracking,
  ingestAmazonOrders,
  ingestAmazonDailyTrends,
  ingestAmazonBounties,
  ingestAmazonEarnings,
} from './ingest_amazon';

export async function ingestAllSourcesReal(payload: {
  instagramFiles?: string[];
  ltkPostsCsv?: string;
  ltkAnalyticsCsv?: string;
  ltkBrandsCsv?: string;
  ltkEarningsCsv?: string;
  amazonTrackingXml?: string;
  amazonOrdersXml?: string;
  amazonDailyTrendsXml?: string;
  amazonBountiesXml?: string;
  amazonEarningsXml?: string;
  defaultCreatorId?: string;
  defaultCampaignId?: string;
}) {
  const creatorId = payload.defaultCreatorId ?? 'creator_nicki';
  const campaignId = payload.defaultCampaignId;

  const posts: any[] = [];
  const metrics: any[] = [];

  if (payload.instagramFiles?.length) {
    for (const csv of payload.instagramFiles) {
      const { posts: igPosts, metrics: igMetrics } = await ingestInstagramBusinessSuite(csv, {
        creatorId,
        campaignId,
      });
      posts.push(...igPosts);
      metrics.push(...igMetrics);
    }
  }

  if (payload.ltkPostsCsv) {
    const { posts: ltkPosts, metrics: ltkMetrics } = await ingestLTKPosts(payload.ltkPostsCsv, {
      creatorId,
      campaignId,
    });
    posts.push(...ltkPosts);
    metrics.push(...ltkMetrics);
  }

  if (payload.ltkAnalyticsCsv) {
    const { metrics: m } = await ingestLTKAnalytics(payload.ltkAnalyticsCsv, { creatorId, campaignId });
    metrics.push(...m);
  }

  if (payload.ltkBrandsCsv) {
    const { metrics: m } = await ingestLTKBrands(payload.ltkBrandsCsv);
    metrics.push(...m);
  }

  if (payload.ltkEarningsCsv) {
    const { metrics: m } = await ingestLTKEarnings(payload.ltkEarningsCsv);
    metrics.push(...m);
  }

  if (payload.amazonTrackingXml) {
    const { metrics: m } = await ingestAmazonTracking(payload.amazonTrackingXml);
    metrics.push(...m);
  }

  if (payload.amazonOrdersXml) {
    const { metrics: m } = await ingestAmazonOrders(payload.amazonOrdersXml);
    metrics.push(...m);
  }

  if (payload.amazonDailyTrendsXml) {
    const { metrics: m } = await ingestAmazonDailyTrends(payload.amazonDailyTrendsXml);
    metrics.push(...m);
  }

  if (payload.amazonBountiesXml) {
    const { metrics: m } = await ingestAmazonBounties(payload.amazonBountiesXml);
    metrics.push(...m);
  }

  if (payload.amazonEarningsXml) {
    const { metrics: m } = await ingestAmazonEarnings(payload.amazonEarningsXml);
    metrics.push(...m);
  }

  return { posts, metrics };
}
