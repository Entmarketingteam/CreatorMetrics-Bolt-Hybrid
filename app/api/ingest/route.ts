import { NextRequest, NextResponse } from "next/server";
import {
  parseInstagramCsv,
  InstagramPostMetric,
} from "@/functions/ingest/instagram";
import {
  parseLtkAnalyticsCsv,
  parseLtkEarningsCsv,
  LtkProductMetric,
  LtkEarningRow,
} from "@/functions/ingest/ltk";
import {
  parseAmazonFeeZip,
  AmazonItemMetric,
} from "@/functions/ingest/amazon";
import { buildCreatorFunnelFromRaw } from "@/functions/ingest/funnel_builder";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const igPosts: InstagramPostMetric[] = [];
  const ltkProducts: LtkProductMetric[] = [];
  const ltkEarnings: LtkEarningRow[] = [];
  const amazonItems: AmazonItemMetric[] = [];

  for (const file of files) {
    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      if (name.includes("instagram") && name.endsWith(".csv")) {
        igPosts.push(...parseInstagramCsv(buffer.toString("utf-8")));
      } else if (name.includes("ltk") && name.includes("analytics") && name.endsWith(".csv")) {
        ltkProducts.push(...parseLtkAnalyticsCsv(buffer.toString("utf-8")));
      } else if (name.includes("earnings") && name.includes("ltk") && name.endsWith(".csv")) {
        ltkEarnings.push(...parseLtkEarningsCsv(buffer.toString("utf-8")));
      } else if (name.startsWith("fee-") && name.endsWith(".zip")) {
        amazonItems.push(...(await parseAmazonFeeZip(buffer, name)));
      } else {
        console.warn("Unrecognized file, skipping:", name);
      }
    } catch (err) {
      console.error("Error parsing", name, err);
    }
  }

  const creatorFunnels = buildCreatorFunnelFromRaw({
    igPosts,
    ltkProducts,
    ltkEarnings,
    amazonItems,
  });

  return NextResponse.json({
    igPosts: igPosts.length,
    ltkProducts: ltkProducts.length,
    ltkEarningsRows: ltkEarnings.length,
    amazonItems: amazonItems.length,
    creatorFunnels,
  });
}
