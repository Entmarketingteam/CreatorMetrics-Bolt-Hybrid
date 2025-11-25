import { CreatorFunnel, demoCreatorFunnels } from "./demoData";

let currentFunnels: CreatorFunnel[] | null = null;
let mode: "demo" | "real" = "demo";

export function setRealFunnels(funnels: CreatorFunnel[]) {
  currentFunnels = funnels;
  mode = "real";
}

export function getActiveFunnels(): CreatorFunnel[] {
  if (mode === "real" && currentFunnels && currentFunnels.length > 0) {
    return currentFunnels;
  }
  return demoCreatorFunnels;
}

export function hasRealFunnels(): boolean {
  return !!currentFunnels && currentFunnels.length > 0;
}

export function getMode(): "demo" | "real" {
  return mode;
}

export function setMode(next: "demo" | "real") {
  mode = next;
}

export function getOverallSummary() {
  const funnels = getActiveFunnels();
  const primary = funnels[0];
  if (!primary) return null;

  const totalRevenue = primary.revenueByPlatform.reduce(
    (sum, r) => sum + r.revenue,
    0
  );
  const totalOrders = primary.revenueByPlatform.reduce(
    (sum, r) => sum + r.orders,
    0
  );
  const totalClicks = primary.revenueByPlatform.reduce(
    (sum, r) => sum + r.clicks,
    0
  );

  return {
    totalRevenue,
    totalOrders,
    totalClicks,
    revenueDeltaPct: primary.comparedToLastPeriod.revenueDeltaPct ?? 0,
    clickDeltaPct: primary.comparedToLastPeriod.clickDeltaPct ?? 0,
    ordersDeltaPct: primary.comparedToLastPeriod.ordersDeltaPct ?? 0,
  };
}

export function getPrimaryFunnel(): CreatorFunnel | null {
  const funnels = getActiveFunnels();
  return funnels[0] ?? null;
}
