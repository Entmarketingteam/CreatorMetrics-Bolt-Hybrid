import { getActiveFunnels, getMode } from "@/lib/funnelStore";

function pct(num: number) {
  if (!Number.isFinite(num)) return "0.0%";
  return `${(num * 100).toFixed(1)}%`;
}

export default function BenchmarksPage() {
  const funnels = getActiveFunnels();
  const mode = getMode();

  if (!funnels.length) {
    return (
      <div>
        <h1 className="cm-section-title">Benchmarks</h1>
        <p className="cm-section-subtitle">
          No funnels yet. Upload IG / LTK / Amazon exports to generate benchmarks.
        </p>
      </div>
    );
  }

  const rows = funnels.map((f) => {
    const stages = f.funnel ?? [];
    const getStageValue = (stage: string) =>
      stages.find((x) => x.stage.toLowerCase() === stage.toLowerCase())
        ?.value ?? 0;

    const impressions = getStageValue("impressions");
    const clicks = getStageValue("clicks");
    const dpv = getStageValue("dpv");
    const atc = getStageValue("atc");
    const orders = getStageValue("orders");

    const clickRate = impressions > 0 ? clicks / impressions : 0;
    const dpvRate = clicks > 0 ? dpv / clicks : 0;
    const atcRate = dpv > 0 ? atc / dpv : 0;
    const orderRate = atc > 0 ? orders / atc : 0;

    const revenue = (f.revenueByPlatform ?? []).reduce(
      (sum: number, p: any) => sum + (p.revenue ?? 0),
      0
    );
    const rpc = clicks > 0 ? revenue / clicks : 0;

    return {
      creatorId: f.creatorId,
      creatorName: f.creatorName,
      clickRate,
      dpvRate,
      atcRate,
      orderRate,
      rpc,
    };
  });

  const avg = (key: keyof (typeof rows)[number]) =>
    rows.reduce((sum, r) => sum + (r[key] as number), 0) /
    (rows.length || 1);

  const avgClick = avg("clickRate");
  const avgDpv = avg("dpvRate");
  const avgAtc = avg("atcRate");
  const avgOrder = avg("orderRate");
  const avgRpc = avg("rpc");

  return (
    <div>
      <h1 className="cm-section-title">Benchmarks</h1>
      <p className="cm-section-subtitle">
        Compare each creator's funnel to workspace benchmarks (
        {mode === "real" ? "Live data" : "Demo data"}).
      </p>

      {/* Workspace medians */}
      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Workspace medians</div>
            <div className="cm-panel-subtitle">
              Rough averages across all creators in this workspace.
            </div>
          </div>
        </div>

        <div className="cm-metrics-row" style={{ marginTop: 12 }}>
          <div className="cm-card">
            <div className="cm-card-label">Impressions → Clicks</div>
            <div className="cm-card-value">{pct(avgClick)}</div>
          </div>
          <div className="cm-card">
            <div className="cm-card-label">Clicks → DPV</div>
            <div className="cm-card-value">{pct(avgDpv)}</div>
          </div>
          <div className="cm-card">
            <div className="cm-card-label">DPV → ATC</div>
            <div className="cm-card-value">{pct(avgAtc)}</div>
          </div>
          <div className="cm-card">
            <div className="cm-card-label">ATC → Orders</div>
            <div className="cm-card-value">{pct(avgOrder)}</div>
          </div>
          <div className="cm-card">
            <div className="cm-card-label">Revenue per click</div>
            <div className="cm-card-value">
              ${avgRpc.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Creator vs benchmark table */}
      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Creator vs benchmark</div>
            <div className="cm-panel-subtitle">
              See who is above or below workspace averages.
            </div>
          </div>
        </div>

        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Imp → Click</th>
                <th>Click → DPV</th>
                <th>DPV → ATC</th>
                <th>ATC → Order</th>
                <th>RPC</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.creatorId}>
                  <td>{r.creatorName}</td>
                  <td>{pct(r.clickRate)}</td>
                  <td>{pct(r.dpvRate)}</td>
                  <td>{pct(r.atcRate)}</td>
                  <td>{pct(r.orderRate)}</td>
                  <td>${r.rpc.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
