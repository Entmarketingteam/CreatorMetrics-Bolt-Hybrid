export default function DashboardLoading() {
  return (
    <div>
      <h1 className="cm-section-title">Dashboard</h1>
      <p className="cm-section-subtitle">Loading your funnels…</p>
      <div className="cm-panel" style={{ marginTop: 16 }}>
        <div className="cm-panel-title">Loading summary…</div>
        <div className="cm-metrics-row" style={{ marginTop: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="cm-card" key={i}>
              <div className="cm-card-label"> </div>
              <div
                style={{
                  height: 18,
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#111827,#1f2937,#111827)",
                  backgroundSize: "200% 100%",
                  animation: "cm-shimmer 1.2s linear infinite",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
