import {
  getSummaryMetrics,
  getCampaigns,
  getMappings,
  getPosts,
  getPostMetrics,
} from '../../lib/storage';
import { buildFunnelViews } from '../../lib/matching';

export async function runAtlasAgent(input: string, _context: any = {}) {
  const [summary, campaigns, mappings, posts, metrics] = await Promise.all([
    getSummaryMetrics(),
    getCampaigns(),
    getMappings(),
    getPosts(),
    getPostMetrics(),
  ]);
  const funnels = buildFunnelViews(posts, metrics, mappings);
  const lower = input.toLowerCase();

  if (lower.includes('performance') || lower.includes('summary')) {
    return `📊 Overall Performance

• Revenue: $${summary.revenue.toLocaleString()}
• Conversions: ${summary.conversions.toLocaleString()}
• Clicks: ${summary.clicks.toLocaleString()}
• Impressions: ${summary.impressions.toLocaleString()}

Campaigns: ${summary.campaignsCount}
Creators: ${summary.creatorsCount}
Tracked posts: ${summary.postsCount}`;
  }

  if (lower.includes('lmnt') || lower.includes('q4')) {
    const lmnt = campaigns.find((c) => c.id === 'camp_lmnt_q4');
    const lmntFunnels = funnels.filter((f) => f.campaignId === 'camp_lmnt_q4');

    const total = lmntFunnels.reduce(
      (acc, f) => {
        acc.revenue += f.funnel.revenue;
        acc.conversions += f.funnel.conversions;
        acc.clicks += f.funnel.clicks;
        return acc;
      },
      { revenue: 0, conversions: 0, clicks: 0 }
    );

    const cr = total.clicks > 0 ? (total.conversions / total.clicks) * 100 : 0;

    return `🔍 LMNT Q4 Insight

Campaign: ${lmnt?.name || 'LMNT Q4'}
Brand: ${lmnt?.brand || 'LMNT'}

• Revenue (mapped): $${total.revenue.toLocaleString()}
• Conversions (mapped): ${total.conversions.toLocaleString()}
• Clicks (mapped): ${total.clicks.toLocaleString()}
• Click → Conversion: ${cr.toFixed(1)}%`;
  }

  return `Atlas here. Ask for "overall performance" or "LMNT Q4".`;
}
