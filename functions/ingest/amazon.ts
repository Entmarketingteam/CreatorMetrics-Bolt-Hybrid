import { parseStringPromise } from "xml2js";

export type AmazonItemMetric = {
  asin: string;
  revenue: number;
  adFees: number;
  itemsShipped: number;
  trackingId: string;
  category?: string;
  dateShipped?: string;
  title?: string;
};

export async function parseAmazonFeeZip(
  zipBuffer: Buffer,
  filename: string
): Promise<AmazonItemMetric[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(zipBuffer);
  const [entryName] = Object.keys(zip.files);
  const xmlText = await zip.files[entryName].async("text");

  const parsed = await parseStringPromise(xmlText, { explicitArray: false });
  const items = parsed?.Data?.Items?.Item;
  if (!items) return [];

  const array = Array.isArray(items) ? items : [items];

  return array.map((item: any): AmazonItemMetric => {
    const attrs = item.$ || item;
    const num = (field: string) => {
      const v = attrs[field];
      if (v == null) return 0;
      const n = Number(String(v).replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    };

    return {
      asin: attrs.ASIN,
      revenue: num("Revenue"),
      adFees: num("AdFees"),
      itemsShipped: num("ItemsShipped"),
      trackingId: attrs.TrackingID,
      category: attrs.Category,
      dateShipped: attrs.DateShipped,
      title: attrs.title,
    };
  });
}
