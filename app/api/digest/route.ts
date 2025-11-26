import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/alerts";
import { getActiveFunnels } from "@/lib/funnelStore";

export const runtime = "nodejs";

export async function GET() {
  const alerts = getAlerts();
  const funnels = getActiveFunnels();

  const digests = funnels.map((f) => {
    const creatorAlerts = alerts.filter(
      (a) => a.creatorId === f.creatorId && !a.read
    );

    const lines: string[] = [];

    lines.push(`Creator: ${f.creatorName}`);

    const revenue = f.revenueByPlatform.reduce(
      (sum, p) => sum + (p.revenue ?? 0),
      0
    );
    const orders = f.revenueByPlatform.reduce(
      (sum, p) => sum + (p.orders ?? 0),
      0
    );
    const clicks = f.revenueByPlatform.reduce(
      (sum, p) => sum + (p.clicks ?? 0),
      0
    );

    lines.push(
      `Revenue: $${revenue.toLocaleString()} · Orders: ${orders.toLocaleString()} · Clicks: ${clicks.toLocaleString()}`
    );

    const critical = creatorAlerts.filter((a) => a.severity === "critical");
    const warnings = creatorAlerts.filter((a) => a.severity === "warning");

    if (critical.length) {
      lines.push("");
      lines.push("🚨 Critical issues:");
      critical.slice(0, 2).forEach((a) =>
        lines.push(`- ${a.metric}: ${a.message}`)
      );
    }

    if (warnings.length) {
      lines.push("");
      lines.push("⚠️ Warnings:");
      warnings.slice(0, 2).forEach((a) =>
        lines.push(`- ${a.metric}: ${a.message}`)
      );
    }

    return {
      creatorId: f.creatorId,
      creatorName: f.creatorName,
      alertCount: creatorAlerts.length,
      text: lines.join("\n"),
    };
  });

  return NextResponse.json({
    digests,
    totalAlerts: alerts.filter((a) => !a.read).length,
  });
}
