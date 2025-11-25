import {
  Creator,
  Campaign,
  Post,
  PostMetrics,
  SummaryMetrics,
  LinkMapping,
} from './schema';

const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

export interface DataStore {
  creators: Creator[];
  campaigns: Campaign[];
  posts: Post[];
  postMetrics: PostMetrics[];
  mappings: LinkMapping[];
}

const mockStore: DataStore = {
  creators: [
    {
      id: 'creator_nicki',
      handle: 'nicki.entenmann',
      displayName: 'Nicki Entenmann',
      platforms: ['instagram', 'ltk', 'amazon'],
    },
  ],
  campaigns: [
    {
      id: 'camp_lmnt_q4',
      name: 'LMNT Q4 Collab',
      brand: 'LMNT',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      creatorId: 'creator_nicki',
    },
  ],
  posts: [
    {
      id: 'ig_post_1',
      platform: 'instagram',
      creatorId: 'creator_nicki',
      campaignId: 'camp_lmnt_q4',
      externalId: 'IG123',
      url: 'https://instagram.com/p/IG123',
      postedAt: '2025-10-15T12:00:00Z',
      title: 'LMNT morning routine',
      thumbnailUrl: '',
    },
    {
      id: 'ltk_post_1',
      platform: 'ltk',
      creatorId: 'creator_nicki',
      campaignId: 'camp_lmnt_q4',
      externalId: 'LTK123',
      url: 'https://ltk.app.link/LTK123',
      postedAt: '2025-10-15T12:05:00Z',
      title: 'Shop my LMNT favorites',
      thumbnailUrl: '',
    },
  ],
  postMetrics: [
    {
      postId: 'ig_post_1',
      platform: 'instagram',
      date: '2025-10-15',
      impressions: 120000,
      clicks: 4500,
      detailPageViews: 0,
      addToCarts: 0,
      conversions: 0,
      revenue: 0,
    },
    {
      postId: 'ltk_post_1',
      platform: 'ltk',
      date: '2025-10-15',
      impressions: 0,
      clicks: 2400,
      detailPageViews: 1900,
      addToCarts: 700,
      conversions: 280,
      revenue: 8400,
    },
    {
      postId: 'amazon_track_nickientenman-20',
      platform: 'amazon',
      date: '2025-10-15',
      impressions: 0,
      clicks: 2400,
      detailPageViews: 1800,
      addToCarts: 650,
      conversions: 260,
      revenue: 8000,
    },
  ],
  mappings: [
    {
      id: 'map_lmnt_q4_post1',
      creatorId: 'creator_nicki',
      campaignId: 'camp_lmnt_q4',
      instagramPostId: 'ig_post_1',
      ltkPostId: 'ltk_post_1',
      amazonTrackingId: 'nickientenman-20',
      amazonAsin: 'B0LMNT1234',
      lastUpdated: new Date().toISOString(),
    },
  ],
};

export async function getDataStore(): Promise<DataStore> {
  if (!USE_SUPABASE) return mockStore;
  // TODO: wire Supabase queries here.
  return mockStore;
}

export async function getCreators(): Promise<Creator[]> {
  const store = await getDataStore();
  return store.creators;
}

export async function getCreatorById(id: string): Promise<Creator | undefined> {
  const store = await getDataStore();
  return store.creators.find((c) => c.id === id);
}

export async function getCampaigns(): Promise<Campaign[]> {
  const store = await getDataStore();
  return store.campaigns;
}

export async function getCampaignById(id: string): Promise<Campaign | undefined> {
  const store = await getDataStore();
  return store.campaigns.find((c) => c.id === id);
}

export async function getPosts() {
  const store = await getDataStore();
  return store.posts;
}

export async function getPostMetrics() {
  const store = await getDataStore();
  return store.postMetrics;
}

export async function getMappings() {
  const store = await getDataStore();
  return store.mappings;
}

export async function getSummaryMetrics(): Promise<SummaryMetrics> {
  const store = await getDataStore();
  const totals = store.postMetrics.reduce(
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

  return {
    ...totals,
    creatorsCount: store.creators.length,
    campaignsCount: store.campaigns.length,
    postsCount: store.posts.length,
    timeRange: {
      start: '2025-10-01',
      end: '2025-11-24',
    },
  };
}
