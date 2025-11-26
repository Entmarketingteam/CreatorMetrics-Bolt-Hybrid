"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FunnelChart from "@/components/FunnelChart";

export default function CreatorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/creators/${params.id}`);
        if (!res.ok) {
          setData(null);
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div>
        <h1 className="cm-section-title">Loading creator…</h1>
      </div>
    );
  }

  if (!data || !data.funnel) {
    return (
      <div>
        <h1 className="cm-section-title">Creator not found</h1>
      </div>
    );
  }

  const funnel = data.funnel;
  const creatorMeta = data.creatorMeta;
  const name = creatorMeta?.name ?? funnel.creatorName;
  const handle = (creatorMeta as any)?.handle ?? "";
  const avatarInitials =
    creatorMeta?.name
      ?.split(" ")
      .map((x: string) => x[0])
      .join("")
      .toUpperCase() ?? "CR";

  const totalRevenue = funnel.revenueByPlatform.reduce(
    (sum: number, r: any) => sum + (r.revenue ?? 0),
    0
  );
  const totalOrders = funnel.revenueByPlatform.reduce(
    (sum: number, r: any) => sum + (r.orders ?? 0),
    0
  );
  const totalClicks = funnel.revenueByPlatform.reduce(
    (sum: number, r: any) => sum + (r.clicks ?? 0),
    0
  );

  const bestPlatform =
    funnel.revenueByPlatform.length > 0
      ? [...funnel.revenueByPlatform].sort(
          (a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)
        )[0]
      : null;

  const worstPlatform =
    funnel.revenueByPlatform.length > 0
      ? [...funnel.revenueByPlatform].sort(
          (a, b) => (a.revenue ?? 0) - (b.revenue ?? 0)
        )[0]
      : null;

  let biggestDropStage: {
    stage: string;
    fromValue: number;
    toValue: number;
    dropPct: number;
  } | null = null;

  const stages = funnel.funnel ?? [];
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1];
    const curr = stages[i];
    const prevVal = prev?.value ?? 0;
    const currVal = curr?.value ?? 0;
    if (prevVal <= 0) continue;
    const dropPct = (prevVal - currVal) / prevVal;

    if (!biggestDropStage || dropPct > biggestDropStage.dropPct) {
      biggestDropStage = {
        stage: curr.stage,
        fromValue: prevVal,
        toValue: currVal,
        dropPct,
      };
    }
  }

  const impressions =
    stages.find((s: any) => s.stage.toLowerCase() === "impressions")?.value ?? 0;
  const clicksStage =
    stages.find((s: any) => s.stage.toLowerCase() === "clicks")?.value ?? 0;
  const dpvStage =
    stages.find((s: any) => s.stage.toLowerCase() === "dpv")?.value ?? 0;
  const atcStage =
    stages.find((s: any) => s.stage.toLowerCase() === "atc")?.value ?? 0;
  const ordersStage =
    stages.find((s: any) => s.stage.toLowerCase() === "orders")?.value ?? 0;

  const impToClick = impressions > 0 ? clicksStage / impressions : 0;
  const clickToDpv = clicksStage > 0 ? dpvStage / clicksStage : 0;
  const dpvToAtc = dpvStage > 0 ? atcStage / dpvStage : 0;
  const atcToOrder = atcStage > 0 ? ordersStage / atcStage : 0;

  function clamp01(x: number) {
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.min(1, x));
  }

  const targetImpToClick = 0.02;
  const targetClickToDpv = 0.5;
  const targetDpvToAtc = 0.1;
  const targetAtcToOrder = 0.4;

  const scoreImpToClick = clamp01(impToClick / targetImpToClick);
  const scoreClickToDpv = clamp01(clickToDpv / targetClickToDpv);
  const scoreDpvToAtc = clamp01(dpvToAtc / targetDpvToAtc);
  const scoreAtcToOrder = clamp01(atcToOrder / targetAtcToOrder);

  const rawHealth =
    (scoreImpToClick * 0.2 +
      scoreClickToDpv * 0.2 +
      scoreDpvToAtc * 0.3 +
      scoreAtcToOrder * 0.3) /
    (0.2 + 0.2 + 0.3 + 0.3);

  const creatorHealthScore = Math.round(clamp01(rawHealth) * 100);

  function humanStageLabel(stage: string) {
    switch (stage.toLowerCase()) {
      case "impressions":
        return "Impressions";
      case "clicks":
        return "Clicks";
      case "dpv":
        return "Detail page views";
      case "atc":
        return "Add to cart";
      case "orders":
        return "Orders";
      default:
        return stage;
    }
  }

  const highlightLines: string[] = [];

  if (bestPlatform) {
    highlightLines.push(
      `• Strongest channel: ${bestPlatform.platform.toUpperCase()} with $${bestPlatform.revenue.toLocaleString()} in revenue.`
    );
  }

  if (biggestDropStage) {
    const pct = (biggestDropStage.dropPct * 100).toFixed(1);
    highlightLines.push(
      `• Biggest funnel drop: ${humanStageLabel(
        biggestDropStage.stage
      )} (–${pct}% from previous stage).`
    );
  }

  if (totalRevenue === 0) {
    highlightLines.push(
      "• Revenue is low or zero this period. Start by verifying tracking and then seeding a few hero posts."
    );
  } else if (totalRevenue > 0 && totalClicks > 0) {
    const rpc = totalRevenue / totalClicks;
    highlightLines.push(
      `• Revenue per click: ~$${rpc.toFixed(
        2
      )}. Use this as a benchmark when buying paid media or comparing creators.`
    );
  }

  if (creatorHealthScore >= 80) {
    highlightLines.push(
      "• Overall funnel health is strong. This creator can likely handle more paid amplification or brand partnerships without breaking the funnel."
    );
  } else if (creatorHealthScore <= 50) {
    highlightLines.push(
      "• Funnel health is under 50/100. Focus your next experiments on the weakest stage first instead of just adding more traffic."
    );
  }

  if (!highlightLines.length) {
    highlightLines.push(
      "• Funnel looks balanced. Next step is simply to drive more qualified traffic into the same flow."
    );
  }

  return (
    <div>
      <div className="cm-breadcrumb">
        <Link href="/creators" className="cm-breadcrumb-link">
          ← Back to all creators
        </Link>
      </div>

      <div className="cm-panel cm-creator-header-panel">
        <div className="cm-creator-header-left">
          <div className="cm-creator-avatar cm-creator-avatar-lg">
            <span>{avatarInitials}</span>
          </div>
          <div>
            <h1 className="cm-section-title" style={{ marginBottom: 4 }}>
              {name}
            </h1>
            {handle && (
              <div className="cm-creator-handle cm-creator-handle-lg">
                {handle}
              </div>
            )}
            <p className="cm-section-subtitle">
              Unified IG → LTK → Amazon funnel performance for this creator.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button
            type="button"
            className="cm-ghost-button"
            onClick={async () => {
              try {
                const res = await fetch("/api/shares", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ creatorId: funnel.creatorId }),
                });

                if (!res.ok) {
                  alert("Could not create share link.");
                  return;
                }

                const share = await res.json();
                const url = `${window.location.origin}/share/creator/${share.id}`;
                await navigator.clipboard.writeText(url);
                alert("Shareable report link copied to clipboard.");
              } catch (err) {
                console.error(err);
                alert("Could not create share link.");
              }
            }}
          >
            Share report
          </button>
        </div>

        <div className="cm-creator-kpi-row">
          <div className="cm-card cm-creator-kpi-card">
            <div className="cm-card-label">Revenue (period)</div>
            <div className="cm-card-value">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="cm-card cm-creator-kpi-card">
            <div className="cm-card-label">Orders</div>
            <div className="cm-card-value">
              {totalOrders.toLocaleString()}
            </div>
          </div>
          <div className="cm-card cm-creator-kpi-card">
            <div className="cm-card-label">Clicks</div>
            <div className="cm-card-value">
              {totalClicks.toLocaleString()}
            </div>
          </div>
          <div className="cm-card cm-creator-kpi-card">
            <div className="cm-card-label">Creator health score</div>
            <div className="cm-card-value">
              {creatorHealthScore}/100
            </div>
          </div>
        </div>
      </div>

      <div className="cm-creator-layout">
        <section className="cm-panel">
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Funnel</div>
              <div className="cm-panel-subtitle">
                Normalized IG → LTK → Amazon funnel for this creator.
              </div>
            </div>
          </div>

          <FunnelChart funnel={funnel.funnel} />
        </section>

        <section className="cm-panel">
          <div className="cm-panel-header">
            <div>
              <div className="cm-panel-title">Platform mix</div>
              <div className="cm-panel-subtitle">
                Revenue, orders, and clicks by platform.
              </div>
            </div>
          </div>

          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Clicks</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {funnel.revenueByPlatform.map((p: any) => {
                  const rev = p.revenue ?? 0;
                  const share =
                    totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
                  return (
                    <tr key={p.platform}>
                      <td>{p.platform.toUpperCase()}</td>
                      <td>${rev.toLocaleString()}</td>
                      <td>{(p.orders ?? 0).toLocaleString()}</td>
                      <td>{(p.clicks ?? 0).toLocaleString()}</td>
                      <td>{share.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="cm-creator-highlights">
            <div className="cm-panel-title" style={{ marginBottom: 4 }}>
              Highlights
            </div>
            <ul className="cm-creator-highlights-list">
              {highlightLines.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
