import { getShareById } from "@/lib/shares";
import { getActiveFunnels } from "@/lib/funnelStore";

export default function SharedCreatorReport({
  params,
}: {
  params: { id: string };
}) {
  const share = getShareById(params.id);
  if (!share) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Share link not found</h1>
        <p>This link may be expired or invalid.</p>
      </div>
    );
  }

  const funnels = getActiveFunnels();
  const funnel = funnels.find((f) => f.creatorId === share.creatorId);

  if (!funnel) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Creator data unavailable</h1>
        <p>The workspace has no data for this creator.</p>
      </div>
    );
  }

  const totalRevenue = funnel.revenueByPlatform?.reduce(
    (s, x) => s + (x.revenue ?? 0),
    0
  );

  return (
    <div style={{ padding: 40 }}>
      <h1>{funnel.creatorName}</h1>
      <p style={{ opacity: 0.7 }}>Shared report (read-only)</p>

      <div style={{ marginTop: 24 }}>
        <h2>Revenue</h2>
        <p>${totalRevenue.toLocaleString()}</p>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Funnels</h2>
        <pre>{JSON.stringify(funnel.funnel, null, 2)}</pre>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Platforms</h2>
        <pre>{JSON.stringify(funnel.revenueByPlatform, null, 2)}</pre>
      </div>
    </div>
  );
}
