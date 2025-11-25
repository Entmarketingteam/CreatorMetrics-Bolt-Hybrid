export type LtkProductMetric = {
  productName: string;
  brand: string;
  clicks?: number;
  itemsSold?: number;
  revenue?: number;
};

export type LtkEarningRow = {
  date: string;
  brand: string;
  product: string;
  link: string;
  commission: number;
};

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };

  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim());
  const rows = lines.slice(1).map((line) =>
    line
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((cell) => cell.replace(/^"|"$/g, "").trim())
  );
  return { headers, rows };
}

export function parseLtkAnalyticsCsv(text: string): LtkProductMetric[] {
  const { headers, rows } = parseCsv(text);
  if (!headers.length) return [];

  const indexOf = (frag: string) =>
    headers.findIndex((h) => h.toLowerCase().includes(frag.toLowerCase()));

  const idxProductName = indexOf("product_name");
  const idxBrand = indexOf("advertiser_name");
  const idxClicks = indexOf("click");
  const idxItemsSold = indexOf("items_sold");
  const idxRevenue = indexOf("commission") !== -1
    ? indexOf("commission")
    : indexOf("earnings");

  return rows
    .map((row) => {
      const get = (idx: number) => (idx === -1 ? "" : row[idx] ?? "");
      const num = (idx: number) => {
        const v = get(idx).replace(/[$,]/g, "");
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };

      const productName = get(idxProductName);
      const brand = get(idxBrand);
      if (!productName && !brand) return null;

      return {
        productName,
        brand,
        clicks: num(idxClicks),
        itemsSold: num(idxItemsSold),
        revenue: num(idxRevenue),
      } as LtkProductMetric;
    })
    .filter(Boolean) as LtkProductMetric[];
}

export function parseLtkEarningsCsv(text: string): LtkEarningRow[] {
  const { headers, rows } = parseCsv(text);
  if (!headers.length) return [];

  const indexOf = (frag: string) =>
    headers.findIndex((h) => h.toLowerCase().includes(frag.toLowerCase()));

  const idxDate = indexOf("date");
  const idxBrand = indexOf("brand");
  const idxProduct = indexOf("product");
  const idxLink = indexOf("direct to retailer");
  const idxCommission = indexOf("commission");

  return rows
    .map((row) => {
      const get = (idx: number) => (idx === -1 ? "" : row[idx] ?? "");
      const num = (idx: number) => {
        const v = get(idx).replace(/[$,]/g, "");
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      };

      const brand = get(idxBrand);
      if (!brand) return null;

      return {
        date: get(idxDate),
        brand,
        product: get(idxProduct),
        link: get(idxLink),
        commission: num(idxCommission),
      } as LtkEarningRow;
    })
    .filter(Boolean) as LtkEarningRow[];
}
