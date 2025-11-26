import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const files = (body.files as { name: string; columns: string[] }[]) ?? [];

  const suggestions: string[] = [];

  files.forEach((f) => {
    if (!f.columns.length) {
      suggestions.push(
        `File "${f.name}" has no detected columns. Make sure it's a CSV export, not an XLSX screenshot.`
      );
      return;
    }

    const colsLower = f.columns.map((c) => c.toLowerCase());

    if (!colsLower.some((c) => c.includes("creator") || c.includes("influencer"))) {
      suggestions.push(
        `File "${f.name}" is missing a clear creator column. Add a "creator_name" column if possible.`
      );
    }
    if (!colsLower.some((c) => c.includes("click"))) {
      suggestions.push(
        `File "${f.name}" has no click metrics. For funnels, include "clicks" or "sessions".`
      );
    }
    if (!colsLower.some((c) => c.includes("order") || c.includes("purchases"))) {
      suggestions.push(
        `File "${f.name}" has no order/purchase column. Add "orders" or "purchases" so we can build funnels.`
      );
    }
  });

  if (!suggestions.length) {
    suggestions.push(
      "All files look structurally OK. If something is off, try checking date ranges or making sure platforms match (IG / LTK / Amazon)."
    );
  }

  return NextResponse.json({ suggestions });
}
