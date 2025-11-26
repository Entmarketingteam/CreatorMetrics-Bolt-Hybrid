export interface OverallSummary {
  totalRevenue: number;
  totalOrders: number;
  totalClicks: number;
  revenueDeltaPct: number;
  ordersDeltaPct: number;
  clickDeltaPct: number;
}

export interface FunnelStage {
  stage: string;
  value: number;
}

export interface RevenueByPlatform {
  platform: string;
  revenue: number;
  orders: number;
  clicks: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface TopPost {
  id: string;
  platform: string;
  title: string;
  clicks: number;
  orders: number;
  revenue: number;
}

export interface CreatorFunnel {
  creatorId: string;
  creatorName: string;
  funnel: FunnelStage[];
  revenueByPlatform: RevenueByPlatform[];
  products?: any[];
  topPosts: TopPost[];
  comparedToLastPeriod: {
    revenueDeltaPct: number;
    clickDeltaPct?: number;
    ordersDeltaPct?: number;
  };
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  platforms: string[];
  avatarInitials: string;
}

export function getOverallSummary(): OverallSummary {
  return {
    totalRevenue: 245000,
    totalOrders: 1850,
    totalClicks: 48500,
    revenueDeltaPct: 12.4,
    ordersDeltaPct: 8.7,
    clickDeltaPct: 15.2,
  };
}

export const demoCreators: Creator[] = [
  {
    id: "creator-alpha",
    name: "Nicki Monroe",
    handle: "@nickimonroe",
    platforms: ["instagram", "ltk", "amazon"],
    avatarInitials: "NM",
  },
  {
    id: "creator-beta",
    name: "Sarah Chen",
    handle: "@sarahchen",
    platforms: ["instagram", "ltk"],
    avatarInitials: "SC",
  },
  {
    id: "creator-gamma",
    name: "Maya Rodriguez",
    handle: "@mayarod",
    platforms: ["instagram", "amazon"],
    avatarInitials: "MR",
  },
];

export const demoCreatorFunnels: CreatorFunnel[] = [
  {
    creatorId: "creator-alpha",
    creatorName: "Nicki Monroe",
    funnel: [
      { stage: "impressions", value: 850000 },
      { stage: "clicks", value: 48500 },
      { stage: "ltk_views", value: 32000 },
      { stage: "amazon_views", value: 12500 },
      { stage: "orders", value: 1850 },
    ],
    revenueByPlatform: [
      { platform: "instagram", revenue: 95000, orders: 720, clicks: 18500, newCustomers: 480, returningCustomers: 240 },
      { platform: "ltk", revenue: 120000, orders: 880, clicks: 22000, newCustomers: 550, returningCustomers: 330 },
      { platform: "amazon", revenue: 30000, orders: 250, clicks: 8000, newCustomers: 180, returningCustomers: 70 },
    ],
    topPosts: [
      {
        id: "1",
        platform: "instagram",
        title: "Fall Fashion Finds",
        clicks: 8500,
        orders: 320,
        revenue: 42000,
      },
      {
        id: "2",
        platform: "ltk",
        title: "Home Office Setup",
        clicks: 6200,
        orders: 280,
        revenue: 38000,
      },
      {
        id: "3",
        platform: "instagram",
        title: "Skincare Routine",
        clicks: 7100,
        orders: 310,
        revenue: 35000,
      },
    ],
    comparedToLastPeriod: {
      revenueDeltaPct: 12.4,
    },
  },
  {
    creatorId: "creator-beta",
    creatorName: "Sarah Chen",
    funnel: [
      { stage: "impressions", value: 620000 },
      { stage: "clicks", value: 35000 },
      { stage: "ltk_views", value: 24000 },
      { stage: "amazon_views", value: 0 },
      { stage: "orders", value: 1200 },
    ],
    revenueByPlatform: [
      { platform: "instagram", revenue: 68000, orders: 520, clicks: 14000, newCustomers: 340, returningCustomers: 180 },
      { platform: "ltk", revenue: 92000, orders: 680, clicks: 21000, newCustomers: 420, returningCustomers: 260 },
    ],
    topPosts: [
      {
        id: "4",
        platform: "instagram",
        title: "Winter Essentials",
        clicks: 6200,
        orders: 240,
        revenue: 28000,
      },
      {
        id: "5",
        platform: "ltk",
        title: "Travel Packing Guide",
        clicks: 5800,
        orders: 220,
        revenue: 32000,
      },
    ],
    comparedToLastPeriod: {
      revenueDeltaPct: 8.2,
    },
  },
  {
    creatorId: "creator-gamma",
    creatorName: "Maya Rodriguez",
    funnel: [
      { stage: "impressions", value: 480000 },
      { stage: "clicks", value: 28000 },
      { stage: "ltk_views", value: 0 },
      { stage: "amazon_views", value: 8500 },
      { stage: "orders", value: 950 },
    ],
    revenueByPlatform: [
      { platform: "instagram", revenue: 52000, orders: 410, clicks: 15000, newCustomers: 280, returningCustomers: 130 },
      { platform: "amazon", revenue: 24000, orders: 540, clicks: 13000, newCustomers: 380, returningCustomers: 160 },
    ],
    topPosts: [
      {
        id: "6",
        platform: "instagram",
        title: "Fitness Gear",
        clicks: 4800,
        orders: 190,
        revenue: 22000,
      },
      {
        id: "7",
        platform: "amazon",
        title: "Kitchen Must-Haves",
        clicks: 3900,
        orders: 160,
        revenue: 18000,
      },
    ],
    comparedToLastPeriod: {
      revenueDeltaPct: 15.7,
    },
  },
];

export function getCreatorById(id: string): Creator | undefined {
  return demoCreators.find((c) => c.id === id);
}

export function getCreatorFunnel(creatorId: string): CreatorFunnel | undefined {
  return demoCreatorFunnels.find((f) => f.creatorId === creatorId);
}
