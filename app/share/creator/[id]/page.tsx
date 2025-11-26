import { notFound } from "next/navigation";
import { getShare } from "@/lib/shares";
import { getFunnelByCreatorId } from "@/lib/funnelStore";
import { getCreatorById } from "@/lib/demoData";
import FunnelChart from "@/components/FunnelChart";

export default function SharedCreatorPage({ params }: { params: { id: string } }) {
  const share = getShare(params.id);
  if (!share) return notFound();

  const funnel = getFunnelByCreatorId(share.creatorId);
  if (!funnel) return notFound();

  const creatorMeta = getCreatorById(funnel.creatorId);
  const name = creatorMeta?.name ?? funnel.creatorName;

  const totalRevenue = funnel.revenueByPlatform.reduce(
    (s, r) => s + (r.revenue ?? 0),
    0
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1 className="cm-section-title">
        {name} · Creator Report
      </h1>
      <p className="cm-section-subtitle">
        Read-only share link generated from CreatorMetrics.
      </p>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Funnel</div>
            <div className="cm-panel-subtitle">
              IG → LTK → Amazon funnel snapshot.
            </div>
          </div>
        </div>
        <FunnelChart funnel={funnel.funnel} />
      </div>

      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-header">
          <div>
            <div className="cm-panel-title">Summary</div>
            <div className="cm-panel-subtitle">
              High-level view of performance for this period.
            </div>
          </div>
        </div>
        <p
          className="cm-section-subtitle"
          style={{ marginTop: 10, fontSize: 13 }}
        >
          Total revenue this period: ${totalRevenue.toLocaleString()}
        </p>
      </div>

      <p
        style={{
          marginTop: 20,
          fontSize: 11,
          color: "#6b7280",
          textAlign: "right",
        }}
      >
        Powered by CreatorMetrics
      </p>
    </div>
  );
}
