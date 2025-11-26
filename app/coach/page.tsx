"use client";

import { useEffect, useState } from "react";

type StageRates = {
  impToClick: number;
  clickToDpv: number;
  dpvToAtc: number;
  atcToOrder: number;
};

type CoachAction = {
  stage: "top" | "mid" | "detail" | "checkout" | "global";
  severity: "high" | "medium" | "low";
  summary: string;
};

type CreatorCoachReport = {
  creatorId: string;
  creatorName: string;
  healthScore: number;
  stageRates: StageRates;
  biggestDropStage: string | null;
  actions: CoachAction[];
};

type WorkspaceMeta = {
  averages: StageRates;
  totalCreators: number;
};

type CoachResponse = {
  scope: "workspace" | "creator";
  workspace: WorkspaceMeta | null;
  reports: CreatorCoachReport[];
};

type CreatorMeta = {
  id: string;
  name: string;
  handle?: string;
};

function pct(x: number): string {
  if (!Number.isFinite(x)) return "0.0%";
  return `${(x * 100).toFixed(1)}%`;
}

export default function CoachPage() {
  const [mode, setMode] = useState<"workspace" | "creator">("workspace");
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<CreatorMeta[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/creators");
        if (!res.ok) return;
        const json = await res.json();
        const list = (json.creators ?? []) as CreatorMeta[];
        setCreators(list);
        if (list.length && !selectedCreatorId) {
          setSelectedCreatorId(list[0].id);
        }
      } catch {
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/coach");
        if (!res.ok) return;
        const json = (await res.json()) as CoachResponse;
        setCoach(json);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadCreatorCoach(id: string) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/coach?creatorId=${encodeURIComponent(id)}`);
      if (!res.ok) return;
      const json = (await res.json()) as CoachResponse;
      setCoach(json);
    } finally {
      setLoading(false);
    }
  }

  const workspace = coach?.workspace ?? null;
  const reports = coach?.reports ?? [];

  return (
    <div>
      <h1 className="cm-section-title">Funnel coach</h1>
      <p className="cm-section-subtitle">
        Stage-aware suggestions based on funnel health, benchmarks, and drop-offs.
      </p>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="cm-ghost-button cm-ghost-button-strong"
          style={{
            opacity: mode === "workspace" ? 1 : 0.6,
          }}
          onClick={() => {
            setMode("workspace");
            (async () => {
              setLoading(true);
              try {
                const res = await fetch("/api/coach");
                if (!res.ok) return;
                const json = (await res.json()) as CoachResponse;
                setCoach(json);
              } finally {
                setLoading(false);
              }
            })();
          }}
        >
          Workspace view
        </button>
        <button
          type="button"
          className="cm-ghost-button"
          style={{
            opacity: mode === "creator" ? 1 : 0.6,
          }}
          onClick={() => {
            setMode("creator");
            if (selectedCreatorId) {
              loadCreatorCoach(selectedCreatorId);
            }
          }}
        >
          Single creator
        </button>

        {mode === "creator" && creators.length > 0 && (
          <select
            className="cm-login-input"
            style={{ maxWidth: 260 }}
            value={selectedCreatorId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedCreatorId(id);
              loadCreatorCoach(id);
            }}
          >
            {creators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.handle ? `(${c.handle})` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <p className="cm-section-subtitle" style={{ marginTop: 12 }}>
          Crunching funnels and benchmarks…
        </p>
      )}

      {!loading && mode === "workspace" && workspace && (
        <>
          <div className="cm-panel" style={{ marginTop: 16 }}>
            <div className="cm-panel-header">
              <div>
                <div className="cm-panel-title">Workspace benchmarks</div>
                <div className="cm-panel-subtitle">
                  Average conversion rates across {workspace.totalCreators} creator
                  {workspace.totalCreators === 1 ? "" : "s"}.
                </div>
              </div>
            </div>

            <div className="cm-metrics-row" style={{ marginTop: 12 }}>
              <div className="cm-card">
                <div className="cm-card-label">Impressions → Clicks</div>
                <div className="cm-card-value">
                  {pct(workspace.averages.impToClick)}
                </div>
              </div>
              <div className="cm-card">
                <div className="cm-card-label">Clicks → DPV</div>
                <div className="cm-card-value">
                  {pct(workspace.averages.clickToDpv)}
                </div>
              </div>
              <div className="cm-card">
                <div className="cm-card-label">DPV → ATC</div>
                <div className="cm-card-value">
                  {pct(workspace.averages.dpvToAtc)}
                </div>
              </div>
              <div className="cm-card">
                <div className="cm-card-label">ATC → Orders</div>
                <div className="cm-card-value">
                  {pct(workspace.averages.atcToOrder)}
                </div>
              </div>
            </div>
          </div>

          <div className="cm-panel" style={{ marginTop: 16 }}>
            <div className="cm-panel-header">
              <div>
                <div className="cm-panel-title">Creator priority list</div>
                <div className="cm-panel-subtitle">
                  Sorted by health score (lowest first). Start at the top.
                </div>
              </div>
            </div>

            {reports.length === 0 ? (
              <p className="cm-section-subtitle" style={{ marginTop: 10 }}>
                No creators found. Upload data to generate funnels.
              </p>
            ) : (
              <div className="cm-table-wrap">
                <table className="cm-table">
                  <thead>
                    <tr>
                      <th>Creator</th>
                      <th>Health</th>
                      <th>Main suggestion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => {
                      const mainAction = r.actions[0];
                      return (
                        <tr key={r.creatorId}>
                          <td>{r.creatorName}</td>
                          <td>{r.healthScore}/100</td>
                          <td>{mainAction?.summary ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!loading && mode === "creator" && reports.length > 0 && (
        <>
          {reports.map((r) => (
            <div key={r.creatorId} style={{ marginTop: 16 }}>
              <div className="cm-panel">
                <div className="cm-panel-header">
                  <div>
                    <div className="cm-panel-title">
                      {r.creatorName} – Funnel coach
                    </div>
                    <div className="cm-panel-subtitle">
                      Health score {r.healthScore}/100 · Biggest drop:{" "}
                      {r.biggestDropStage ?? "n/a"}
                    </div>
                  </div>
                </div>

                <div
                  className="cm-metrics-row"
                  style={{ marginTop: 12, flexWrap: "wrap" }}
                >
                  <div className="cm-card cm-creator-kpi-card">
                    <div className="cm-card-label">Imp → Click</div>
                    <div className="cm-card-value">
                      {pct(r.stageRates.impToClick)}
                    </div>
                  </div>
                  <div className="cm-card cm-creator-kpi-card">
                    <div className="cm-card-label">Click → DPV</div>
                    <div className="cm-card-value">
                      {pct(r.stageRates.clickToDpv)}
                    </div>
                  </div>
                  <div className="cm-card cm-creator-kpi-card">
                    <div className="cm-card-label">DPV → ATC</div>
                    <div className="cm-card-value">
                      {pct(r.stageRates.dpvToAtc)}
                    </div>
                  </div>
                  <div className="cm-card cm-creator-kpi-card">
                    <div className="cm-card-label">ATC → Orders</div>
                    <div className="cm-card-value">
                      {pct(r.stageRates.atcToOrder)}
                    </div>
                  </div>
                </div>

                <div className="cm-creator-highlights" style={{ marginTop: 16 }}>
                  <div
                    className="cm-panel-title"
                    style={{ marginBottom: 4 }}
                  >
                    Prioritized actions
                  </div>
                  <ul className="cm-creator-highlights-list">
                    {r.actions.map((a, idx) => (
                      <li key={idx}>
                        <strong>
                          {a.stage === "top"
                            ? "Top-of-funnel"
                            : a.stage === "mid"
                            ? "Click routing"
                            : a.stage === "detail"
                            ? "Detail page"
                            : a.stage === "checkout"
                            ? "Checkout"
                            : "Overall strategy"}
                          {" · "}
                          {a.severity === "high"
                            ? "High priority"
                            : a.severity === "medium"
                            ? "Medium priority"
                            : "Low priority"}
                          :
                        </strong>{" "}
                        {a.summary}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
