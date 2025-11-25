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
  creatorName: string;
  funnel: FunnelStage[];
  revenueByPlatform: RevenueByPlatform[];
  topPosts: TopPost[];
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

export const demoCreatorFunnels: CreatorFunnel[] = [
  {
    creatorName: "Creator Alpha",
    funnel: [
      { stage: "impressions", value: 850000 },
      { stage: "clicks", value: 48500 },
      { stage: "ltk_views", value: 32000 },
      { stage: "amazon_views", value: 12500 },
      { stage: "orders", value: 1850 },
    ],
    revenueByPlatform: [
      { platform: "instagram", revenue: 95000, orders: 720, clicks: 18500 },
      { platform: "ltk", revenue: 120000, orders: 880, clicks: 22000 },
      { platform: "amazon", revenue: 30000, orders: 250, clicks: 8000 },
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
  },
];
