export type Platform = 'instagram' | 'ltk' | 'amazon';

export interface Creator {
  id: string;
  handle: string;
  displayName: string;
  platforms: Platform[];
}

export interface Campaign {
  id: string;
  name: string;
  brand: string;
  startDate: string;
  endDate?: string;
  creatorId: string;
}

export interface Post {
  id: string;
  platform: Platform;
  creatorId: string;
  campaignId?: string;
  externalId: string;
  url: string;
  postedAt: string;
  title?: string;
  thumbnailUrl?: string;
}

export interface FunnelMetrics {
  impressions: number;
  clicks: number;
  detailPageViews: number;
  addToCarts: number;
  conversions: number;
  revenue: number;
}

export interface PostMetrics extends FunnelMetrics {
  postId: string;
  platform: Platform;
  date: string;
}

export interface SummaryMetrics extends FunnelMetrics {
  creatorsCount: number;
  campaignsCount: number;
  postsCount: number;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface LinkMapping {
  id: string;
  creatorId: string;
  campaignId?: string;
  instagramPostId?: string;
  ltkPostId?: string;
  amazonTrackingId?: string;
  amazonAsin?: string;
  lastUpdated: string;
}
