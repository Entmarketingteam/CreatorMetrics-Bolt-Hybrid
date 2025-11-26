export type OrderEvent = {
  date: string;
  revenue: number;
};

export type DailyPoint = {
  date: string;
  revenue: number;
};

export type ForecastHorizon = 7 | 30 | 90;

export type CreatorForecast = {
  creatorId: string;
  creatorName: string;
  baselineDaily: number;
  trendPerDay: number;
  forecast7: number;
  forecast30: number;
  forecast90: number;
};

function toDayKey(date: string): string {
  return date.slice(0, 10);
}

export function buildDailySeries(events: OrderEvent[]): DailyPoint[] {
  const map = new Map<string, number>();

  for (const e of events) {
    if (!e.date || !Number.isFinite(e.revenue)) continue;
    const key = toDayKey(e.date);
    map.set(key, (map.get(key) ?? 0) + e.revenue);
  }

  const entries = Array.from(map.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return entries.map(([date, revenue]) => ({ date, revenue }));
}

function computeTrend(series: DailyPoint[]): { baseline: number; slope: number } {
  if (!series.length) return { baseline: 0, slope: 0 };

  const n = series.length;
  const xs = series.map((_, idx) => idx);
  const ys = series.map((p) => p.revenue);

  const sumX = xs.reduce((s, x) => s + x, 0);
  const sumY = ys.reduce((s, y) => s + y, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);

  const denom = n * sumX2 - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;

  const tail = series.slice(-7);
  const baseline =
    tail.length > 0
      ? tail.reduce((s, p) => s + p.revenue, 0) / tail.length
      : sumY / n;

  return { baseline, slope };
}

export function forecastRevenueTotal(
  series: DailyPoint[],
  horizon: ForecastHorizon
): { baselineDaily: number; trendPerDay: number; total: number } {
  if (!series.length) {
    return { baselineDaily: 0, trendPerDay: 0, total: 0 };
  }

  const { baseline, slope } = computeTrend(series);

  let total = 0;
  for (let k = 1; k <= horizon; k++) {
    const dayValue = Math.max(0, baseline + slope * k);
    total += dayValue;
  }

  return { baselineDaily: baseline, trendPerDay: slope, total };
}

export function buildCreatorForecast(
  creatorId: string,
  creatorName: string,
  events: OrderEvent[]
): CreatorForecast {
  const series = buildDailySeries(events);

  const f7 = forecastRevenueTotal(series, 7);
  const f30 = forecastRevenueTotal(series, 30);
  const f90 = forecastRevenueTotal(series, 90);

  return {
    creatorId,
    creatorName,
    baselineDaily: f30.baselineDaily,
    trendPerDay: f30.trendPerDay,
    forecast7: f7.total,
    forecast30: f30.total,
    forecast90: f90.total,
  };
}
