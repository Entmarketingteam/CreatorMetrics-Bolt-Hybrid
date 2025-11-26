import { notFound } from "next/navigation";
import { getActiveFunnels } from "@/lib/funnelStore";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const funnels = getActiveFunnels();
  const productId = decodeURIComponent(params.id);

  const hits = funnels
    .flatMap((f) =>
      ((f as any).products || []).map((p: any) => ({ ...p, creator: f.creatorName }))
    )
    .filter((p: any) => p.productId === productId);

  if (!hits.length) return notFound();

  const total = hits.reduce(
    (acc: any, p: any) => {
      acc.clicks += p.clicks;
      acc.orders += p.orders;
      acc.revenue += p.revenue;
      return acc;
    },
    { clicks: 0, orders: 0, revenue: 0 }
  );

  const totalConv = total.clicks > 0 ? (total.orders / total.clicks) * 100 : 0;

  return (
    <div>
      <h1 className="cm-section-title">{hits[0].title}</h1>
      <p className="cm-section-subtitle">
        Product performance across creators & platforms.
      </p>

      <div className="cm-metrics-row" style={{ marginTop: 14 }}>
        <div className="cm-card">
          <div className="cm-card-label">Total Revenue</div>
          <div className="cm-card-value">
            ${total.revenue.toLocaleString()}
          </div>
        </div>
        <div className="cm-card">
          <div className="cm-card-label">Orders</div>
          <div className="cm-card-value">{total.orders}</div>
        </div>
        <div className="cm-card">
          <div className="cm-card-label">Clicks</div>
          <div className="cm-card-value">{total.clicks}</div>
        </div>
        <div className="cm-card">
          <div className="cm-card-label">Conversion Rate</div>
          <div className="cm-card-value">{totalConv.toFixed(1)}%</div>
        </div>
      </div>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-title">Creator Breakdown</div>
        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Platform</th>
                <th>Clicks</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Conv%</th>
              </tr>
            </thead>
            <tbody>
              {hits.map((p: any, idx: number) => (
                <tr key={`${p.creator}_${idx}`}>
                  <td>{p.creator}</td>
                  <td>{p.platform.toUpperCase()}</td>
                  <td>{p.clicks}</td>
                  <td>{p.orders}</td>
                  <td>${p.revenue.toLocaleString()}</td>
                  <td>{(p.conversionRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
