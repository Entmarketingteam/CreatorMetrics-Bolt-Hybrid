import { NextResponse } from "next/server";
import { generateAlertsSummary } from "@/lib/alerts";

export const runtime = "nodejs";

export async function GET() {
  const summary = generateAlertsSummary();

  const digests = summary.creators.map((c) => {
    const lines: string[] = [];

    lines.push(
      `Creator: ${c.creatorName} · Health: ${c.health.label} (${c.health.score}/100)`
    );
    lines.push(
      `Revenue: $${c.totalRevenue.toLocaleString()} · Orders: ${c.totalOrders.toLocaleString()} · Clicks: ${c.totalClicks.toLocaleString()}`
    );

    const highAlerts = c.alerts.filter((a) => a.severity === "high");
    const medAlerts = c.alerts.filter((a) => a.severity === "medium");

    if (highAlerts.length) {
      lines.push("");
      lines.push("⚠️ Priority issues:");
      highAlerts.slice(0, 2).forEach((a) =>
        lines.push(`- ${a.title}: ${a.message}`)
      );
    }

    if (medAlerts.length) {
      lines.push("");
      lines.push("🟡 Watch items:");
      medAlerts.slice(0, 2).forEach((a) =>
        lines.push(`- ${a.title}: ${a.message}`)
      );
    }

    if (c.opportunities.length) {
      lines.push("");
      lines.push("💡 Top opportunity to act on next:");
      const topOpp =
        c.opportunities.find((o) => o.impact === "high") ??
        c.opportunities[0];
      if (topOpp) {
        lines.push(`- ${topOpp.title}: ${topOpp.description}`);
      }
    }

    return {
      creatorId: c.creatorId,
      creatorName: c.creatorName,
      health: c.health,
      text: lines.join("\n"),
    };
  });

  return NextResponse.json({
    mode: summary.mode,
    hasReal: summary.hasReal,
    digests,
  });
}
