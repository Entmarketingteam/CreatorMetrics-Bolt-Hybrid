import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ALERTS_FILE = path.join(DATA_DIR, "alerts.json");

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertScope = "creator" | "workspace";

export type Alert = {
  id: string;
  type: string;
  severity: AlertSeverity;
  scope: AlertScope;
  creatorId?: string;
  creatorName?: string;
  metric: string;
  message: string;
  currentValue?: number;
  comparisonValue?: number;
  changePct?: number | null;
  createdAt: string;
  read: boolean;
};

export type FunnelStage = {
  stage: string;
  value: number;
};

export type RevenueByPlatform = {
  platform: string;
  revenue?: number;
  orders?: number;
  clicks?: number;
};

export type CreatorFunnel = {
  creatorId: string;
  creatorName: string;
  funnel: FunnelStage[];
  revenueByPlatform: RevenueByPlatform[];
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadAllAlerts(): Alert[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(ALERTS_FILE)) return [];
    const raw = fs.readFileSync(ALERTS_FILE, "utf8");
    return JSON.parse(raw) as Alert[];
  } catch {
    return [];
  }
}

function saveAllAlerts(alerts: Alert[]) {
  ensureDataDir();
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), "utf8");
}

function pct(num: number): number {
  if (!Number.isFinite(num)) return 0;
  return num * 100;
}

function rate(numerator: number, denominator: number): number {
  if (!denominator || !Number.isFinite(denominator)) return 0;
  return numerator / denominator;
}

function stageValue(stages: FunnelStage[], name: string): number {
  const found = stages.find(
    (s) => s.stage.toLowerCase() === name.toLowerCase()
  );
  return found?.value ?? 0;
}

