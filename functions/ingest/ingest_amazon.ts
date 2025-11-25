import { PostMetrics } from '../../lib/schema';
import { toNumber } from './util_numbers';

function parseAmazonItems(xml: string): Record<string, string>[] {
  const items: Record<string, string>[] = [];
  const itemRegex = /<Item\s+([^>]+?)\/>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const attrString = match[1];
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)="([^"]*)"/g;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const key = attrMatch[1];
      const value = attrMatch[2];
      attrs[key] = value;
    }

    items.push(attrs);
  }

  return items;
}

export async function ingestAmazonTracking(
  xmlText: string
): Promise<{ metrics: PostMetrics[] }> {
  const rows = parseAmazonItems(xmlText);
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const trackingId = row['TrackingID'];
    if (!trackingId) continue;

    const clicks = toNumber(row['Clicks']);
    const itemsOrdered = toNumber(row['ItemsOrdered']);
    const itemsShipped = toNumber(row['ItemsShipped']);
    const revenue = toNumber(row['Revenue']);
    const postId = `amazon_track_${trackingId}`;

    metrics.push({
      postId,
      platform: 'amazon',
      date: '2025-01-01',
      impressions: 0,
      clicks,
      detailPageViews: clicks,
      addToCarts: 0,
      conversions: itemsShipped || itemsOrdered,
      revenue,
    });
  }

  return { metrics };
}

export async function ingestAmazonOrders(
  xmlText: string
): Promise<{ metrics: PostMetrics[] }> {
  const rows = parseAmazonItems(xmlText);
  const bucket = new Map<string, { clicks: number; conversions: number; revenue: number }>();

  for (const row of rows) {
    const asin = row['ASIN'] || 'UNKNOWN_ASIN';
    const tag = row['Tag'] || 'UNKNOWN_TAG';
    const key = `${asin}__${tag}`;
    const price = toNumber(row['Price']);
    const qty = toNumber(row['Quantity'] || row['Items'] || 1);
    const revenue = price * qty;

    const current = bucket.get(key) ?? { clicks: 0, conversions: 0, revenue: 0 };
    current.conversions += qty || 1;
    current.revenue += revenue;
    bucket.set(key, current);
  }

  const metrics: PostMetrics[] = [];
  for (const [key, agg] of bucket.entries()) {
    const [asin, tag] = key.split('__');
    const postId = `amazon_asin_${asin}_${tag}`;

    metrics.push({
      postId,
      platform: 'amazon',
      date: '2025-01-01',
      impressions: 0,
      clicks: agg.clicks,
      detailPageViews: agg.clicks,
      addToCarts: 0,
      conversions: agg.conversions,
      revenue: agg.revenue,
    });
  }

  return { metrics };
}

export async function ingestAmazonDailyTrends(
  xmlText: string
): Promise<{ metrics: PostMetrics[] }> {
  const rows = parseAmazonItems(xmlText);
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const date = row['Date'] || '2025-01-01';
    const clicks = toNumber(row['Clicks']);
    const totalItemsOrdered = toNumber(row['TotalItemsOrdered'] || row['ItemsOrderedAmazon']);
    const postId = `amazon_daily_all_${date}`;

    metrics.push({
      postId,
      platform: 'amazon',
      date,
      impressions: 0,
      clicks,
      detailPageViews: clicks,
      addToCarts: 0,
      conversions: totalItemsOrdered,
      revenue: 0,
    });
  }

  return { metrics };
}

export async function ingestAmazonBounties(
  xmlText: string
): Promise<{ metrics: PostMetrics[] }> {
  const rows = parseAmazonItems(xmlText);
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const programName = row['ProgramName'] || row['BountyProgram'] || 'Bounty';
    const amount = toNumber(row['Amount'] || row['AdFees'] || row['Revenue']);
    const date = row['Date'] || '2025-01-01';
    const postId = `amazon_bounty_${programName}`;

    metrics.push({
      postId,
      platform: 'amazon',
      date,
      impressions: 0,
      clicks: 0,
      detailPageViews: 0,
      addToCarts: 0,
      conversions: 1,
      revenue: amount,
    });
  }

  return { metrics };
}

export async function ingestAmazonEarnings(
  xmlText: string
): Promise<{ metrics: PostMetrics[] }> {
  const rows = parseAmazonItems(xmlText);
  const metrics: PostMetrics[] = [];

  for (const row of rows) {
    const date = row['Date'] || '2025-01-01';
    const adFees = toNumber(row['AdFees'] || row['Earnings'] || row['Revenue']);
    const postId = `amazon_earnings_${date}`;

    metrics.push({
      postId,
      platform: 'amazon',
      date,
      impressions: 0,
      clicks: 0,
      detailPageViews: 0,
      addToCarts: 0,
      conversions: 0,
      revenue: adFees,
    });
  }

  return { metrics };
}
