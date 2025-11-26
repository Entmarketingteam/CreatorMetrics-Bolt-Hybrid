import { DetectedPlatform } from "./schemaDetector";

export type NormalizedRow = {
  creator: string | null;
  productId: string | null;
  clicks: number;
  dpv: number;
  atc: number;
  orders: number;
  revenue: number;
  platform: DetectedPlatform;
  raw: Record<string, any>;
};

export type ColumnMapping = {
  creatorCol?: string;
  productIdCol?: string;
  clicksCol?: string;
  dpvCol?: string;
  atcCol?: string;
  ordersCol?: string;
  revenueCol?: string;
};

export type ColumnMappingWithConfidence = ColumnMapping & {
  confidence: number;
  perColumnConfidence: Record<string, number>;
};

function findBestColumn(
  columns: string[],
  candidates: string[]
): { col?: string; score: number } {
  const cols = columns.map((c) => c.toLowerCase());
  let best: { col?: string; score: number } = { col: undefined, score: 0 };

  for (const col of columns) {
    const lc = col.toLowerCase();
    let score = 0;
    for (const cand of candidates) {
      if (lc === cand) score = Math.max(score, 1);
      else if (lc.includes(cand)) score = Math.max(score, 0.7);
    }
    if (score > best.score) {
      best = { col, score };
    }
  }

  return best;
}

export function inferColumnMapping(
  columns: string[]
): ColumnMappingWithConfidence {
  const creator = findBestColumn(columns, [
    "creator",
    "influencer",
    "publisher",
    "handle",
    "creator_name",
  ]);
  const productId = findBestColumn(columns, ["asin", "sku", "product", "product_id"]);
  const clicks = findBestColumn(columns, [
    "click",
    "clicks",
    "sessions",
    "click_through",
  ]);
  const dpv = findBestColumn(columns, [
    "detail_page_view",
    "detail page view",
    "dpv",
    "pageview",
    "page_view",
  ]);
  const atc = findBestColumn(columns, [
    "add_to_cart",
    "add to cart",
    "atc",
    "adds to cart",
  ]);
  const orders = findBestColumn(columns, [
    "order",
    "orders",
    "purchases",
    "units ordered",
  ]);
  const revenue = findBestColumn(columns, [
    "revenue",
    "earnings",
    "commission",
    "amount",
  ]);

  const perColumnConfidence: Record<string, number> = {
    creator: creator.score,
    productId: productId.score,
    clicks: clicks.score,
    dpv: dpv.score,
    atc: atc.score,
    orders: orders.score,
    revenue: revenue.score,
  };

  const scores = Object.values(perColumnConfidence);
  const nonZero = scores.filter((s) => s > 0);
  const avg = nonZero.length
    ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
    : 0;

  return {
    creatorCol: creator.col,
    productIdCol: productId.col,
    clicksCol: clicks.col,
    dpvCol: dpv.col,
    atcCol: atc.col,
    ordersCol: orders.col,
    revenueCol: revenue.col,
    confidence: Math.min(1, avg),
    perColumnConfidence,
  };
}

function toNumberSafe(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.\-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function applyColumnMappingToRows(
  rows: Record<string, any>[],
  mapping: ColumnMappingWithConfidence,
  platform: DetectedPlatform
): NormalizedRow[] {
  return rows.map((raw) => {
    const get = (key?: string) =>
      key ? (raw[key] ?? raw[key.toLowerCase()] ?? null) : null;

    const creatorVal = get(mapping.creatorCol);
    const productIdVal = get(mapping.productIdCol);

    const clicksVal = toNumberSafe(get(mapping.clicksCol));
    const dpvVal = toNumberSafe(get(mapping.dpvCol));
    const atcVal = toNumberSafe(get(mapping.atcCol));
    const ordersVal = toNumberSafe(get(mapping.ordersCol));
    const revenueVal = toNumberSafe(get(mapping.revenueCol));

    return {
      creator: creatorVal ? String(creatorVal) : null,
      productId: productIdVal ? String(productIdVal) : null,
      clicks: clicksVal,
      dpv: dpvVal,
      atc: atcVal,
      orders: ordersVal,
      revenue: revenueVal,
      platform,
      raw,
    };
  });
}