export function generateAlertsFromFunnels(funnels: CreatorFunnel[]): Alert[] {
  if (!funnels.length) return [];

  const rows = funnels.map((f) => {
    const stages = f.funnel ?? [];

    const impressions = stageValue(stages, "impressions");
    const clicks = stageValue(stages, "clicks");
    const dpv = stageValue(stages, "dpv");
    const atc = stageValue(stages, "atc");
    const orders = stageValue(stages, "orders");

    const clickRate = rate(clicks, impressions);
    const dpvRate = rate(dpv, clicks);
    const atcRate = rate(atc, dpv);
    const orderRate = rate(orders, atc);

    const revenue = (f.revenueByPlatform ?? []).reduce(
      (sum, p) => sum + (p.revenue ?? 0),
      0
    );
    const rpc = rate(revenue, clicks);

    return {
      creatorId: f.creatorId,
      creatorName: f.creatorName,
      impressions,
      clicks,
      dpv,
      atc,
      orders,
      clickRate,
      dpvRate,
      atcRate,
      orderRate,
      revenue,
      rpc,
    };
  });

  const avg = (key: keyof (typeof rows)[number]): number => {
    if (!rows.length) return 0;
    const total = rows.reduce((sum, r) => sum + (r[key] as number), 0);
    return total / rows.length;
  };

  const avgClick = avg("clickRate");
  const avgDpv = avg("dpvRate");
  const avgAtc = avg("atcRate");
  const avgOrder = avg("orderRate");
  const avgRpc = avg("rpc");

  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  for (const r of rows) {
    if (avgClick > 0 && r.clickRate < avgClick * 0.5) {
      alerts.push({
        id: `al_${Date.now()}_${r.creatorId}_imp_click`,
        type: "funnel_drop",
        severity: r.clickRate < avgClick * 0.25 ? "critical" : "warning",
        scope: "creator",
        creatorId: r.creatorId,
        creatorName: r.creatorName,
        metric: "Impressions → Clicks",
        message:
          r.clickRate < avgClick * 0.25
            ? `Top-of-funnel is collapsing: click-through is ${(pct(
                r.clickRate
              )).toFixed(2)}%, vs workspace benchmark ${(pct(
                avgClick
              )).toFixed(2)}%.`
            : `Click-through is below benchmark: ${(pct(
                r.clickRate
              )).toFixed(2)}% vs ${(pct(avgClick)).toFixed(2)}%.`,
        currentValue: pct(r.clickRate),
        comparisonValue: pct(avgClick),
        changePct:
          avgClick > 0 ? pct(r.clickRate / avgClick - 1) : null,
        createdAt: now,
        read: false,
      });
    }

    if (avgDpv > 0 && r.dpvRate < avgDpv * 0.5) {
      alerts.push({
        id: `al_${Date.now()}_${r.creatorId}_click_dpv`,
        type: "funnel_drop",
        severity: r.dpvRate < avgDpv * 0.25 ? "critical" : "warning",
        scope: "creator",
        creatorId: r.creatorId,
        creatorName: r.creatorName,
        metric: "Clicks → Detail page views",
        message:
          r.dpvRate < avgDpv * 0.25
            ? `People are clicking but not landing on the product page. DPV rate is ${(pct(
                r.dpvRate
              )).toFixed(2)}% vs ${(pct(avgDpv)).toFixed(2)}%.`
            : `Detail page view rate is below benchmark. Check link destinations and tracking.`,
        currentValue: pct(r.dpvRate),
        comparisonValue: pct(avgDpv),
        changePct:
          avgDpv > 0 ? pct(r.dpvRate / avgDpv - 1) : null,
        createdAt: now,
        read: false,
      });
    }

    if (avgAtc > 0 && r.atcRate < avgAtc * 0.5) {
      alerts.push({
        id: `al_${Date.now()}_${r.creatorId}_dpv_atc`,
        type: "funnel_drop",
        severity: r.atcRate < avgAtc * 0.25 ? "critical" : "warning",
        scope: "creator",
        creatorId: r.creatorId,
        creatorName: r.creatorName,
        metric: "DPV → Add to cart",
        message:
          r.atcRate < avgAtc * 0.25
            ? `Product page views are not converting to add-to-cart. ATC rate is ${(pct(
                r.atcRate
              )).toFixed(2)}% vs ${(pct(avgAtc)).toFixed(2)}%.`
            : `Add-to-cart rate is trailing workspace benchmarks. Consider testing price, offer, or social proof.`,
        currentValue: pct(r.atcRate),
        comparisonValue: pct(avgAtc),
        changePct:
          avgAtc > 0 ? pct(r.atcRate / avgAtc - 1) : null,
        createdAt: now,
        read: false,
      });
    }

    if (avgOrder > 0 && r.orderRate < avgOrder * 0.5) {
      alerts.push({
        id: `al_${Date.now()}_${r.creatorId}_atc_order`,
        type: "funnel_drop",
        severity: r.orderRate < avgOrder * 0.25 ? "critical" : "warning",
        scope: "creator",
        creatorId: r.creatorId,
        creatorName: r.creatorName,
        metric: "ATC → Orders",
        message:
          r.orderRate < avgOrder * 0.25
            ? `Checkout is breaking: ATC → order rate is ${(pct(
                r.orderRate
              )).toFixed(2)}% vs ${(pct(avgOrder)).toFixed(2)}%.`
            : `Order conversion from carts is soft. Check friction at checkout or coupon issues.`,
        currentValue: pct(r.orderRate),
        comparisonValue: pct(avgOrder),
        changePct:
          avgOrder > 0 ? pct(r.orderRate / avgOrder - 1) : null,
        createdAt: now,
        read: false,
      });
    }

    if (avgRpc > 0 && r.rpc < avgRpc * 0.5) {
      alerts.push({
        id: `al_${Date.now()}_${r.creatorId}_rpc_low`,
        type: "rpc_change",
        severity: "warning",
        scope: "creator",
        creatorId: r.creatorId,
        creatorName: r.creatorName,
        metric: "Revenue per click",
        message: `Revenue per click is low: $${r.rpc.toFixed(
          2
        )} vs workspace $${avgRpc.toFixed(
          2
        )}. This traffic may be less qualified or pushing lower AOV products.`,
        currentValue: r.rpc,
        comparisonValue: avgRpc,
        changePct: avgRpc > 0 ? pct(r.rpc / avgRpc - 1) : null,
        createdAt: now,
        read: false,
      });
    } else if (avgRpc > 0 && r.rpc > avgRpc * 1.5) {
      alerts.push({
        id: `al_${Date.now()}_${r.creatorId}_rpc_high`,
        type: "rpc_change",
        severity: "info",
        scope: "creator",
        creatorId: r.creatorId,
        creatorName: r.creatorName,
        metric: "Revenue per click",
        message: `This creator is outperforming peers on revenue per click: $${r.rpc.toFixed(
          2
        )} vs workspace $${avgRpc.toFixed(2)}. Consider giving them more budget.`,
        currentValue: r.rpc,
        comparisonValue: avgRpc,
        changePct: avgRpc > 0 ? pct(r.rpc / avgRpc - 1) : null,
        createdAt: now,
        read: false,
      });
    }

    if (r.impressions > 0 && r.impressions > 3 * avg("impressions")) {
      alerts.push({
        id: `al_${Date.now()}_${r.creatorId}_traffic_spike`,
        type: "traffic_spike",
        severity: "info",
        scope: "creator",
        creatorId: r.creatorId,
        creatorName: r.creatorName,
        metric: "Impressions",
        message: `Impressions are significantly above workspace average for this period. Make sure links and tracking are correct to capture this spike.`,
        currentValue: r.impressions,
        comparisonValue: avg("impressions"),
        changePct:
          avg("impressions") > 0
            ? pct(r.impressions / avg("impressions") - 1)
            : null,
        createdAt: now,
        read: false,
      });
    }
  }

  const hasCritical = alerts.some((a) => a.severity === "critical");
  if (hasCritical) {
    alerts.unshift({
      id: `al_${Date.now()}_workspace_summary`,
      type: "workspace_summary",
      severity: "critical",
      scope: "workspace",
      metric: "Funnel health",
      message:
        "One or more creators have critical funnel drops vs workspace benchmarks. Prioritize fixing weakest stages before adding more traffic.",
      createdAt: now,
      read: false,
      creatorId: undefined,
      creatorName: undefined,
      currentValue: undefined,
      comparisonValue: undefined,
      changePct: null,
    });
  }

  return alerts;
}

export function recomputeAlertsFromFunnels(
  funnels: CreatorFunnel[]
): Alert[] {
  const alerts = generateAlertsFromFunnels(funnels);
  saveAllAlerts(alerts);
  return alerts;
}

export function getAlerts(): Alert[] {
  const alerts = loadAllAlerts();
  return alerts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function markAlertRead(id: string): Alert | null {
  const alerts = loadAllAlerts();
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  alerts[idx] = { ...alerts[idx], read: true };
  saveAllAlerts(alerts);
  return alerts[idx];
}

export function markAllAlertsRead(): void {
  const alerts = loadAllAlerts().map((a) => ({ ...a, read: true }));
  saveAllAlerts(alerts);
}
